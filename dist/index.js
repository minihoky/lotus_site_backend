import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { propertyCount } from "./db/index.js";
import { seedDatabase } from "./db/seed.js";
import { getUploadsDir } from "./lib/uploads.js";
import { inquiriesRouter } from "./routes/inquiries.js";
import { propertiesRouter } from "./routes/properties.js";
if (propertyCount() === 0) {
    seedDatabase();
}
const app = new Hono();
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
app.use("*", logger());
app.use("*", cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
}));
app.get("/api/health", (c) => c.json({
    status: "ok",
    service: "lotus-imoveis-api",
    properties: propertyCount(),
}));
app.route("/api/properties", propertiesRouter);
app.route("/api/inquiries", inquiriesRouter);
app.use("/uploads/*", serveStatic({
    root: getUploadsDir(),
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, ""),
}));
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
});
const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => {
    console.log(`Lótus Imóveis API running at http://localhost:${port}`);
});
export default app;
