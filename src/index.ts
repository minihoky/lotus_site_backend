import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { propertyCount } from "./db/index.js";
import { seedDatabase } from "./db/seed.js";
import { getUploadsDir } from "./lib/uploads.js";
import { inquiriesRouter } from "./routes/inquiries.js";
import { notificationsRouter } from "./routes/notifications.js";
import { propertiesRouter } from "./routes/properties.js";

if (propertyCount() === 0) {
  seedDatabase();
}

const app = new Hono();

const API_HOST = process.env.API_HOST ?? "127.0.0.1";
const API_PORT = Number(process.env.PORT ?? 3001);
const API_ORIGIN = `http://${API_HOST}:${API_PORT}`;

const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    API_ORIGIN,
  ].join(",")
)
  .split(",")
  .map((o) => o.trim());

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    service: "lotus-imoveis-api",
    properties: propertyCount(),
  }),
);

app.route("/api/properties", propertiesRouter);
app.route("/api/inquiries", inquiriesRouter);
app.route("/api/notifications", notificationsRouter);

app.use(
  "/uploads/*",
  serveStatic({
    root: getUploadsDir(),
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, ""),
  }),
);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = API_PORT;

serve({ fetch: app.fetch, port, hostname: API_HOST }, () => {
  console.log(`Lótus Imóveis API running at http://${API_HOST}:${port}`);
});

export default app;
