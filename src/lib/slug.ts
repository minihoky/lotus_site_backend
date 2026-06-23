export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function generateUniqueSlug(
  title: string,
  exists: (slug: string) => boolean,
): string {
  const base = slugify(title) || "imovel";
  if (!exists(base)) return base;

  let counter = 2;
  while (exists(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}
