import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CREATE_INQUIRIES_TABLE, CREATE_PROPERTIES_TABLE, MIGRATE_PROPERTIES_CREATED_AT, rowToProperty, } from "./schema.js";
import { generateUniqueSlug } from "../lib/slug.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "..", "data");
const dbPath = process.env.DATABASE_PATH ?? join(dataDir, "lotus.db");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec(CREATE_PROPERTIES_TABLE);
db.exec(CREATE_INQUIRIES_TABLE);
function migratePropertiesTable() {
    const columns = db.prepare("PRAGMA table_info(properties)").all();
    if (!columns.some((column) => column.name === "created_at")) {
        db.exec(MIGRATE_PROPERTIES_CREATED_AT);
    }
    db.exec("UPDATE properties SET created_at = datetime('now') WHERE created_at IS NULL");
}
migratePropertiesTable();
function orderClause(sort) {
    return sort === "price" ? "price_value DESC" : "created_at DESC";
}
export function listProperties(filters = {}) {
    const conditions = [];
    const params = [];
    if (filters.q) {
        conditions.push("(title LIKE ? OR location LIKE ? OR address LIKE ? OR description LIKE ?)");
        const term = `%${filters.q}%`;
        params.push(term, term, term, term);
    }
    if (filters.badge) {
        conditions.push("badge = ?");
        params.push(filters.badge);
    }
    if (filters.location) {
        conditions.push("location LIKE ?");
        params.push(`%${filters.location}%`);
    }
    if (filters.minBeds !== undefined) {
        conditions.push("beds >= ?");
        params.push(filters.minBeds);
    }
    if (filters.minPrice !== undefined) {
        conditions.push("price_value >= ?");
        params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        conditions.push("price_value <= ?");
        params.push(filters.maxPrice);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit !== undefined ? `LIMIT ${Math.max(1, filters.limit)}` : "";
    const orderBy = orderClause(filters.sort);
    const stmt = db.prepare(`SELECT * FROM properties ${where} ORDER BY ${orderBy} ${limit}`);
    const rows = stmt.all(...params);
    return rows.map(rowToProperty);
}
export function listRecentProperties(limit = 5) {
    return listProperties({ limit, sort: "recent" });
}
export function getPropertyBySlug(slug) {
    const stmt = db.prepare("SELECT * FROM properties WHERE slug = ?");
    const row = stmt.get(slug);
    return row ? rowToProperty(row) : undefined;
}
export function getSimilarProperties(slug, limit = 3) {
    const stmt = db.prepare(`SELECT * FROM properties WHERE slug != ? ORDER BY ABS(price_value - (
      SELECT price_value FROM properties WHERE slug = ?
    )) LIMIT ?`);
    const rows = stmt.all(slug, slug, limit);
    return rows.map(rowToProperty);
}
export function createInquiry(input) {
    const stmt = db.prepare(`INSERT INTO inquiries (property_slug, name, phone, email, message)
     VALUES (?, ?, ?, ?, ?)`);
    const result = stmt.run(input.propertySlug ?? null, input.name, input.phone, input.email, input.message ?? null);
    return { id: Number(result.lastInsertRowid) };
}
export function listInquiries(limit) {
    const safeLimit = limit !== undefined ? Math.max(1, Math.min(limit, 100)) : undefined;
    const limitClause = safeLimit !== undefined ? `LIMIT ${safeLimit}` : "";
    const stmt = db.prepare(`
    SELECT
      i.id,
      i.property_slug,
      i.name,
      i.phone,
      i.email,
      i.message,
      i.created_at,
      p.title AS property_title
    FROM inquiries i
    LEFT JOIN properties p ON i.property_slug = p.slug
    ORDER BY i.created_at DESC
    ${limitClause}
  `);
    const rows = stmt.all();
    return rows.map((row) => ({
        id: row.id,
        propertySlug: row.property_slug,
        propertyTitle: row.property_title,
        name: row.name,
        phone: row.phone,
        email: row.email,
        message: row.message,
        createdAt: row.created_at,
    }));
}
export function deleteInquiry(id) {
    const result = db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
    return result.changes > 0;
}
export function createProperty(input) {
    const slug = generateUniqueSlug(input.title, (candidate) => Boolean(getPropertyBySlug(candidate)));
    const stmt = db.prepare(`
    INSERT INTO properties (
      slug, title, location, address, badge, image, gallery,
      beds, baths, parking, area, price, price_value, description, features, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
    )
  `);
    stmt.run(slug, input.title, input.location, input.address, input.badge ?? "DESTAQUE", input.image, JSON.stringify(input.gallery), input.beds, input.baths, input.parking, input.area, input.price, input.priceValue, JSON.stringify(input.description), JSON.stringify(input.features));
    const created = getPropertyBySlug(slug);
    if (!created) {
        throw new Error("Failed to create property");
    }
    return created;
}
export function deleteProperty(slug) {
    const result = db.prepare("DELETE FROM properties WHERE slug = ?").run(slug);
    return result.changes > 0;
}
export function updateProperty(slug, input) {
    const existing = getPropertyBySlug(slug);
    if (!existing) {
        throw new Error("Property not found");
    }
    const stmt = db.prepare(`
    UPDATE properties SET
      title = ?,
      location = ?,
      address = ?,
      badge = ?,
      image = ?,
      gallery = ?,
      beds = ?,
      baths = ?,
      parking = ?,
      area = ?,
      price = ?,
      price_value = ?,
      description = ?,
      features = ?
    WHERE slug = ?
  `);
    stmt.run(input.title, input.location, input.address, input.badge ?? "DESTAQUE", input.image, JSON.stringify(input.gallery), input.beds, input.baths, input.parking, input.area, input.price, input.priceValue, JSON.stringify(input.description), JSON.stringify(input.features), slug);
    const updated = getPropertyBySlug(slug);
    if (!updated) {
        throw new Error("Failed to update property");
    }
    return updated;
}
export function propertyCount() {
    const row = db.prepare("SELECT COUNT(*) as count FROM properties").get();
    return row.count;
}
export { db };
