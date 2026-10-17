import { createHash } from "node:crypto";
import type { CreatePaymentInput, CreatePaymentResult } from "./types";

const API = "https://securepay.tinkoff.ru/v2/Init";

export function tbankConfigured(): boolean {
  return Boolean(process.env.TBANK_TERMINAL_KEY && process.env.TBANK_PASSWORD);
}

/**
 * Подпись Т-Банк (Tinkoff): берём корневые строковые/числовые параметры,
 * добавляем Password, сортируем по ключу, конкатенируем значения, SHA-256.
 */
export function tbankToken(
  params: Record<string, string | number | boolean>,
  password: string,
): string {
  const source: Record<string, string> = { ...stringify(params), Password: password };
  delete source.Token;
  const concatenated = Object.keys(source)
    .sort()
    .map((key) => source[key])
    .join("");
  return createHash("sha256").update(concatenated, "utf8").digest("hex");
}

function stringify(params: Record<string, string | number | boolean>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") continue;
    out[key] = String(value);
  }
  return out;
}

export function verifyTbankNotification(
  payload: Record<string, unknown>,
): boolean {
  const password = process.env.TBANK_PASSWORD;
  if (!password) return false;
  const incoming = String(payload.Token ?? "");
  const scalars: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "Token") continue;
    if (value === null || typeof value === "object") continue;
    scalars[key] = value as string | number | boolean;
  }
  return incoming.length > 0 && tbankToken(scalars, password) === incoming;
}

export async function createTbankPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const terminalKey = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;

  if (!terminalKey || !password) {
    return {
      ok: false,
      mode: "demo",
      externalId: "",
      confirmationUrl: "",
      status: "canceled",
      error: "Не заданы TBANK_TERMINAL_KEY и TBANK_PASSWORD",
    };
  }

  const base = {
    TerminalKey: terminalKey,
    Amount: input.amountKop,
    OrderId: input.orderId,
    Description: input.description.slice(0, 250),
    SuccessURL: input.returnUrl,
    FailURL: input.returnUrl,
  };

  const body: Record<string, unknown> = {
    ...base,
    Token: tbankToken(base, password),
  };
  if (input.method === "sbp") body.PayType = "O";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json()) as {
      Success?: boolean;
      PaymentId?: string | number;
      PaymentURL?: string;
      Message?: string;
      Details?: string;
      Status?: string;
    };

    if (!data.Success || !data.PaymentURL) {
      return {
        ok: false,
        mode: "live",
        externalId: String(data.PaymentId ?? ""),
        confirmationUrl: "",
        status: "canceled",
        error: [data.Message, data.Details].filter(Boolean).join(": ") || "Ошибка Т-Банк",
      };
    }

    return {
      ok: true,
      mode: "live",
      externalId: String(data.PaymentId ?? ""),
      confirmationUrl: data.PaymentURL,
      status: data.Status === "CONFIRMED" ? "succeeded" : "pending",
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
