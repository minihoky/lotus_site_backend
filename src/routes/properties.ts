import { Hono } from "hono";
import { z } from "zod";
import { createProperty, deleteProperty, getPropertyBySlug, getSimilarProperties, listProperties, listRecentProperties, updateProperty } from "../db/index.js";
import { formatBrazilianPrice, parseBrazilianPrice } from "../lib/price.js";
import { saveUploadedFile } from "../lib/uploads.js";
import type { PropertyBadge, PropertyFeatureIcon } from "../types/property.js";

const badgeSchema = z.enum(["DESTAQUE", "LANÇAMENTO"]);

const featureIconSchema = z.enum([
  "pool",
  "gourmet",
  "security",
  "ac",
  "gym",
  "garden",
  "wifi",
  "parking",
  "elevator",
  "balcony",
]);

const listQuerySchema = z.object({
  q: z.string().optional(),
  badge: badgeSchema.optional(),
  location: z.string().optional(),
  minBeds: z.coerce.number().int().min(0).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(["recent", "price"]).optional(),
});

const recentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

const createPropertyJsonSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter pelo menos 3 caracteres"),
  location: z.string().trim().min(3, "Localização é obrigatória"),
  address: z.string().trim().min(3).optional(),
  badge: badgeSchema.optional(),
  image: z.string().trim().url("URL da imagem de capa inválida"),
  gallery: z.array(z.string().trim().url()).min(1, "Adicione pelo menos uma imagem na galeria"),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().int().min(0),
  parking: z.coerce.number().int().min(0),
  area: z.coerce.number().int().min(1),
  price: z.string().trim().optional(),
  priceValue: z.coerce.number().int().min(1).optional(),
  description: z.union([z.string().trim().min(10), z.array(z.string().trim().min(1)).min(1)]),
  features: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        icon: featureIconSchema,
      }),
    )
    .optional(),
});

function toDescriptionArray(description: string | string[]): string[] {
  if (Array.isArray(description)) return description;
  return description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function defaultFeatures(parking: number): { label: string; icon: PropertyFeatureIcon }[] {
  const features: { label: string; icon: PropertyFeatureIcon }[] = [];
  if (parking > 0) {
    features.push({
      label: parking === 1 ? "1 vaga" : `${parking} vagas`,
      icon: "parking",
    });
  }
  return features;
}

function asFile(value: unknown): File | undefined {
  return value instanceof File && value.size > 0 ? value : undefined;
}

function asFiles(value: unknown): File[] {
  if (value instanceof File && value.size > 0) return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is File => item instanceof File && item.size > 0);
  }
  return [];
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
      }
    } catch {
      return value.length > 0 ? [value] : [];
    }
  }
  return [];
}

async function parsePropertyMultipart(body: Record<string, unknown>, options?: { requireImages?: boolean }) {
  const requireImages = options?.requireImages ?? true;

  const title = String(body.title ?? "").trim();
  const location = String(body.location ?? "").trim();
  const address = String(body.address ?? "").trim() || location;
  const descriptionRaw = String(body.description ?? "").trim();
  const priceRaw = String(body.price ?? "").trim();
  const badgeRaw = String(body.badge ?? "").trim();

  const beds = Number(body.beds);
  const baths = Number(body.baths);
  const parking = Number(body.parking);
  const area = Number(body.area);

  const coverFile = asFile(body.coverImage);
  const galleryFiles = asFiles(body.gallery);
  const existingCoverUrl = String(body.existingCoverUrl ?? "").trim();
  const existingGallery = asStringArray(body.existingGallery);

  const fieldErrors: Record<string, string[]> = {};

  if (title.length < 3) fieldErrors.title = ["Título deve ter pelo menos 3 caracteres"];
  if (location.length < 3) fieldErrors.location = ["Localização é obrigatória"];
  if (descriptionRaw.length < 10) fieldErrors.description = ["Descrição muito curta"];
  if (!Number.isFinite(beds) || beds < 0) fieldErrors.beds = ["Número de quartos inválido"];
  if (!Number.isFinite(baths) || baths < 0) fieldErrors.baths = ["Número de banheiros inválido"];
  if (!Number.isFinite(parking) || parking < 0) fieldErrors.parking = ["Número de vagas inválido"];
  if (!Number.isFinite(area) || area < 1) fieldErrors.area = ["Área inválida"];

  const priceValue = parseBrazilianPrice(priceRaw);
  if (priceValue < 1) fieldErrors.price = ["Preço inválido"];

  let coverImage = existingCoverUrl;
  if (coverFile) {
    coverImage = await saveUploadedFile(coverFile);
  } else if (requireImages && !coverImage) {
    fieldErrors.coverImage = ["Imagem de capa é obrigatória"];
  }

  const galleryUrls = [...existingGallery, ...(await Promise.all(galleryFiles.map((file) => saveUploadedFile(file))))];
  if (requireImages && galleryUrls.length === 0) {
    fieldErrors.gallery = ["Adicione pelo menos uma imagem na galeria"];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: fieldErrors as Record<string, string[]> };
  }

  return {
    data: {
      title,
      location,
      address,
      badge: badgeSchema.safeParse(badgeRaw).success ? (badgeRaw as PropertyBadge) : undefined,
      image: coverImage,
      gallery: galleryUrls,
      beds,
      baths,
      parking,
      area,
      price: formatBrazilianPrice(priceValue),
      priceValue,
      description: toDescriptionArray(descriptionRaw),
      features: defaultFeatures(parking),
    },
  };
}

