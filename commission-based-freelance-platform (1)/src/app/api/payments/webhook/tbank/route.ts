import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyTbankNotification } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Нотификации Т-Банк. Ожидается ответ строкой "OK".
 * NotificationURL: https://<домен>/api/payments/webhook/tbank
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    if (!verifyTbankNotification(payload)) {
      return new Response("BAD TOKEN", { status: 403 });
    }

    const orderId = String(payload.OrderId ?? "");
    const localId = Number(orderId.replace("BD-", ""));
    const tbankStatus = String(payload.Status ?? "");
    const status =
      tbankStatus === "CONFIRMED" || tbankStatus === "AUTHORIZED"
        ? "succeeded"
        : tbankStatus === "REJECTED" || tbankStatus === "CANCELED"
          ? "canceled"
          : "pending";

    if (Number.isFinite(localId) && localId > 0) {
      await db
        .update(payments)
        .set({
          status,
          externalId: String(payload.PaymentId ?? ""),
          paidAt: status === "succeeded" ? new Date() : null,
        })
        .where(eq(payments.id, localId));
    }

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("ERROR", { status: 500 });
  }
}
