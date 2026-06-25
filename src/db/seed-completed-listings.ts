import { createProperty, propertyCount } from "./index.js";
import { AMENITY_CATALOG } from "../lib/property-features.js";
import type {
  PropertyAmenityId,
  PropertyBadge,
  PropertyFeature,
  PropertyPurpose,
  PropertyType,
} from "../types/property.js";

const IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80&auto=format&fit=crop",
];

type ListingTemplate = {
  title: string;
  location: string;
  address: string;
  condominium: string;
  purpose: PropertyPurpose;
  propertyType: PropertyType;
  badge?: PropertyBadge;
  beds: number;
  baths: number;
  parking: number;
  area: number;
  priceValue: number;
};

const TEMPLATES: ListingTemplate[] = [
  { title: "Apartamento Alto Padrão nos Jardins", location: "Jardins, São Paulo - SP", address: "Alameda Santos, 800 — Jardins, São Paulo - SP", condominium: "Residencial Jardins Park", purpose: "comprar", propertyType: "Apartamento", badge: "DESTAQUE", beds: 3, baths: 3, parking: 2, area: 145, priceValue: 2_450_000 },
  { title: "Cobertura Duplex em Pinheiros", location: "Pinheiros, São Paulo - SP", address: "Rua dos Pinheiros, 450 — Pinheiros, São Paulo - SP", condominium: "Pinheiros Sky Residence", purpose: "comprar", propertyType: "Cobertura", badge: "DESTAQUE", beds: 4, baths: 4, parking: 3, area: 280, priceValue: 4_800_000 },
  { title: "Casa em Condomínio Fechado em Alphaville", location: "Alphaville, Barueri - SP", address: "Alameda Rio Negro, 1200 — Alphaville, Barueri - SP", condominium: "Alphaville Residencial Two", purpose: "comprar", propertyType: "Casa em Condomínio", beds: 4, baths: 5, parking: 4, area: 350, priceValue: 3_200_000 },
  { title: "Apartamento Frente Mar em Santos", location: "Gonzaga, Santos - SP", address: "Av. Bartolomeu de Gusmão, 200 — Gonzaga, Santos - SP", condominium: "Edifício Atlântico", purpose: "comprar", propertyType: "Apartamento", badge: "LANÇAMENTO", beds: 3, baths: 2, parking: 2, area: 120, priceValue: 1_850_000 },
  { title: "Loft Industrial na Vila Madalena", location: "Vila Madalena, São Paulo - SP", address: "Rua Harmonia, 300 — Vila Madalena, São Paulo - SP", condominium: "Loft Harmonia", purpose: "alugar", propertyType: "Apartamento", beds: 1, baths: 1, parking: 1, area: 75, priceValue: 6_500 },
  { title: "Sobrado em Moema", location: "Moema, São Paulo - SP", address: "Rua Gaivota, 150 — Moema, São Paulo - SP", condominium: "Condomínio Gaivota", purpose: "comprar", propertyType: "Sobrado", beds: 3, baths: 3, parking: 2, area: 180, priceValue: 1_950_000 },
  { title: "Apartamento Garden no Morumbi", location: "Morumbi, São Paulo - SP", address: "Av. Giovanni Gronchi, 5000 — Morumbi, São Paulo - SP", condominium: "Morumbi Garden", purpose: "comprar", propertyType: "Apartamento", badge: "DESTAQUE", beds: 3, baths: 3, parking: 3, area: 200, priceValue: 2_750_000 },
  { title: "Casa de Campo em Atibaia", location: "Atibaia, SP", address: "Estrada Municipal, km 12 — Atibaia, SP", condominium: "Condomínio Vista Verde", purpose: "comprar", propertyType: "Casa de campo em condomínio", beds: 4, baths: 4, parking: 4, area: 400, priceValue: 1_600_000 },
  { title: "Studio Moderno na Consolação", location: "Consolação, São Paulo - SP", address: "Rua da Consolação, 2200 — Consolação, São Paulo - SP", condominium: "Edifício Consolação 2200", purpose: "alugar", propertyType: "Apartamento", beds: 1, baths: 1, parking: 1, area: 42, priceValue: 3_800 },
  { title: "Apartamento em Perdizes", location: "Perdizes, São Paulo - SP", address: "Rua Turiassu, 600 — Perdizes, São Paulo - SP", condominium: "Residencial Turiassu", purpose: "comprar", propertyType: "Apartamento", beds: 2, baths: 2, parking: 1, area: 85, priceValue: 980_000 },
  { title: "Casa Unifamiliar em Brooklin", location: "Brooklin, São Paulo - SP", address: "Rua Flórida, 800 — Brooklin, São Paulo - SP", condominium: "Brooklin Residencial", purpose: "comprar", propertyType: "Casa unifamiliar", beds: 4, baths: 3, parking: 3, area: 220, priceValue: 2_100_000 },
  { title: "Cobertura em Higienópolis", location: "Higienópolis, São Paulo - SP", address: "Rua Piauí, 400 — Higienópolis, São Paulo - SP", condominium: "Edifício Piauí Premium", purpose: "comprar", propertyType: "Cobertura", badge: "DESTAQUE", beds: 3, baths: 4, parking: 3, area: 250, priceValue: 3_500_000 },
  { title: "Apartamento para Alugar em Itaim Bibi", location: "Itaim Bibi, São Paulo - SP", address: "Rua João Cachoeira, 500 — Itaim Bibi, São Paulo - SP", condominium: "Itaim Residence", purpose: "alugar", propertyType: "Apartamento", beds: 2, baths: 2, parking: 2, area: 95, priceValue: 8_500 },
  { title: "Terreno em Condomínio em Valinhos", location: "Valinhos, SP", address: "Rod. Anhanguera, km 90 — Valinhos, SP", condominium: "Condomínio Horizonte", purpose: "comprar", propertyType: "Terreno em Condomínio", beds: 0, baths: 0, parking: 0, area: 600, priceValue: 750_000 },
  { title: "Galpão Logístico em Guarulhos", location: "Guarulhos, SP", address: "Av. Monteiro Lobato, 3000 — Guarulhos, SP", condominium: "Parque Logístico Guarulhos", purpose: "alugar", propertyType: "Galpão", beds: 0, baths: 2, parking: 10, area: 2500, priceValue: 45_000 },
  { title: "Chácara em Mairiporã", location: "Mairiporã, SP", address: "Estrada do Mananciais, km 8 — Mairiporã, SP", condominium: "Chácara dos Mananciais", purpose: "comprar", propertyType: "Chácara", beds: 3, baths: 2, parking: 5, area: 5000, priceValue: 890_000 },
  { title: "Prédio Comercial na Paulista", location: "Bela Vista, São Paulo - SP", address: "Av. Paulista, 1500 — Bela Vista, São Paulo - SP", condominium: "Edifício Paulista Corporate", purpose: "alugar", propertyType: "Prédio comercial", beds: 0, baths: 4, parking: 8, area: 800, priceValue: 35_000 },
  { title: "Apartamento Novo em Vila Olímpia", location: "Vila Olímpia, São Paulo - SP", address: "Rua Funchal, 300 — Vila Olímpia, São Paulo - SP", condominium: "Funchal Tower", purpose: "comprar", propertyType: "Apartamento", badge: "LANÇAMENTO", beds: 2, baths: 2, parking: 2, area: 78, priceValue: 1_350_000 },
  { title: "Casa em Condomínio em Granja Viana", location: "Granja Viana, Cotia - SP", address: "Alameda das Palmeiras, 200 — Granja Viana, Cotia - SP", condominium: "Granja Viana Clube", purpose: "comprar", propertyType: "Casa em Condomínio", beds: 4, baths: 4, parking: 4, area: 300, priceValue: 2_400_000 },
  { title: "Espaço Comercial em Pinheiros", location: "Pinheiros, São Paulo - SP", address: "Rua Teodoro Sampaio, 1200 — Pinheiros, São Paulo - SP", condominium: "Galeria Teodoro", purpose: "alugar", propertyType: "Espaço comercial", beds: 0, baths: 1, parking: 2, area: 120, priceValue: 12_000 },
  { title: "Apartamento em Santana", location: "Santana, São Paulo - SP", address: "Rua Voluntários da Pátria, 800 — Santana, São Paulo - SP", condominium: "Residencial Voluntários", purpose: "comprar", propertyType: "Apartamento", beds: 2, baths: 1, parking: 1, area: 65, priceValue: 520_000 },
  { title: "Cobertura em Campinas", location: "Cambuí, Campinas - SP", address: "Rua Barão de Jaguara, 500 — Cambuí, Campinas - SP", condominium: "Cambuí Premium", purpose: "comprar", propertyType: "Cobertura", badge: "DESTAQUE", beds: 3, baths: 3, parking: 3, area: 210, priceValue: 2_200_000 },
  { title: "Apartamento em Guarujá", location: "Pitangueiras, Guarujá - SP", address: "Av. Puglisi, 100 — Pitangueiras, Guarujá - SP", condominium: "Edifício Pitangueiras", purpose: "comprar", propertyType: "Apartamento", badge: "LANÇAMENTO", beds: 3, baths: 2, parking: 2, area: 110, priceValue: 1_450_000 },
  { title: "Casa em Condomínio em São Roque", location: "São Roque, SP", address: "Estrada do Vinho, km 5 — São Roque, SP", condominium: "Vale dos Vinhedos", purpose: "comprar", propertyType: "Casa em Condomínio", beds: 3, baths: 3, parking: 3, area: 250, priceValue: 1_100_000 },
  { title: "Apartamento em Tatuapé", location: "Tatuapé, São Paulo - SP", address: "Rua Serra de Bragança, 400 — Tatuapé, São Paulo - SP", condominium: "Residencial Bragança", purpose: "alugar", propertyType: "Apartamento", beds: 2, baths: 2, parking: 1, area: 72, priceValue: 4_200 },
  { title: "Terreno em São José dos Campos", location: "Urbanova, São José dos Campos - SP", address: "Av. Jorge Zarur, 1000 — Urbanova, São José dos Campos - SP", condominium: "Condomínio Urbanova", purpose: "comprar", propertyType: "Terreno", beds: 0, baths: 0, parking: 0, area: 450, priceValue: 620_000 },
  { title: "Apartamento em Lapa", location: "Lapa, São Paulo - SP", address: "Rua Guaicurus, 200 — Lapa, São Paulo - SP", condominium: "Edifício Guaicurus", purpose: "comprar", propertyType: "Apartamento", beds: 2, baths: 2, parking: 1, area: 68, priceValue: 580_000 },
  { title: "Casa em Condomínio em Indaiatuba", location: "Indaiatuba, SP", address: "Alameda dos Ipês, 300 — Indaiatuba, SP", condominium: "Residencial Ipês", purpose: "comprar", propertyType: "Casa em Condomínio", beds: 3, baths: 3, parking: 2, area: 200, priceValue: 1_350_000 },
  { title: "Apartamento em Santo André", location: "Jardim, Santo André - SP", address: "Rua Coronel Oliveira Lima, 500 — Santo André, SP", condominium: "Residencial Oliveira", purpose: "comprar", propertyType: "Apartamento", beds: 3, baths: 2, parking: 2, area: 90, priceValue: 680_000 },
  { title: "Edifício Residencial em Osasco", location: "Centro, Osasco - SP", address: "Av. dos Autonomistas, 2000 — Osasco, SP", condominium: "Osasco Prime", purpose: "comprar", propertyType: "Edifício", badge: "LANÇAMENTO", beds: 2, baths: 2, parking: 1, area: 70, priceValue: 490_000 },
];

