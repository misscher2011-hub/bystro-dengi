export type ProviderKey = "yookassa" | "tbank" | "robokassa" | "sbp";

export type CreatePaymentInput = {
  /** Сумма в копейках */
  amountKop: number;
  description: string;
  orderId: string;
  returnUrl: string;
  customerEmail?: string;
  /** bank_card | sbp | yoo_money */
  method?: string;
  idempotenceKey: string;
};

export type CreatePaymentResult = {
  ok: boolean;
  /** live — реальный запрос в платёжную систему, demo — внутренняя песочница */
  mode: "live" | "demo";
  externalId: string;
  confirmationUrl: string;
  status: "pending" | "succeeded" | "canceled";
  error?: string;
};

export type ProviderStatus = {
  key: ProviderKey;
  name: string;
  logo: string;
  /** Ключи окружения, нужные для боевого режима */
  envKeys: string[];
  configured: boolean;
  mode: "live" | "demo";
  methods: string[];
  feeLabel: string;
  payoutSupport: string;
  docsUrl: string;
  description: string;
};

export function rub(amountKop: number): string {
  return (amountKop / 100).toFixed(2);
}
