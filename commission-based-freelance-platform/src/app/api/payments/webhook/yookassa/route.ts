import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Вебхук ЮKassa: payment.succeeded / payment.canceled / payment.waiting_for_capture.
 * URL для кабинета ЮKassa: https://<домен>/api/payments/webhook/yookassa
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      event?: string;
      object?: {
        id?: string;
        status?: string;
        paid?: boolean;
        amount?: { value?: string };
        payment_method?: { type?: string };
        metadata?: { order_id?: string };
      };
    };

    const object = body.object;
    if (!object?.id) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const status =
      object.status === "succeeded"
        ? "succeeded"
        : object.status === "canceled"
          ? "canceled"
          : "pending";

    // Ищем по id провайдера, затем по нашему order_id (BD-<id>)
    let [row] = await db
      .select()
      .from(payments)
      .where(eq(payments.externalId, object.id));

    if (!row && object.metadata?.order_id) {
      const localId = Number(object.metadata.order_id.replace("BD-", ""));
      if (Number.isFinite(localId) && localId > 0) {
        [row] = await db.select().from(payments).where(eq(payments.id, localId));
      }
    }

    if (!row) {
      // Платёж не наш — отвечаем 200, чтобы ЮKassa не ретраила бесконечно
      return Response.json({ ok: true, skipped: true });
    }

    await db
      .update(payments)
      .set({
        status,
        externalId: object.id,
        method: object.payment_method?.type ?? row.method,
        paidAt: status === "succeeded" ? new Date() : null,
      })
      .where(eq(payments.id, row.id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
