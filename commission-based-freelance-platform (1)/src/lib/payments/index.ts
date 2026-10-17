import { randomUUID } from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  ProviderKey,
  ProviderStatus,
} from "./types";
import { createYookassaPayment, yookassaConfigured } from "./yookassa";
import { createTbankPayment, tbankConfigured } from "./tbank";
import { createRobokassaPayment, robokassaConfigured } from "./robokassa";

export * from "./types";
export { verifyTbankNotification } from "./tbank";
export { verifyRobokassaResult } from "./robokassa";

export const PROVIDERS: Omit<ProviderStatus, "configured" | "mode">[] = [
  {
    key: "yookassa",
    name: "ЮKassa",
    logo: "🟣",
    envKeys: ["YOOKASSA_SHOP_ID", "YOOKASSA_SECRET_KEY"],
    methods: ["Банковские карты", "СБП", "ЮMoney", "SberPay", "Рассрочка"],
    feeLabel: "от 2,8%",
    payoutSupport: "Выплаты самозанятым и на карты (Выплаты ЮKassa)",
    docsUrl: "https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start",
    description:
      "Главный эквайринг площадки: чеки по 54-ФЗ, безопасная сделка, сплит-платежи для маркетплейсов.",
  },
  {
    key: "tbank",
    name: "Т-Банк (Tinkoff)",
    logo: "🟡",
    envKeys: ["TBANK_TERMINAL_KEY", "TBANK_PASSWORD"],
    methods: ["Карты", "СБП", "T-Pay", "Долями"],
    feeLabel: "от 2,3%",
    payoutSupport: "Реестровые выплаты на карты и счета ИП",
    docsUrl: "https://www.tbank.ru/kassa/dev/payments/",
    description:
      "Резервный эквайринг и быстрые выплаты исполнителям. Подпись запросов — SHA-256 с паролем терминала.",
  },
  {
    key: "robokassa",
    name: "Robokassa",
    logo: "🔵",
    envKeys: ["ROBOKASSA_LOGIN", "ROBOKASSA_PASSWORD1", "ROBOKASSA_PASSWORD2"],
    methods: ["Карты", "СБП", "Электронные кошельки"],
    feeLabel: "от 2,7%",
    payoutSupport: "Выплаты физлицам по реестру",
    docsUrl: "https://docs.robokassa.ru/",
    description:
      "Подключается редиректом с MD5-подписью. Удобна как запасной канал приёма оплат.",
  },
  {
    key: "sbp",
    name: "СБП (QR)",
    logo: "🟢",
    envKeys: ["YOOKASSA_SHOP_ID", "YOOKASSA_SECRET_KEY"],
    methods: ["QR-код", "Платёжная ссылка"],
    feeLabel: "0,4–0,7%",
    payoutSupport: "Моментальные выплаты по номеру телефона",
    docsUrl: "https://yookassa.ru/developers/payment-acceptance/integration-scenarios/manual-integration/other/sbp",
    description:
      "Самый дешёвый приём денег. Работает поверх ЮKassa — отдельных ключей не требует.",
  },
];

export function providerConfigured(key: ProviderKey): boolean {
  switch (key) {
    case "yookassa":
    case "sbp":
      return yookassaConfigured();
    case "tbank":
      return tbankConfigured();
    case "robokassa":
      return robokassaConfigured();
    default:
      return false;
  }
}

export function getProviderStatuses(): ProviderStatus[] {
  return PROVIDERS.map((p) => {
    const configured = providerConfigured(p.key);
    return { ...p, configured, mode: configured ? "live" : "demo" };
  });
}

export function anyProviderLive(): boolean {
  return getProviderStatuses().some((p) => p.configured);
}

export function newIdempotenceKey(): string {
  return randomUUID();
}

/**
 * Единая точка создания платежа. Если ключи провайдера не заданы,
 * возвращаем демо-платёж с внутренней страницей подтверждения —
 * так весь сценарий работает до подключения боевых ключей.
 */
export async function createPayment(
  provider: ProviderKey,
  input: CreatePaymentInput,
  invoiceId: number,
): Promise<CreatePaymentResult> {
  if (!providerConfigured(provider)) {
    return {
      ok: true,
      mode: "demo",
      externalId: `demo_${invoiceId}_${Date.now().toString(36)}`,
      confirmationUrl: `/pay/demo/${invoiceId}`,
      status: "pending",
    };
  }

  switch (provider) {
    case "yookassa":
      return createYookassaPayment(input);
    case "sbp":
      return createYookassaPayment({ ...input, method: "sbp" });
    case "tbank":
      return createTbankPayment(input);
    case "robokassa":
      return createRobokassaPayment(input, invoiceId);
    default:
      return {
        ok: false,
        mode: "demo",
        externalId: "",
        confirmationUrl: "",
        status: "canceled",
        error: "Неизвестный провайдер",
      };
  }
}

/** Комиссия эквайринга для отображения, в копейках */
export function acquiringFeeKop(provider: ProviderKey, amountKop: number): number {
  const bps: Record<ProviderKey, number> = {
    yookassa: 280,
    tbank: 230,
    robokassa: 270,
    sbp: 50,
  };
  return Math.round((amountKop * (bps[provider] ?? 280)) / 10000);
}
