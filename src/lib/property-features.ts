import type { PropertyAmenityId, PropertyFeature, PropertyFeatureIcon } from "../types/property.js";

type KeyFeatureCatalogEntry = {
  id: PropertyAmenityId;
  label: string;
  icon: PropertyFeatureIcon;
};

export const KEY_FEATURE_CATALOG: KeyFeatureCatalogEntry[] = [
  { id: "private_pool", label: "Private swimming pool", icon: "pool" },
  { id: "terrace", label: "Terrace", icon: "balcony" },
  { id: "security_24h", label: "24-hour security room", icon: "security" },
  { id: "air_conditioning", label: "Heating and cooling", icon: "ac" },
  { id: "private_beach", label: "Private beach", icon: "beach" },
  { id: "marina", label: "Marina", icon: "marina" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi" },
  { id: "parking_space", label: "Parking", icon: "parking" },
];

const CATALOG_BY_ID = new Map(KEY_FEATURE_CATALOG.map((entry) => [entry.id, entry]));
const CATALOG_ID_SET = new Set<PropertyAmenityId>(KEY_FEATURE_CATALOG.map((entry) => entry.id));

const LABEL_ALIASES: Partial<Record<PropertyAmenityId, RegExp[]>> = {
  private_pool: [/piscina/i, /swimming\s*pool/i, /private\s*pool/i],
  terrace: [/terra[cç]o/i, /terrace/i, /varanda/i, /balcon/i],
  security_24h: [/portaria/i, /seguran[cç]a/i, /24[\s-]*hour/i, /24\s*h/i, /security/i],
  air_conditioning: [/ar\s*condicionado/i, /air\s*conditioning/i, /heating/i, /cooling/i, /\bac\b/i],
  private_beach: [/praia/i, /private\s*beach/i, /beach/i],
  marina: [/marina/i],
  wifi: [/wi[\s-]?fi/i, /coworking/i],
  parking_space: [/vaga/i, /estacionamento/i, /parking/i],
};

function sortAmenityIds(ids: PropertyAmenityId[]): PropertyAmenityId[] {
  const selected = new Set(ids);
  return KEY_FEATURE_CATALOG.filter((entry) => selected.has(entry.id)).map((entry) => entry.id);
}

function amenityIdForFeature(feature: PropertyFeature): PropertyAmenityId | undefined {
  if (feature.amenityId && CATALOG_ID_SET.has(feature.amenityId)) {
    return feature.amenityId;
  }

  const byLabel = KEY_FEATURE_CATALOG.find(
    (entry) => entry.label.toLowerCase() === feature.label.toLowerCase(),
  );
  if (byLabel) return byLabel.id;

  for (const entry of KEY_FEATURE_CATALOG) {
    const aliases = LABEL_ALIASES[entry.id];
    if (aliases?.some((pattern) => pattern.test(feature.label))) {
      return entry.id;
    }
  }

  if (feature.icon === "parking") {
    return "parking_space";
  }

  console.log(feature.icon, "///////// -- feature.icon -- /////");

  return KEY_FEATURE_CATALOG.find((entry) => entry.icon === feature.icon)?.id;
}

function featuresToAmenityIds(features: PropertyFeature[]): PropertyAmenityId[] {
  const ids = new Set<PropertyAmenityId>();
  for (const feature of features) {
    const id = amenityIdForFeature(feature);
    if (id) ids.add(id);
  }
  return sortAmenityIds([...ids]);
}

function parkingLabel(parking: number): string {
  if (parking === 1) return "1 parking space";
  return `${parking} parking spaces`;
}

export function normalizeKeyFeaturesForDisplay(
  features: PropertyFeature[],
  parking = 0,
): PropertyFeature[] {
  const ids = featuresToAmenityIds(features);
  if (ids.length === 0) return [];

  return ids.map((id) => {
    const entry = CATALOG_BY_ID.get(id)!;

    if (id === "parking_space" && parking > 0) {
      return {
        label: parkingLabel(parking),
        icon: entry.icon,
        amenityId: id,
      };
    }

    return {
      label: entry.label,
      icon: entry.icon,
      amenityId: id,
    };
  });
}

export function normalizeKeyFeaturesForStorage(
  features: PropertyFeature[],
  parking = 0,
): PropertyFeature[] {
  return normalizeKeyFeaturesForDisplay(features, parking);
}
