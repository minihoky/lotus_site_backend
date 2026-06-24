export function normalizeCondominiumName(value) {
    if (!value)
        return undefined;
    const normalized = value.trim().replace(/\s+/g, " ");
    return normalized.length > 0 ? normalized : undefined;
}
