export function currentTimestampIso() {
    return new Date().toISOString();
}
export function storedTimestampToIso(value) {
    if (!value)
        return null;
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    if (trimmed.includes("T")) {
        const date = new Date(trimmed);
        return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
    }
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match)
        return trimmed;
    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second ?? 0)));
    return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
}
