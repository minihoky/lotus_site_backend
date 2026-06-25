/**
 * Verifies multipart `features` parsing for all FormData shapes Hono may produce.
 */
import { Hono } from "hono";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SAMPLE_FEATURES = [
  { label: "Piscina privativa", icon: "pool", amenityId: "private_pool" },
  { label: "Terraço", icon: "balcony", amenityId: "terrace" },
  { label: "Portaria 24h", icon: "security", amenityId: "security_24h" },
  { label: "Ar condicionado", icon: "ac", amenityId: "air_conditioning" },
  { label: "Marina", icon: "marina", amenityId: "marina" },
  { label: "Wi-Fi", icon: "wifi", amenityId: "wifi" },
  { label: "1 vaga", icon: "parking", amenityId: "parking_space" },
  { label: "Restaurante", icon: "gourmet" },
  { label: "Academia", icon: "gym" },
];

const VALID_ICONS = new Set([
  "pool",
  "gourmet",
  "security",
  "ac",
  "gym",
  "garden",
  "wifi",
  "parking",
  "elevator",
  "balcony",
  "beach",
  "marina",
]);

const VALID_AMENITY_IDS = new Set([
  "private_pool",
  "terrace",
  "security_24h",
  "air_conditioning",
  "private_beach",
  "marina",
  "wifi",
  "parking_space",
]);

const parseOptions = {
  isValidIcon: (icon) => VALID_ICONS.has(icon),
  isValidAmenityId: (id) => VALID_AMENITY_IDS.has(id),
};

const { readFeaturesField } = await import(
  pathToFileURL(join(__dirname, "../src/lib/parse-features-field.ts")).href
);

async function parseViaHono(form) {
  const app = new Hono();
  app.post("/test", async (c) => {
    const body = await c.req.parseBody({ all: true });
    const parsed = await readFeaturesField(body.features, parseOptions);
    return c.json({ count: (parsed ?? []).length, labels: (parsed ?? []).map((f) => f.label) });
  });

  const res = await app.fetch(new Request("http://localhost/test", { method: "POST", body: form }));
  return res.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testShape(name, buildForm, expectedCount) {
  const result = await parseViaHono(buildForm());
  assert(
    result.count === expectedCount,
    `${name}: expected ${expectedCount} features, got ${result.count} (${result.labels?.join(", ")})`,
  );
  console.log(`OK ${name}`);
}

const json = JSON.stringify(SAMPLE_FEATURES);

await testShape("single JSON string field", () => {
  const form = new FormData();
  form.append("features", json);
  return form;
}, 9);

await testShape("duplicate features fields (array of strings)", () => {
  const form = new FormData();
  form.append("features", json);
  form.append("features", "ignored");
  return form;
}, 9);

console.log("All parse-features checks passed.");
