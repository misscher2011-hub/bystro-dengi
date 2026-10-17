import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Подтверждение демо-платежа (внутренняя песочница).
 * Для боевых провайдеров статус приходит в вебхук.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: number; outcome?: string };
    const id = Number(body.id ?? 0);
    const outcome = body.outcome === "canceled" ? "canceled" : "succeeded";

    if (!id) {
      return Response.json({ ok: false, error: "Не указан платёж" }, { status: 400 });
    }

    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    if (!payment) {
      return Response.json({ ok: false, error: "Платёж не найден" }, { status: 404 });
    }
    if (payment.mode !== "demo") {
      return Response.json(
        { ok: false, error: "Боевой платёж подтверждается вебхуком провайдера" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(payments)
      .set({
        status: outcome,
        paidAt: outcome === "succeeded" ? new Date() : null,
      })
      .where(eq(payments.id, id))
      .returning();

    return Response.json({ ok: true, payment: updated });
  } catch {
    return Response.json({ ok: false, error: "Ошибка подтверждения" }, { status: 500 });
  }
}
