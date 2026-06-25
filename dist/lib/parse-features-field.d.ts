import type { PropertyFeature, PropertyFeatureIcon } from "../types/property.js";
export type FeatureIcon = PropertyFeatureIcon;
export type ParseFeatureItemsOptions = {
    isValidIcon: (icon: string) => boolean;
    isValidAmenityId: (id: string) => boolean;
};
export declare function parseFeatureItems(raw: unknown, options: ParseFeatureItemsOptions): PropertyFeature[];
/**
 * Reads the multipart `features` field in every shape Hono/FormData may produce:
 * JSON string, Blob, array of feature objects, or array of JSON strings (parseBody `all: true`
 * with duplicate field names).
 */
export declare function readFeaturesField(raw: unknown, options: ParseFeatureItemsOptions): Promise<PropertyFeature[] | null>;
