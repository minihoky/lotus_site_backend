import type { PropertyAmenityId, PropertyFeature, PropertyFeatureIcon } from "../types/property.js";
type AmenityCatalogEntry = {
    id: PropertyAmenityId;
    label: string;
    pageLabel: string;
    icon: PropertyFeatureIcon;
};
export declare const AMENITY_CATALOG: AmenityCatalogEntry[];
/** @deprecated Use AMENITY_CATALOG */
export declare const KEY_FEATURE_CATALOG: {
    id: PropertyAmenityId;
    label: string;
    icon: PropertyFeatureIcon;
}[];
export declare function extractCustomFeatures(features: PropertyFeature[]): PropertyFeature[];
export declare function normalizeKeyFeaturesForDisplay(features: PropertyFeature[], parking?: number): PropertyFeature[];
export declare function normalizeKeyFeaturesForStorage(features: PropertyFeature[], parking?: number): PropertyFeature[];
export {};
