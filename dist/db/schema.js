export function rowToProperty(row) {
    return {
        slug: row.slug,
        title: row.title,
        location: row.location,
        address: row.address,
        badge: row.badge ? row.badge : undefined,
        image: row.image,
        gallery: JSON.parse(row.gallery),
        beds: row.beds,
        baths: row.baths,
        parking: row.parking,
        area: row.area,
        price: row.price,
        priceValue: row.price_value,
        description: JSON.parse(row.description),
        features: JSON.parse(row.features),
        createdAt: row.created_at ?? new Date(0).toISOString(),
    };
}
export const CREATE_PROPERTIES_TABLE = `
  CREATE TABLE IF NOT EXISTS properties (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    badge TEXT,
    image TEXT NOT NULL,
    gallery TEXT NOT NULL,
    beds INTEGER NOT NULL,
    baths INTEGER NOT NULL,
    parking INTEGER NOT NULL,
    area INTEGER NOT NULL,
    price TEXT NOT NULL,
    price_value INTEGER NOT NULL,
    description TEXT NOT NULL,
    features TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;
export const MIGRATE_PROPERTIES_CREATED_AT = `
  ALTER TABLE properties ADD COLUMN created_at TEXT
`;
export const CREATE_INQUIRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_slug TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;
