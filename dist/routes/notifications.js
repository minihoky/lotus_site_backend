import { Hono } from "hono";
import { z } from "zod";
import { countUnreadInquiries, listUnreadInquiries, markInquiriesAsRead, } from "../db/index.js";
const notificationSchema = z.object({
    name: z.string().trim().min(1, "Nome é obrigatório"),
    date: z.string().trim().min(1, "Data é obrigatória"),
});
export const notificationsRouter = new Hono();
notificationsRouter.get("/count", (c) => {
    const count = countUnreadInquiries();
    return c.json({ data: { count } });
});
notificationsRouter.get("/unread", (c) => {
    const inquiries = listUnreadInquiries();
    return c.json({ data: inquiries, total: inquiries.length });
});
notificationsRouter.post("/", async (c) => {
    let body;
    try {
        body = await c.req.json();
    }
    catch {
        return c.json({ error: "Invalid JSON body" }, 400);
    }
    const parsed = notificationSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const { name, date } = parsed.data;
    console.log(`[notification] Reserva: ${name} — ${date}`);
    return c.json({
        data: {
            name,
            date,
            message: "Notificação registrada com sucesso.",
        },
    }, 201);
});
notificationsRouter.post("/mark-read", async (c) => {
    let ids;
    try {
        const body = await c.req.json();
        if (body && typeof body === "object" && "ids" in body) {
            const parsed = z.array(z.number().int().positive()).safeParse(body.ids);
            if (parsed.success) {
                ids = parsed.data;
            }
        }
    }
    catch {
        // No body — mark all unread as read.
    }
    const marked = markInquiriesAsRead(ids);
    return c.json({ data: { marked } });
});
