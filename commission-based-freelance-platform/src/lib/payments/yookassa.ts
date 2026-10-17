import type { CreatePaymentInput, CreatePaymentResult } from "./types";
import { rub } from "./types";

const API = "https://api.yookassa.ru/v3/payments";

export function yookassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

/**
 * Создание платежа в ЮKassa.
 * POST /v3/payments, Basic-авторизация shopId:secretKey + Idempotence-Key.
 */
export async function createYookassaPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secret) {
    return {
      ok: false,
      mode: "demo",
      externalId: "",
      confirmationUrl: "",
      status: "canceled",
      error: "Не заданы YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY",
    };
  }

  const body: Record<string, unknown> = {
    amount: { value: rub(input.amountKop), currency: "RUB" },
    capture: true,
    confirmation: { type: "redirect", return_url: input.returnUrl },
    description: input.description.slice(0, 128),
    metadata: { order_id: input.orderId },
  };

  if (input.method === "sbp") body.payment_method_data = { type: "sbp" };
  if (input.method === "bank_card") body.payment_method_data = { type: "bank_card" };
  if (input.customerEmail) {
    body.receipt = {
      customer: { email: input.customerEmail },
      items: [
        {
          description: input.description.slice(0, 128),
          quantity: "1.00",
          amount: { value: rub(input.amountKop), currency: "RUB" },
          vat_code: 1, // без НДС (УСН)
          payment_mode: "full_payment",
          payment_subject: "service",
        },
      ],
    };
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`,
        "Idempotence-Key": input.idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      id?: string;
      status?: string;
      confirmation?: { confirmation_url?: string };
      description?: string;
    };

    if (!res.ok || !data.id) {
      return {
        ok: false,
        mode: "live",
        externalId: "",
        confirmationUrl: "",
        status: "canceled",
        error: data.description ?? `ЮKassa вернула ошибку ${res.status}`,
      };
    }

    return {
      ok: true,
      mode: "live",
      externalId: data.id,
      confirmationUrl: data.confirmation?.confirmation_url ?? "",
      status: data.status === "succeeded" ? "succeeded" : "pending",
    };
  } catch (error) {
    return {
      ok: false,
      mode: "live",
      externalId: "",
      confirmationUrl: "",
      status: "canceled",
      error: error instanceof Error ? error.message : "Сеть недоступна",
    };
  }
}
