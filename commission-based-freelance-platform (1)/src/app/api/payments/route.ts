import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  acquiringFeeKop,
  createPayment,
  getProviderStatuses,
  newIdempotenceKey,
  type ProviderKey,
} from "@/lib/payments";
import { ensureMerchant, getPayments } from "@/lib/merchant";
import { getRate } from "@/lib/commission";
import { getDemoUser } from "@/lib/data";

export const dynamic = "force-dynamic";

const VALID: ProviderKey[] = ["yookassa", "tbank", "robokassa", "sbp"];

export async function GET() {
  const rows = await getPayments();
  return Response.json({
    ok: true,
    payments: rows,
    providers: getProviderStatuses(),
  });
}

export async function POST(request: Request) {
  try {
    await ensureMerchant();
    const body = (await request.json()) as Record<string, unknown>;

    const provider = String(body.provider ?? "yookassa") as ProviderKey;
    const amountRub = Number(body.amount ?? 0);
    const purpose = String(body.purpose ?? "escrow");
    const description =
      String(body.description ?? "").trim() || "Пополнение безопасной сделки";
    const customerEmail = String(body.customerEmail ?? "").trim();

    if (!VALID.includes(provider)) {
      return Response.json(
        { ok: false, error: "Неизвестная платёжная система" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amountRub) || amountRub < 10) {
      return Response.json(
        { ok: false, error: "Минимальная сумма платежа — 10 ₽" },
        { status: 400 },
      );
    }
    if (customerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      return Response.json(
        { ok: false, error: "Некорректный e-mail для чека" },
        { status: 400 },
      );
    }

    const amountKop = Math.round(amountRub * 100);
    const user = await getDemoUser();
    const rate = getRate(user.totalEarned);
    const platformFeeKop =
      purpose === "escrow" ? Math.round((amountKop * rate) / 100) : 0;
    const idempotenceKey = newIdempotenceKey();

    // Черновик платежа — нужен его id как OrderId/InvId для провайдера
    const [draft] = await db
      .insert(payments)
      .values({
        provider,
        purpose,
        amountKop,
        platformFeeKop,
        acquiringFeeKop: acquiringFeeKop(provider, amountKop),
        description,
        customerEmail,
        idempotenceKey,
        userId: user.id,
        status: "pending",
        method: provider === "sbp" ? "sbp" : "bank_card",
      })
      .returning();

    const origin = new URL(request.url).origin;
    const result = await createPayment(
      provider,
      {
        amountKop,
        description,
        orderId: `BD-${draft.id}`,
        returnUrl: `${origin}/pay/success?id=${draft.id}`,
        customerEmail: customerEmail || undefined,
        idempotenceKey,
      },
      draft.id,
    );

    const [saved] = await db
      .update(payments)
      .set({
        externalId: result.externalId,
        confirmationUrl: result.confirmationUrl,
        mode: result.mode,
        status: result.ok ? result.status : "canceled",
        errorText: result.error?.slice(0, 240) ?? "",
      })
      .where(eq(payments.id, draft.id))
      .returning();

    if (!result.ok) {
      return Response.json(
        { ok: false, error: result.error ?? "Платёж не создан", payment: saved },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      payment: saved,
      confirmationUrl: result.confirmationUrl,
      mode: result.mode,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось создать платёж" },
      { status: 500 },
    );
  }
}
