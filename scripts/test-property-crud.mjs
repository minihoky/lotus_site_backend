/**
 * Integration smoke test for property create/update via multipart (admin flow).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.API_URL ?? "http://127.0.0.1:3001";
const __dirname = dirname(fileURLToPath(import.meta.url));

function tinyPngBuffer() {
  // 1x1 transparent PNG
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

async function createMultipartProperty() {
  const png = tinyPngBuffer();
  const blob = new Blob([png], { type: "image/png" });
  const file = new File([blob], "cover.png", { type: "image/png" });

  const features = JSON.stringify([
    { label: "Piscina privativa", icon: "pool", amenityId: "private_pool" },
    { label: "Wi-Fi", icon: "wifi", amenityId: "wifi" },
    { label: "Sauna privativa", icon: "gym" },
  ]);

  const form = new FormData();
  form.append("title", "Teste Integração CRUD");
  form.append("location", "Jardins, São Paulo - SP");
  form.append("description", "Descrição de teste para validar criação e edição de imóveis.");
  form.append("beds", "3");
  form.append("baths", "2");
  form.append("parking", "2");
  form.append("area", "120");
  form.append("price", "1.250.000,00");
  form.append("purpose", "comprar");
  form.append("propertyType", "Apartamento");
  form.append("condominium", "Condomínio Teste");
  form.append("features", features);
  form.append("coverImage", file);
  form.append("gallery", file);

  const res = await fetch(`${API}/api/properties`, { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Create failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.data;
}

async function updateMultipartProperty(slug, existing) {
  const png = tinyPngBuffer();
  const blob = new Blob([png], { type: "image/png" });
  const file = new File([blob], "gallery.png", { type: "image/png" });

  const features = JSON.stringify([
    { label: "Portaria 24h", icon: "security", amenityId: "security_24h" },
    { label: "Sauna privativa", icon: "gym" },
  ]);

  const form = new FormData();
  form.append("title", "Teste Integração CRUD Atualizado");
  form.append("location", "Pinheiros, São Paulo - SP");
  form.append("description", "Descrição atualizada após edição do imóvel de teste.");
  form.append("beds", "4");
  form.append("baths", "3");
  form.append("parking", "1");
  form.append("area", "150");
  form.append("price", "2.500.000,00");
  form.append("purpose", "alugar");
  form.append("propertyType", "Cobertura");
  form.append("condominium", "");
  form.append("features", features);
  form.append("existingCoverUrl", existing.image);
  form.append("existingGallery", JSON.stringify(existing.gallery));
  form.append("gallery", file);

  const res = await fetch(`${API}/api/properties/${slug}`, { method: "PUT", body: form });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Update failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.data;
}

async function getStoredFeatures(slug) {
  const dbPath = join(__dirname, "..", "data", "lotus.db");
  // Use API GET and compare - stored features are normalized on read
  // Instead verify via raw fetch + separate stored check from create response flow
  const res = await fetch(`${API}/api/properties/${slug}`);
  const body = await res.json();
  return body.data;
}

async function deleteProperty(slug) {
  await fetch(`${API}/api/properties/${slug}`, { method: "DELETE" });
}

async function main() {
  console.log("Creating property...");
  const created = await createMultipartProperty();
  console.log("Created slug:", created.slug);
  console.log("Features (display):", created.features.map((f) => f.label).join(", "));

  assert(created.location === "Jardins, São Paulo - SP", "location mismatch on create");
  assert(created.address === "Jardins, São Paulo - SP", "address should default to location on create");
  assert(created.features.some((f) => f.label === "Private swimming pool"), "pool display label");
  assert(created.features.some((f) => f.label === "Sauna privativa"), "custom feature preserved");
  assert(created.condominium === "Condomínio Teste", "condominium on create");

  console.log("Updating property...");
  const updated = await updateMultipartProperty(created.slug, created);
  console.log("Updated title:", updated.title);
  console.log("Features (display):", updated.features.map((f) => f.label).join(", "));

  assert(updated.title === "Teste Integração CRUD Atualizado", "title not updated");
  assert(updated.location === "Pinheiros, São Paulo - SP", "location not updated");
  assert(updated.address === "Pinheiros, São Paulo - SP", "address should follow location on update");
  assert(updated.purpose === "alugar", "purpose not updated");
  assert(updated.propertyType === "Cobertura", "propertyType not updated");
  assert(updated.condominium === undefined, "condominium should be cleared");
  assert(updated.features.some((f) => f.label === "24-hour security room"), "security amenity");
  assert(!updated.features.some((f) => f.amenityId === "private_pool"), "pool removed after update");
  assert(updated.features.some((f) => f.label === "Sauna privativa"), "custom feature kept");
  assert(updated.features.some((f) => f.label === "1 parking space"), "parking from count");

  console.log("Cleaning up...");
  await deleteProperty(created.slug);

  console.log("All integration checks passed.");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
