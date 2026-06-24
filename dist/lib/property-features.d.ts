import type { PropertyAmenityId, PropertyFeature, PropertyFeatureIcon } from "../types/property.js";
type KeyFeatureCatalogEntry = {
    id: PropertyAmenityId;
    label: string;
    icon: PropertyFeatureIcon;
};
export declare const KEY_FEATURE_CATALOG: KeyFeatureCatalogEntry[];
export declare function extractCustomFeatures(features: PropertyFeature[]): PropertyFeature[];
export declare function normalizeKeyFeaturesForDisplay(features: PropertyFeature[], parking?: number): PropertyFeature[];
export declare function normalizeKeyFeaturesForStorage(features: PropertyFeature[], parking?: number): PropertyFeature[];
export {};
