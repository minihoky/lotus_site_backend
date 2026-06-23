import { Hono } from "hono";
import { z } from "zod";
import { createInquiry, deleteInquiry, getPropertyBySlug, listInquiries } from "../db/index.js";
const inquirySchema = z.object({
    propertySlug: z.string().min(1).optional(),
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
    phone: z.string().trim().min(8, "Telefone inválido"),
    email: z.string().trim().email("E-mail inválido"),
    message: z.string().trim().optional(),
});
const listQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
});
export const inquiriesRouter = new Hono();
inquiriesRouter.get("/", (c) => {
    const parsed = listQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
        return c.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, 400);
    }
    const inquiries = listInquiries(parsed.data.limit);
    return c.json({ data: inquiries, total: inquiries.length });
});
inquiriesRouter.post("/", async (c) => {
    let body;
    try {
        body = await c.req.json();
    }
    catch {
        return c.json({ error: "Invalid JSON body" }, 400);
    }
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const { propertySlug, name, phone, email, message } = parsed.data;
    if (propertySlug && !getPropertyBySlug(propertySlug)) {
        return c.json({ error: "Property not found" }, 404);
    }
    const inquiry = createInquiry({ propertySlug, name, phone, email, message });
    return c.json({
        data: {
            id: inquiry.id,
            message: "Mensagem enviada com sucesso. Entraremos em contato em breve.",
        },
    }, 201);
});
inquiriesRouter.delete("/:id", (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id < 1) {
        return c.json({ error: "Invalid inquiry id" }, 400);
    }
    const deleted = deleteInquiry(id);
    if (!deleted) {
        return c.json({ error: "Inquiry not found" }, 404);
    }
    return c.json({ data: { id, message: "Reserva excluída com sucesso." } });
});
