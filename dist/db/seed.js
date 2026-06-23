import { db, propertyCount } from "./index.js";
const IMG = {
    p1: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop",
    p2: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&auto=format&fit=crop",
    p3: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80&auto=format&fit=crop",
};
const SEED_PROPERTIES = [
    {
        slug: "casa-em-condominio",
        title: "Casa em Condomínio",
        location: "Alphaville, São Paulo - SP",
        address: "Alameda Rio Negro, 500 — Alphaville, Barueri - SP",
        badge: "DESTAQUE",
        image: IMG.p1,
        gallery: [
            IMG.p1,
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80&auto=format&fit=crop",
        ],
        beds: 4,
        baths: 5,
        parking: 3,
        area: 320,
        price: "R$ 2.850.000",
        priceValue: 2_850_000,
        description: [
            "Residência de alto padrão em condomínio fechado, com arquitetura contemporânea e acabamentos de primeira linha. Ambientes amplos e integrados, com pé-direito duplo na sala de estar e iluminação natural abundante.",
            "A área externa conta com piscina aquecida, espaço gourmet completo e jardim paisagístico — ideal para receber família e amigos com conforto e privacidade.",
            "Localizada em uma das regiões mais valorizadas de Alphaville, próxima a escolas internacionais, shoppings e principais vias de acesso.",
        ],
        features: [
            { label: "Piscina", icon: "pool" },
            { label: "Área gourmet", icon: "gourmet" },
            { label: "Segurança 24h", icon: "security" },
            { label: "Ar condicionado", icon: "ac" },
            { label: "Academia", icon: "gym" },
            { label: "Jardim", icon: "garden" },
            { label: "Wi-Fi", icon: "wifi" },
            { label: "3 vagas", icon: "parking" },
        ],
    },
    {
        slug: "edificio-lotus-residence",
        title: "Edifício Lótus Residence",
        location: "Centro, São Paulo - SP",
        address: "Rua Augusta, 1200 — Consolação, São Paulo - SP",
        badge: "LANÇAMENTO",
        image: IMG.p2,
        gallery: [
            IMG.p2,
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80&auto=format&fit=crop",
        ],
        beds: 3,
        baths: 3,
        parking: 2,
        area: 110,
        price: "R$ 1.150.000",
        priceValue: 1_150_000,
        description: [
            "Lançamento exclusivo no coração de São Paulo, com plantas inteligentes e vista panorâmica da cidade. O Edifício Lótus Residence combina design sofisticado com tecnologia de ponta.",
            "Apartamentos com varanda gourmet, cozinha integrada e suíte master com closet. Áreas comuns incluem rooftop com piscina, salão de festas e coworking.",
            "Excelente localização com fácil acesso ao metrô, restaurantes, teatros e principais centros empresariais da região central.",
        ],
        features: [
            { label: "Piscina", icon: "pool" },
            { label: "Varanda gourmet", icon: "gourmet" },
            { label: "Portaria 24h", icon: "security" },
            { label: "Ar condicionado", icon: "ac" },
            { label: "Academia", icon: "gym" },
            { label: "Coworking", icon: "wifi" },
            { label: "Elevador social", icon: "elevator" },
            { label: "2 vagas", icon: "parking" },
        ],
    },
    {
        slug: "apartamento-premium",
        title: "Apartamento Premium",
        location: "Vila Mariana, São Paulo - SP",
        address: "Rua Domingos de Morais, 2564 — Vila Mariana, São Paulo - SP",
        image: IMG.p3,
        gallery: [
            IMG.p3,
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600047509807-ba8f64d4cd21?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400&q=80&auto=format&fit=crop",
        ],
        beds: 2,
        baths: 2,
        parking: 1,
        area: 75,
        price: "R$ 780.000",
        priceValue: 780_000,
        description: [
            "Apartamento reformado com bom gosto, em prédio bem conservado na Vila Mariana. Ambientes claros e arejados, com piso em porcelanato e iluminação LED em todos os cômodos.",
            "Cozinha americana com bancada em quartzo, sala ampla com varanda e dois dormitórios, sendo um suíte. Perfeito para casais ou pequenas famílias.",
            "Região completa em infraestrutura: metrô a poucos minutos, hospitais, parques e comércio variado nas proximidades.",
        ],
        features: [
            { label: "Varanda", icon: "balcony" },
            { label: "Cozinha americana", icon: "gourmet" },
            { label: "Portaria", icon: "security" },
            { label: "Ar condicionado", icon: "ac" },
            { label: "Área de lazer", icon: "garden" },
            { label: "Wi-Fi", icon: "wifi" },
            { label: "Elevador", icon: "elevator" },
            { label: "1 vaga", icon: "parking" },
        ],
    },
];
const upsert = db.prepare(`
  INSERT INTO properties (
    slug, title, location, address, badge, image, gallery,
    beds, baths, parking, area, price, price_value, description, features, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
  )
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    location = excluded.location,
    address = excluded.address,
    badge = excluded.badge,
    image = excluded.image,
    gallery = excluded.gallery,
    beds = excluded.beds,
    baths = excluded.baths,
    parking = excluded.parking,
    area = excluded.area,
    price = excluded.price,
    price_value = excluded.price_value,
    description = excluded.description,
    features = excluded.features
`);
export function seedDatabase() {
    for (const p of SEED_PROPERTIES) {
        upsert.run(p.slug, p.title, p.location, p.address, p.badge ?? null, p.image, JSON.stringify(p.gallery), p.beds, p.baths, p.parking, p.area, p.price, p.priceValue, JSON.stringify(p.description), JSON.stringify(p.features));
    }
    console.log(`Seeded ${SEED_PROPERTIES.length} properties (${propertyCount()} total in database).`);
}
const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("/db/seed.ts");
if (isDirectRun) {
    seedDatabase();
}
