import type { PropertyAmenityId, PropertyFeature, PropertyFeatureIcon } from "../types/property.js";

type AmenityCatalogEntry = {
  id: PropertyAmenityId;
  label: string;
  pageLabel: string;
  icon: PropertyFeatureIcon;
};

export const AMENITY_CATALOG: AmenityCatalogEntry[] = [
  { id: "private_pool", label: "Piscina privativa", pageLabel: "Private swimming pool", icon: "pool" },
  { id: "terrace", label: "Terraço", pageLabel: "Terrace", icon: "balcony" },
  { id: "security_24h", label: "Portaria 24h", pageLabel: "24-hour security room", icon: "security" },
  { id: "air_conditioning", label: "Ar condicionado", pageLabel: "Heating and cooling", icon: "ac" },
  { id: "private_beach", label: "Praia privativa", pageLabel: "Private beach", icon: "beach" },
  { id: "marina", label: "Marina", pageLabel: "Marina", icon: "marina" },
  { id: "wifi", label: "Wi-Fi", pageLabel: "Wi-Fi", icon: "wifi" },
  { id: "parking_space", label: "Vaga de estacionamento", pageLabel: "Parking", icon: "parking" },
];

/** @deprecated Use AMENITY_CATALOG */
export const KEY_FEATURE_CATALOG = AMENITY_CATALOG.map(({ id, pageLabel, icon }) => ({
  id,
  label: pageLabel,
  icon,
}));

const AMENITY_BY_ID = new Map(AMENITY_CATALOG.map((amenity) => [amenity.id, amenity]));
const AMENITY_ID_SET = new Set<PropertyAmenityId>(AMENITY_CATALOG.map((amenity) => amenity.id));

const VALID_ICONS = new Set<PropertyFeatureIcon>([
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
  "beach",
  "marina",
]);

const LABEL_ALIASES: Partial<Record<PropertyAmenityId, RegExp[]>> = {
  private_pool: [/piscina/i, /swimming\s*pool/i, /private\s*pool/i],
  terrace: [/terra[cç]o/i, /terrace/i, /varanda/i, /balcon/i],
  security_24h: [/portaria/i, /seguran[cç]a/i, /24\s*h/i, /security/i],
  air_conditioning: [/ar\s*condicionado/i, /air\s*conditioning/i, /\bac\b/i],
  private_beach: [/praia/i, /private\s*beach/i, /beach/i],
  marina: [/marina/i],
  wifi: [/wi[\s-]?fi/i],
  parking_space: [/vaga/i, /estacionamento/i, /parking/i],
};

function sortAmenityIds(ids: PropertyAmenityId[]): PropertyAmenityId[] {
  const selected = new Set(ids);
  return AMENITY_CATALOG.filter((amenity) => selected.has(amenity.id)).map((amenity) => amenity.id);
}

function amenityIdForFeature(feature: PropertyFeature): PropertyAmenityId | undefined {
  if (feature.amenityId && AMENITY_ID_SET.has(feature.amenityId)) {
    return feature.amenityId;
  }

  const byLabel = AMENITY_CATALOG.find(
    (amenity) =>
      amenity.label.toLowerCase() === feature.label.toLowerCase() ||
      amenity.pageLabel.toLowerCase() === feature.label.toLowerCase(),
  );
  if (byLabel) return byLabel.id;

  for (const amenity of AMENITY_CATALOG) {
    const aliases = LABEL_ALIASES[amenity.id];
    if (aliases?.some((pattern) => pattern.test(feature.label))) {
      return amenity.id;
    }
  }

  if (feature.icon === "parking") {
    return "parking_space";
  }

  return AMENITY_CATALOG.find((amenity) => amenity.icon === feature.icon)?.id;
}

function featuresToAmenityIds(features: PropertyFeature[]): PropertyAmenityId[] {
  const ids = new Set<PropertyAmenityId>();
  for (const feature of features) {
    const id = amenityIdForFeature(feature);
    if (id) ids.add(id);
  }
  return sortAmenityIds([...ids]);
}

