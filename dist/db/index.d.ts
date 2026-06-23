import { DatabaseSync } from "node:sqlite";
import type { CreatePropertyInput, Property, PropertyFilters } from "../types/property.js";
import type { Inquiry } from "../types/inquiry.js";
declare const db: DatabaseSync;
export declare function listProperties(filters?: PropertyFilters): Property[];
export declare function listRecentProperties(limit?: number): Property[];
export declare function getPropertyBySlug(slug: string): Property | undefined;
export declare function getSimilarProperties(slug: string, limit?: number): Property[];
export declare function createInquiry(input: {
    propertySlug?: string;
    name: string;
    phone: string;
    email: string;
    message?: string;
}): {
    id: number;
};
export declare function listInquiries(limit?: number): Inquiry[];
export declare function deleteInquiry(id: number): boolean;
export declare function createProperty(input: CreatePropertyInput): Property;
export declare function deleteProperty(slug: string): boolean;
export declare function updateProperty(slug: string, input: CreatePropertyInput): Property;
export declare function propertyCount(): number;
export { db };
