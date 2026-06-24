export type PropertyBadge = "DESTAQUE" | "LANÇAMENTO";

export type PropertyPurpose = "comprar" | "alugar";

export const PROPERTY_TYPES = [
  "Apartamento",
  "Casa",
  "Casa unifamiliar",
  "Casa em Condomínio",
  "Sobrado",
  "Casa de campo",
  "Casa de campo em condomínio",
  "Cobertura",
  "Chácara",
  "Galpão",
  "Prédio comercial",
  "Terreno",
  "Terreno em Condomínio",
  "Edifício",
  "Espaço comercial",
  "Condomínio",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export type PropertyFeatureIcon =
  | "pool"
  | "gourmet"
  | "security"
  | "ac"
  | "gym"
  | "garden"
  | "wifi"
  | "parking"
  | "elevator"
  | "balcony"
  | "beach"
  | "marina";

export type PropertyFeature = {
  label: string;
  icon: PropertyFeatureIcon;
};

export type Property = {
  slug: string;
  title: string;
  location: string;
  address: string;
  badge?: PropertyBadge;
  purpose: PropertyPurpose;
  propertyType: PropertyType;
  condominium?: string;
  code?: string;
  image: string;
  gallery: string[];
  beds: number;
  baths: number;
  parking: number;
  area: number;
  price: string;
  priceValue: number;
  description: string[];
  features: PropertyFeature[];
  createdAt: string;
};

export type PropertySort = "recent" | "price";

export type PropertyFilters = {
  q?: string;
  badge?: PropertyBadge;
  location?: string;
  purpose?: PropertyPurpose;
  propertyType?: PropertyType;
  condominium?: string;
  code?: string;
  minBeds?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  sort?: PropertySort;
};

export type CreatePropertyInput = {
  title: string;
  location: string;
  address: string;
  badge?: PropertyBadge;
  purpose?: PropertyPurpose;
  propertyType?: PropertyType;
  condominium?: string;
  code?: string;
  image: string;
  gallery: string[];
  beds: number;
  baths: number;
  parking: number;
  area: number;
  price: string;
  priceValue: number;
  description: string[];
  features: PropertyFeature[];
};
