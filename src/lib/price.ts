export function parseBrazilianPrice(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;

  const normalized = trimmed.replace(/[^\d,.]/g, "");
  if (!normalized) return 0;

  if (normalized.includes(",")) {
    const withoutThousands = normalized.replace(/\./g, "").replace(",", ".");
    const value = Number.parseFloat(withoutThousands);
    return Number.isFinite(value) ? Math.round(value) : 0;
  }

  const value = Number.parseInt(normalized.replace(/\./g, ""), 10);
  return Number.isFinite(value) ? value : 0;
}

export function formatBrazilianPrice(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}
