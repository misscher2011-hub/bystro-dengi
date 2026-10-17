import { createHash } from "node:crypto";
import type { CreatePaymentInput, CreatePaymentResult } from "./types";
import { rub } from "./types";

const PAY_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";

export function robokassaConfigured(): boolean {
  return Boolean(
    process.env.ROBOKASSA_LOGIN &&
      process.env.ROBOKASSA_PASSWORD1 &&
      process.env.ROBOKASSA_PASSWORD2,
  );
}

function md5(value: string): string {
  return createHash("md5").update(value, "utf8").digest("hex");
}

/**
 * Robokassa работает редиректом: подпись
 * md5(MerchantLogin:OutSum:InvId:Password1)
 */
export function createRobokassaPayment(
  input: CreatePaymentInput,
  invoiceId: number,
): CreatePaymentResult {
  const login = process.env.ROBOKASSA_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD1;

  if (!login || !password1) {
    return {
      ok: false,
      mode: "demo",
      externalId: "",
      confirmationUrl: "",
      status: "canceled",
      error: "Не заданы ROBOKASSA_LOGIN и ROBOKASSA_PASSWORD1",
    };
  }

  const outSum = rub(input.amountKop);
  const signature = md5(`${login}:${outSum}:${invoiceId}:${password1}`);
  const params = new URLSearchParams({
    MerchantLogin: login,
    OutSum: outSum,
    InvId: String(invoiceId),
    Description: input.description.slice(0, 100),
    SignatureValue: signature,
    Culture: "ru",
    Encoding: "utf-8",
  });
  if (process.env.ROBOKASSA_TEST_MODE === "1") params.set("IsTest", "1");

  return {
    ok: true,
    mode: "live",
    externalId: String(invoiceId),
    confirmationUrl: `${PAY_URL}?${params.toString()}`,
    status: "pending",
  };
}

/** Проверка ResultURL: md5(OutSum:InvId:Password2) */
export function verifyRobokassaResult(
  outSum: string,
  invId: string,
  signature: string,
): boolean {
  const password2 = process.env.ROBOKASSA_PASSWORD2;
  if (!password2) return false;
  const expected = md5(`${outSum}:${invId}:${password2}`);
  return expected.toLowerCase() === signature.toLowerCase();
}
