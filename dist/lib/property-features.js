export const KEY_FEATURE_CATALOG = [
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
const CATALOG_ID_SET = new Set(KEY_FEATURE_CATALOG.map((entry) => entry.id));
const VALID_ICONS = new Set([
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
const LABEL_ALIASES = {
    private_pool: [/piscina/i, /swimming\s*pool/i, /private\s*pool/i],
    terrace: [/terra[cç]o/i, /terrace/i, /varanda/i, /balcon/i],
    security_24h: [/portaria/i, /seguran[cç]a/i, /24[\s-]*hour/i, /24\s*h/i, /security/i],
    air_conditioning: [/ar\s*condicionado/i, /air\s*conditioning/i, /heating/i, /cooling/i, /\bac\b/i],
    private_beach: [/praia/i, /private\s*beach/i, /beach/i],
    marina: [/marina/i],
    wifi: [/wi[\s-]?fi/i, /coworking/i],
    parking_space: [/vaga/i, /estacionamento/i, /parking/i],
};
function sortAmenityIds(ids) {
    const selected = new Set(ids);
    return KEY_FEATURE_CATALOG.filter((entry) => selected.has(entry.id)).map((entry) => entry.id);
}
function amenityIdForFeature(feature) {
    if (feature.amenityId && CATALOG_ID_SET.has(feature.amenityId)) {
        return feature.amenityId;
    }
    const byLabel = KEY_FEATURE_CATALOG.find((entry) => entry.label.toLowerCase() === feature.label.toLowerCase());
    if (byLabel)
        return byLabel.id;
    for (const entry of KEY_FEATURE_CATALOG) {
        const aliases = LABEL_ALIASES[entry.id];
        if (aliases?.some((pattern) => pattern.test(feature.label))) {
            return entry.id;
        }
    }
    if (feature.icon === "parking") {
        return "parking_space";
    }
    return KEY_FEATURE_CATALOG.find((entry) => entry.icon === feature.icon)?.id;
}
function featuresToAmenityIds(features) {
    const ids = new Set();
    for (const feature of features) {
        const id = amenityIdForFeature(feature);
        if (id)
            ids.add(id);
    }
    return sortAmenityIds([...ids]);
}
function parkingLabel(parking) {
    if (parking === 1)
        return "1 parking space";
    return `${parking} parking spaces`;
}
function dedupeFeatures(features) {
    const seen = new Set();
    const result = [];
    for (const feature of features) {
        const key = feature.amenityId ?? `${feature.icon}:${feature.label.toLowerCase()}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        result.push(feature);
    }
    return result;
}
export function extractCustomFeatures(features) {
    return dedupeFeatures(features.filter((feature) => VALID_ICONS.has(feature.icon) &&
        feature.label.trim().length > 0 &&
        !amenityIdForFeature(feature)));
}
function normalizeCatalogFeaturesForDisplay(features, parking = 0) {
    const ids = featuresToAmenityIds(features);
    if (ids.length === 0)
        return [];
    return ids.map((id) => {
        const entry = CATALOG_BY_ID.get(id);
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
export function normalizeKeyFeaturesForDisplay(features, parking = 0) {
    const catalog = normalizeCatalogFeaturesForDisplay(features, parking);
    const custom = extractCustomFeatures(features).map((feature) => ({
        label: feature.label.trim(),
        icon: feature.icon,
    }));
    return dedupeFeatures([...catalog, ...custom]);
}
export function normalizeKeyFeaturesForStorage(features, parking = 0) {
    const catalog = normalizeCatalogFeaturesForDisplay(features, parking);
    const custom = extractCustomFeatures(features).map((feature) => ({
        label: feature.label.trim(),
        icon: feature.icon,
    }));
    return dedupeFeatures([...catalog, ...custom]);
}
