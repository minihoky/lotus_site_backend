function isFeatureRecord(item) {
    return typeof item === "object" && item !== null && "label" in item && "icon" in item;
}
async function readFeaturesFieldText(value) {
    if (typeof value === "string")
        return value.trim();
    if (value instanceof Blob)
        return (await value.text()).trim();
    return "";
}
export function parseFeatureItems(raw, options) {
    if (!Array.isArray(raw))
        return [];
    return raw
        .filter(isFeatureRecord)
        .map((item) => {
        const amenityIdRaw = item.amenityId;
        const amenityId = typeof amenityIdRaw === "string" && options.isValidAmenityId(amenityIdRaw)
            ? amenityIdRaw
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
        icon: item.icon,
        ...(item.amenityId ? { amenityId: item.amenityId } : {}),
    }));
}
function parseFeaturesJsonText(text, options) {
    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed))
            return null;
        return parseFeatureItems(parsed, options);
    }
    catch {
        return null;
    }
}
/**
 * Reads the multipart `features` field in every shape Hono/FormData may produce:
 * JSON string, Blob, array of feature objects, or array of JSON strings (parseBody `all: true`
 * with duplicate field names).
 */
export async function readFeaturesField(raw, options) {
    if (raw === undefined || raw === null)
        return null;
    if (typeof raw === "string" || raw instanceof Blob) {
        const text = await readFeaturesFieldText(raw);
        if (!text)
            return null;
        return parseFeaturesJsonText(text, options);
    }
    if (!Array.isArray(raw))
        return null;
    if (raw.length === 0)
        return [];
    const objectItems = raw.filter(isFeatureRecord);
    if (objectItems.length > 0) {
        return parseFeatureItems(objectItems, options);
    }
    const textParts = (await Promise.all(raw.map((item) => readFeaturesFieldText(item)))).filter(Boolean);
    if (textParts.length === 0)
        return [];
    const merged = [];
    for (const part of textParts) {
        const items = parseFeaturesJsonText(part, options);
        if (items !== null)
            merged.push(...items);
    }
    if (merged.length === 0)
        return null;
    return merged;
}
