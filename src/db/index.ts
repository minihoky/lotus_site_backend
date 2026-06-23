import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CREATE_INQUIRIES_TABLE,
  CREATE_PROPERTIES_TABLE,
  MIGRATE_INQUIRIES_READ_AT,
  MIGRATE_PROPERTIES_CREATED_AT,
  rowToProperty,
  type PropertyRow,
} from "./schema.js";
import type { CreatePropertyInput, Property, PropertyFilters } from "../types/property.js";
import type { Inquiry } from "../types/inquiry.js";
import { generateUniqueSlug } from "../lib/slug.js";
import { currentTimestampIso, storedTimestampToIso } from "../lib/time.js";

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
  const columns = db.prepare("PRAGMA table_info(properties)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "created_at")) {
    db.exec(MIGRATE_PROPERTIES_CREATED_AT);
  }
  db.exec("UPDATE properties SET created_at = datetime('now') WHERE created_at IS NULL");
}

migratePropertiesTable();

function migrateInquiriesTable() {
  const columns = db.prepare("PRAGMA table_info(inquiries)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "read_at")) {
    db.exec(MIGRATE_INQUIRIES_READ_AT);
    db.exec("UPDATE inquiries SET read_at = created_at WHERE read_at IS NULL");
  }
}

migrateInquiriesTable();

function orderClause(sort: PropertyFilters["sort"]): string {
  return sort === "price" ? "price_value DESC" : "created_at DESC";
}

export function listProperties(filters: PropertyFilters = {}): Property[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.q) {
    conditions.push(
      "(title LIKE ? OR location LIKE ? OR address LIKE ? OR description LIKE ?)",
    );
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
  const rows = stmt.all(...params) as PropertyRow[];

  return rows.map(rowToProperty);
}

export function listRecentProperties(limit = 5): Property[] {
  return listProperties({ limit, sort: "recent" });
}

export function getPropertyBySlug(slug: string): Property | undefined {
  const stmt = db.prepare("SELECT * FROM properties WHERE slug = ?");
  const row = stmt.get(slug) as PropertyRow | undefined;
  return row ? rowToProperty(row) : undefined;
}

export function getSimilarProperties(slug: string, limit = 3): Property[] {
  const stmt = db.prepare(
    `SELECT * FROM properties WHERE slug != ? ORDER BY ABS(price_value - (
      SELECT price_value FROM properties WHERE slug = ?
    )) LIMIT ?`,
  );
  const rows = stmt.all(slug, slug, limit) as PropertyRow[];
  return rows.map(rowToProperty);
}

function mapInquiryRow(row: {
  id: number;
  property_slug: string | null;
  property_title: string | null;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  created_at: string;
  read_at: string | null;
}): Inquiry {
  return {
    id: row.id,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    createdAt: storedTimestampToIso(row.created_at) ?? row.created_at,
    readAt: storedTimestampToIso(row.read_at),
  };
}

export function createInquiry(input: {
  propertySlug?: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
}): { id: number } {
  const createdAt = currentTimestampIso();
  const stmt = db.prepare(
    `INSERT INTO inquiries (property_slug, name, phone, email, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
    input.propertySlug ?? null,
    input.name,
    input.phone,
    input.email,
    input.message ?? null,
    createdAt,
  );

  return { id: Number(result.lastInsertRowid) };
}

export function listInquiries(limit?: number): Inquiry[] {
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
      i.read_at,
      p.title AS property_title
    FROM inquiries i
    LEFT JOIN properties p ON i.property_slug = p.slug
    ORDER BY i.created_at DESC
    ${limitClause}
  `);

  const rows = stmt.all() as Array<{
    id: number;
    property_slug: string | null;
    property_title: string | null;
    name: string;
    phone: string;
    email: string;
    message: string | null;
    created_at: string;
    read_at: string | null;
  }>;

  return rows.map(mapInquiryRow);
}

export function deleteInquiry(id: number): boolean {
  const result = db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
  return result.changes > 0;
}

export function countUnreadInquiries(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE read_at IS NULL").get() as {
    count: number;
  };
  return row.count;
}

export function listUnreadInquiries(): Inquiry[] {
  const stmt = db.prepare(`
    SELECT
      i.id,
      i.property_slug,
      i.name,
      i.phone,
      i.email,
      i.message,
      i.created_at,
      i.read_at,
      p.title AS property_title
    FROM inquiries i
    LEFT JOIN properties p ON i.property_slug = p.slug
    WHERE i.read_at IS NULL
    ORDER BY i.created_at DESC
  `);

  const rows = stmt.all() as Array<{
    id: number;
    property_slug: string | null;
    property_title: string | null;
    name: string;
    phone: string;
    email: string;
    message: string | null;
    created_at: string;
    read_at: string | null;
  }>;

  return rows.map(mapInquiryRow);
}

export function markInquiriesAsRead(ids?: number[]): number {
  const readAt = currentTimestampIso();

  if (ids !== undefined && ids.length > 0) {
    const placeholders = ids.map(() => "?").join(", ");
    const result = db
      .prepare(
        `UPDATE inquiries SET read_at = ? WHERE id IN (${placeholders}) AND read_at IS NULL`,
      )
      .run(readAt, ...ids);
    return Number(result.changes);
  }

  const result = db
    .prepare("UPDATE inquiries SET read_at = ? WHERE read_at IS NULL")
    .run(readAt);
  return Number(result.changes);
}

export function createProperty(input: CreatePropertyInput): Property {
  const slug = generateUniqueSlug(input.title, (candidate) => Boolean(getPropertyBySlug(candidate)));
  const createdAt = currentTimestampIso();

  const stmt = db.prepare(`
    INSERT INTO properties (
      slug, title, location, address, badge, image, gallery,
      beds, baths, parking, area, price, price_value, description, features, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    slug,
    input.title,
    input.location,
    input.address,
    input.badge ?? "DESTAQUE",
    input.image,
    JSON.stringify(input.gallery),
    input.beds,
    input.baths,
    input.parking,
    input.area,
    input.price,
    input.priceValue,
    JSON.stringify(input.description),
    JSON.stringify(input.features),
    createdAt,
  );

  const created = getPropertyBySlug(slug);
  if (!created) {
    throw new Error("Failed to create property");
  }
  return created;
}

export function deleteProperty(slug: string): boolean {
  const result = db.prepare("DELETE FROM properties WHERE slug = ?").run(slug);
  return result.changes > 0;
}

export function updateProperty(slug: string, input: CreatePropertyInput): Property {
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

  stmt.run(
    input.title,
    input.location,
    input.address,
    input.badge ?? "DESTAQUE",
    input.image,
    JSON.stringify(input.gallery),
    input.beds,
    input.baths,
    input.parking,
    input.area,
    input.price,
    input.priceValue,
    JSON.stringify(input.description),
    JSON.stringify(input.features),
    slug,
  );

  const updated = getPropertyBySlug(slug);
  if (!updated) {
    throw new Error("Failed to update property");
  }
  return updated;
}

export function propertyCount(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM properties").get() as {
    count: number;
  };
  return row.count;
}

export { db };
