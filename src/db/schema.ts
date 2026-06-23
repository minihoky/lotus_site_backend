import type { Property, PropertyFeature } from "../types/property.js";
import { storedTimestampToIso } from "../lib/time.js";

export type PropertyRow = {
  slug: string;
  title: string;
  location: string;
  address: string;
  badge: string | null;
  image: string;
  gallery: string;
  beds: number;
  baths: number;
  parking: number;
  area: number;
  price: string;
  price_value: number;
  description: string;
  features: string;
  created_at: string;
};

export type InquiryRow = {
  id: number;
  property_slug: string | null;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  created_at: string;
  read_at: string | null;
};

export function rowToProperty(row: PropertyRow): Property {
  return {
    slug: row.slug,
    title: row.title,
    location: row.location,
    address: row.address,
    badge: row.badge ? (row.badge as Property["badge"]) : undefined,
    image: row.image,
    gallery: JSON.parse(row.gallery) as string[],
    beds: row.beds,
    baths: row.baths,
    parking: row.parking,
    area: row.area,
    price: row.price,
    priceValue: row.price_value,
    description: JSON.parse(row.description) as string[],
    features: JSON.parse(row.features) as PropertyFeature[],
    createdAt: storedTimestampToIso(row.created_at) ?? new Date(0).toISOString(),
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
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
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
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    read_at TEXT
  )
`;

export const MIGRATE_INQUIRIES_READ_AT = `
  ALTER TABLE inquiries ADD COLUMN read_at TEXT
`;