function dedupeFeatures(features: PropertyFeature[]): PropertyFeature[] {
  const seen = new Set<string>();
  const result: PropertyFeature[] = [];

  for (const feature of features) {
    const key = feature.amenityId ?? `${feature.icon}:${feature.label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(feature);
  }

  return result;
}

export function extractCustomFeatures(features: PropertyFeature[]): PropertyFeature[] {
  return dedupeFeatures(
    (features ?? []).filter(
      (feature) =>
        VALID_ICONS.has(feature.icon) &&
        feature.label.trim().length > 0 &&
        !amenityIdForFeature(feature),
    ),
  );
}

function catalogFeaturesForDisplay(
  features: PropertyFeature[],
  parking = 0,
  options?: { usePageLabels?: boolean },
): PropertyFeature[] {
  const ids = featuresToAmenityIds(features);
  if (ids.length === 0) return [];

  const usePageLabels = options?.usePageLabels ?? true;

  return sortAmenityIds(ids).map((id) => {
    const amenity = AMENITY_BY_ID.get(id)!;

    if (id === "parking_space" && parking > 0) {
      return {
        label: usePageLabels
          ? parking === 1
            ? "1 parking space"
            : `${parking} parking spaces`
          : parking === 1
            ? "1 vaga"
            : `${parking} vagas`,
        icon: "parking",
        amenityId: id,
      };
    }

    return {
      label: usePageLabels ? amenity.pageLabel : amenity.label,
      icon: amenity.icon,
      amenityId: id,
    };
  });
}

function allFeaturesForDisplay(
  features: PropertyFeature[],
  parking = 0,
  options?: { usePageLabels?: boolean },
): PropertyFeature[] {
  const usePageLabels = options?.usePageLabels ?? true;
  const catalog = catalogFeaturesForDisplay(features, parking, options);
  const custom = extractCustomFeatures(features).map((feature) => ({
    label: feature.label.trim(),
    icon: feature.icon,
  }));

  const merged = dedupeFeatures([...catalog, ...custom]);

  if (parking > 0 && !hasParkingFeature(merged)) {
    return dedupeFeatures([...merged, parkingFeatureForDisplay(parking, usePageLabels)]);
  }

  return merged;
}

function amenitiesToFeatures(selectedIds: PropertyAmenityId[], parking = 0): PropertyFeature[] {
  return sortAmenityIds(selectedIds).map((id) => {
    const amenity = AMENITY_BY_ID.get(id)!;

    if (id === "parking_space" && parking > 0) {
      return parkingFeatureForStorage(parking);
    }

    return {
      label: amenity.label,
      icon: amenity.icon,
      amenityId: id,
    };
  });
}

function parkingFeatureForStorage(parking: number): PropertyFeature {
  return {
    label: parking === 1 ? "1 vaga" : `${parking} vagas`,
    icon: "parking",
    amenityId: "parking_space",
  };
}

function parkingFeatureForDisplay(parking: number, usePageLabels = true): PropertyFeature {
  return {
    label: usePageLabels
      ? parking === 1
        ? "1 parking space"
        : `${parking} parking spaces`
      : parking === 1
        ? "1 vaga"
        : `${parking} vagas`,
    icon: "parking",
    amenityId: "parking_space",
  };
}

function hasParkingFeature(features: PropertyFeature[]): boolean {
  return features.some(
    (feature) => feature.amenityId === "parking_space" || feature.icon === "parking",
  );
}

function mergeFeaturesForStorage(
  catalogFeatures: PropertyFeature[],
  customFeatures: PropertyFeature[],
  parking = 0,
): PropertyFeature[] {
  const custom = customFeatures
    .map((feature) => ({
      label: feature.label.trim(),
      icon: feature.icon,
    }))
    .filter((feature) => feature.label.length > 0 && VALID_ICONS.has(feature.icon));

  const catalog = [...catalogFeatures];
  if (parking > 0 && !hasParkingFeature([...catalog, ...custom])) {
    catalog.unshift(parkingFeatureForStorage(parking));
  }

  return dedupeFeatures([...catalog, ...custom]);
}

export function normalizeKeyFeaturesForDisplay(
  features: PropertyFeature[],
  parking = 0,
): PropertyFeature[] {
  return allFeaturesForDisplay(features, parking, { usePageLabels: true });
}

export function normalizeKeyFeaturesForStorage(
  features: PropertyFeature[],
  parking = 0,
): PropertyFeature[] {
  const amenityIds = featuresToAmenityIds(features);
  const catalogFeatures = amenitiesToFeatures(amenityIds, parking);
  const customFeatures = extractCustomFeatures(features);
  return mergeFeaturesForStorage(catalogFeatures, customFeatures, parking);
}