export const propertiesRouter = new Hono();

propertiesRouter.get("/", (c) => {
  const parsed = listQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, 400);
  }

  const properties = listProperties({
    ...parsed.data,
    badge: parsed.data.badge as PropertyBadge | undefined,
  });

  return c.json({ data: properties, total: properties.length });
});

propertiesRouter.get("/recent", (c) => {
  const parsed = recentQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, 400);
  }

  const properties = listRecentProperties(parsed.data.limit ?? 5);
  return c.json({ data: properties, total: properties.length });
});

propertiesRouter.post("/", async (c) => {
  const contentType = c.req.header("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const body = await c.req.parseBody({ all: true });
      const parsed = await parsePropertyMultipart(body as Record<string, unknown>);

      if ("error" in parsed) {
        return c.json({ error: "Validation failed", details: { fieldErrors: parsed.error } }, 400);
      }

      const property = createProperty(parsed.data);
      return c.json({ data: property }, 201);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const parsed = createPropertyJsonSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const data = parsed.data;
    const priceValue = data.priceValue ?? parseBrazilianPrice(data.price ?? "");
    if (priceValue < 1) {
      return c.json({ error: "Validation failed", details: { fieldErrors: { price: ["Preço inválido"] } } }, 400);
    }

    const property = createProperty({
      title: data.title,
      location: data.location,
      address: data.address ?? data.location,
      badge: data.badge,
      image: data.image,
      gallery: data.gallery,
      beds: data.beds,
      baths: data.baths,
      parking: data.parking,
      area: data.area,
      price: data.price ?? formatBrazilianPrice(priceValue),
      priceValue,
      description: toDescriptionArray(data.description),
      features: data.features ?? defaultFeatures(data.parking),
    });

    return c.json({ data: property }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Não foi possível criar o imóvel";
    return c.json({ error: message }, 400);
  }
});

propertiesRouter.put("/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!getPropertyBySlug(slug)) {
    return c.json({ error: "Property not found" }, 404);
  }

  const contentType = c.req.header("content-type") ?? "";

  try {
    if (!contentType.includes("multipart/form-data")) {
      return c.json({ error: "Content-Type must be multipart/form-data" }, 400);
    }

    const body = await c.req.parseBody({ all: true });
    const parsed = await parsePropertyMultipart(body as Record<string, unknown>, { requireImages: false });

    if ("error" in parsed) {
      return c.json({ error: "Validation failed", details: { fieldErrors: parsed.error } }, 400);
    }

    if (!parsed.data.image) {
      return c.json({ error: "Validation failed", details: { fieldErrors: { coverImage: ["Imagem de capa é obrigatória"] } } }, 400);
    }

    if (parsed.data.gallery.length === 0) {
      return c.json({ error: "Validation failed", details: { fieldErrors: { gallery: ["Adicione pelo menos uma imagem na galeria"] } } }, 400);
    }

    const property = updateProperty(slug, {
      ...parsed.data,
      image: parsed.data.image,
    });

    return c.json({ data: property });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Não foi possível atualizar o imóvel";
    return c.json({ error: message }, 400);
  }
});

propertiesRouter.delete("/:slug", (c) => {
  const slug = c.req.param("slug");
  const deleted = deleteProperty(slug);
  if (!deleted) {
    return c.json({ error: "Property not found" }, 404);
  }
  return c.json({ data: { slug, message: "Imóvel excluído com sucesso." } });
});

propertiesRouter.get("/:slug/similar", (c) => {
  const slug = c.req.param("slug");
  const limit = Number(c.req.query("limit") ?? 3);

  if (!getPropertyBySlug(slug)) {
    return c.json({ error: "Property not found" }, 404);
  }

  const similar = getSimilarProperties(slug, Number.isFinite(limit) ? limit : 3);
  return c.json({ data: similar });
});

propertiesRouter.get("/:slug", (c) => {
  const property = getPropertyBySlug(c.req.param("slug"));
  if (!property) {
    return c.json({ error: "Property not found" }, 404);
  }
  return c.json({ data: property });
});
