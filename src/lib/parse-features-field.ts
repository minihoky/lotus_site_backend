import type { PropertyAmenityId, PropertyFeature, PropertyFeatureIcon } from "../types/property.js";

export type FeatureIcon = PropertyFeatureIcon;

export type ParseFeatureItemsOptions = {
  isValidIcon: (icon: string) => boolean;
  isValidAmenityId: (id: string) => boolean;
};

function isFeatureRecord(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null && "label" in item && "icon" in item;
}

async function readFeaturesFieldText(value: unknown): Promise<string> {
  if (typeof value === "string") return value.trim();
  if (value instanceof Blob) return (await value.text()).trim();
  return "";
}

export function parseFeatureItems(
  raw: unknown,
  options: ParseFeatureItemsOptions,
): PropertyFeature[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(isFeatureRecord)
    .map((item) => {
      const amenityIdRaw = item.amenityId;
      const amenityId =
        typeof amenityIdRaw === "string" && options.isValidAmenityId(amenityIdRaw)
          ? (amenityIdRaw as PropertyAmenityId)
          : undefined;

      return {
        label: String(item.label).trim(),
        icon: String(item.icon).trim(),
        amenityId,
      };
    })
    .filter((item) => item.label.length > 0 && options.isValidIcon(item.icon))
    .map((item) => ({
      label: item.label,
      icon: item.icon as PropertyFeatureIcon,
      ...(item.amenityId ? { amenityId: item.amenityId } : {}),
    }));
}

function parseFeaturesJsonText(
  text: string,
  options: ParseFeatureItemsOptions,
): PropertyFeature[] | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parseFeatureItems(parsed, options);
  } catch {
    return null;
  }
}

/**
 * Reads the multipart `features` field in every shape Hono/FormData may produce:
 * JSON string, Blob, array of feature objects, or array of JSON strings (parseBody `all: true`
 * with duplicate field names).
 */
export async function readFeaturesField(
  raw: unknown,
  options: ParseFeatureItemsOptions,
): Promise<PropertyFeature[] | null> {
  if (raw === undefined || raw === null) return null;

  if (typeof raw === "string" || raw instanceof Blob) {
    const text = await readFeaturesFieldText(raw);
    if (!text) return null;
    return parseFeaturesJsonText(text, options);
  }

  if (!Array.isArray(raw)) return null;
  if (raw.length === 0) return [];

  const objectItems = raw.filter(isFeatureRecord);
  if (objectItems.length > 0) {
    return parseFeatureItems(objectItems, options);
  }

  const textParts = (
    await Promise.all(raw.map((item) => readFeaturesFieldText(item)))
  ).filter(Boolean);

  if (textParts.length === 0) return [];

  const merged: PropertyFeature[] = [];
  for (const part of textParts) {
    const items = parseFeaturesJsonText(part, options);
    if (items !== null) merged.push(...items);
  }

  if (merged.length === 0) return null;
  return merged;
}