function formatPrice(value: number, purpose: PropertyPurpose): string {
  const formatted = value.toLocaleString("pt-BR");
  return purpose === "alugar" ? `R$ ${formatted}/mês` : `R$ ${formatted}`;
}

const CUSTOM_FEATURES: PropertyFeature[] = [
  { label: "Área gourmet", icon: "gourmet" },
  { label: "Academia", icon: "gym" },
  { label: "Jardim", icon: "garden" },
  { label: "Elevador social", icon: "elevator" },
  { label: "Varanda gourmet", icon: "balcony" },
  { label: "Home office", icon: "wifi" },
  { label: "Adega climatizada", icon: "gourmet" },
  { label: "Espaço pet", icon: "garden" },
];

function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function amenityFeature(id: PropertyAmenityId, parking: number): PropertyFeature {
  const amenity = AMENITY_CATALOG.find((entry) => entry.id === id)!;

  if (id === "parking_space" && parking > 0) {
    return {
      label: parking === 1 ? "1 vaga" : `${parking} vagas`,
      icon: "parking",
      amenityId: "parking_space",
    };
  }

  return {
    label: amenity.label,
    icon: amenity.icon,
    amenityId: amenity.id,
  };
}

/** Each listing gets 1–10 features mixing catalog amenities and customizable items. */
function featuresForListing(listingIndex: number, parking: number): PropertyFeature[] {
  const targetCount = (listingIndex % 10) + 1;

  const amenityIds = AMENITY_CATALOG.map((entry) => entry.id).filter(
    (id) => id !== "parking_space" || parking > 0,
  );
  const rotatedAmenities = rotate(amenityIds, listingIndex);
  const rotatedCustom = rotate(CUSTOM_FEATURES, listingIndex * 3);

  if (targetCount === 1) {
    return listingIndex % 2 === 0
      ? [amenityFeature(rotatedAmenities[0], parking)]
      : [{ ...rotatedCustom[0] }];
  }

  const features: PropertyFeature[] = [
    { ...rotatedCustom[0] },
    amenityFeature(rotatedAmenities[0], parking),
  ];

  let amenityIndex = 1;
  let customIndex = 1;
  let pickAmenity = true;

  while (features.length < targetCount) {
    if (pickAmenity && amenityIndex < rotatedAmenities.length) {
      features.push(amenityFeature(rotatedAmenities[amenityIndex++], parking));
    } else if (customIndex < rotatedCustom.length) {
      features.push({ ...rotatedCustom[customIndex++] });
    } else if (amenityIndex < rotatedAmenities.length) {
      features.push(amenityFeature(rotatedAmenities[amenityIndex++], parking));
    } else {
      break;
    }
    pickAmenity = !pickAmenity;
  }

  return features.slice(0, targetCount);
}

function descriptionFor(template: ListingTemplate): string[] {
  const purposeText = template.purpose === "alugar" ? "locação" : "venda";
  return [
    `${template.title} disponível para ${purposeText}. Imóvel ${template.propertyType.toLowerCase()} com ${template.area} m², ${template.beds} quarto(s), ${template.baths} banheiro(s) e ${template.parking} vaga(s) de garagem.`,
    `Localizado em ${template.location}, com fácil acesso a comércio, escolas, hospitais e principais vias. Condomínio ${template.condominium} oferece infraestrutura completa de lazer e segurança.`,
    `Acabamento de alto padrão, ambientes bem distribuídos e iluminação natural. Ideal para quem busca conforto, praticidade e valorização patrimonial na região.`,
  ];
}

export function seedCompletedListings() {
  const before = propertyCount();
  const created: string[] = [];

  for (let i = 0; i < TEMPLATES.length; i++) {
    const template = TEMPLATES[i];
    const code = `LOT-${String(41 + i).padStart(3, "0")}`;
    const imageIndex = i % 3;

    const property = createProperty({
      title: template.title,
      location: template.location,
      address: template.address,
      badge: template.badge,
      purpose: template.purpose,
      propertyType: template.propertyType,
      condominium: template.condominium,
      code,
      image: IMAGES[imageIndex],
      gallery: IMAGES,
      beds: template.beds,
      baths: template.baths,
      parking: template.parking,
      area: template.area,
      price: formatPrice(template.priceValue, template.purpose),
      priceValue: template.priceValue,
      description: descriptionFor(template),
      features: featuresForListing(i, template.parking),
    });

    created.push(property.slug);
  }

  const after = propertyCount();
  console.log(`Created ${created.length} completed listings (${before} → ${after} total).`);
  return created;
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("/db/seed-completed-listings.ts");
if (isDirectRun) {
  seedCompletedListings();
}
