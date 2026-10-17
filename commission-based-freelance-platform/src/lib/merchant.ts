import { db } from "@/db";
import { ensureSchema } from "@/db/bootstrap";
import { merchantProfile, paymentSettings, payments } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import type { MerchantProfile } from "@/db/schema";

/**
 * Значения по умолчанию — замените на свои в админке «Реквизиты ИП».
 * Поля помечены как «шаблон», чтобы было видно, что ещё не заполнено.
 */
export const DEFAULT_MERCHANT = {
  brandName: "Быстро Деньги",
  legalName: "ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ ЧЕРНОВА АНГЕЛИНА РОМАНОВНА",
  ownerName: "Чернова Ангелина Романовна",
  inn: "643206975230",
  ogrnip: "326645700004229",
  okved: "63.11",
  taxSystem: "УСН «Доходы» 6%",
  registeredAt: "",
  legalAddress:
    "410503, РОССИЯ, САРАТОВСКАЯ ОБЛ, Г САРАТОВ, С МИХАЙЛОВКА, УЛ ЛЕНИНА, Д 1/1, КВ 1",
  bankName: "АО «ТБанк»",
  bankInn: "7710140679",
  bankAddress: "127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26",
  bik: "044525974",
  corrAccount: "30101810145250000974",
  settlementAccount: "40802810900009389317",
  email: "",
  phone: "",
  website: "",
  supportHours: "Пн–Вс, 09:00–21:00 МСК",
  offerUrl: "/legal",
};

/** Короткое имя для шапки/футера: «ИП Чернова А. Р.» */
export function shortLegalName(merchant: {
  legalName: string;
  ownerName: string;
}): string {
  const parts = merchant.ownerName.trim().split(/\s+/);
  if (parts.length >= 3) {
    return `ИП ${parts[0]} ${parts[1][0]}. ${parts[2][0]}.`;
  }
  if (parts.length === 2) return `ИП ${parts[0]} ${parts[1][0]}.`;
  return merchant.legalName;
}

const DEFAULT_SETTINGS = [
  {
    provider: "yookassa",
    displayName: "ЮKassa",
    enabled: true,
    feeBps: 280,
    payoutEnabled: true,
    note: "Основной эквайринг: карты, СБП, ЮMoney, чеки 54-ФЗ.",
  },
  {
    provider: "sbp",
    displayName: "СБП (QR)",
    enabled: true,
    feeBps: 50,
    payoutEnabled: true,
    note: "Самый дешёвый приём и моментальные выплаты по телефону.",
  },
  {
    provider: "tbank",
    displayName: "Т-Банк",
    enabled: true,
    feeBps: 230,
    payoutEnabled: true,
    note: "Резервный эквайринг и реестровые выплаты исполнителям.",
  },
  {
    provider: "robokassa",
    displayName: "Robokassa",
    enabled: false,
    feeBps: 270,
    payoutEnabled: false,
    note: "Запасной канал оплаты, подключается редиректом.",
  },
];

let merchantSeed: Promise<void> | null = null;

export async function ensureMerchant(): Promise<void> {
  if (!merchantSeed) {
    merchantSeed = seedMerchant().catch((error) => {
      merchantSeed = null;
      throw error;
    });
  }
  return merchantSeed;
}

async function seedMerchant(): Promise<void> {
  await ensureSchema();

  const existing = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(merchantProfile);
  if ((existing[0]?.count ?? 0) === 0) {
    await db
      .insert(merchantProfile)
      .values(DEFAULT_MERCHANT)
      .onConflictDoNothing();
  }

  const settings = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(paymentSettings);
  if ((settings[0]?.count ?? 0) === 0) {
    await db
      .insert(paymentSettings)
      .values(DEFAULT_SETTINGS)
      .onConflictDoNothing();
  }
}

export async function getMerchant(): Promise<MerchantProfile> {
  await ensureMerchant();
  const [row] = await db.select().from(merchantProfile).limit(1);
  return row;
}

export async function updateMerchant(
  values: Partial<typeof DEFAULT_MERCHANT>,
): Promise<MerchantProfile> {
  const current = await getMerchant();
  const [updated] = await db
    .update(merchantProfile)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(merchantProfile.id, current.id))
    .returning();
  return updated;
}

export async function getPaymentSettings() {
  await ensureMerchant();
  return db.select().from(paymentSettings).orderBy(paymentSettings.id);
}

export async function setProviderEnabled(provider: string, enabled: boolean) {
  const [row] = await db
    .update(paymentSettings)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(paymentSettings.provider, provider))
    .returning();
  return row;
}

export async function getPayments(limit = 50) {
  await ensureMerchant();
  return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit);
}

export async function getPaymentStats() {
  await ensureMerchant();
  const [row] = await db
    .select({
      total: sql<number>`cast(coalesce(sum(case when ${payments.status} = 'succeeded' then ${payments.amountKop} else 0 end), 0) as bigint)`,
      platformFee: sql<number>`cast(coalesce(sum(case when ${payments.status} = 'succeeded' then ${payments.platformFeeKop} else 0 end), 0) as bigint)`,
      acquiringFee: sql<number>`cast(coalesce(sum(case when ${payments.status} = 'succeeded' then ${payments.acquiringFeeKop} else 0 end), 0) as bigint)`,
      succeeded: sql<number>`cast(count(*) filter (where ${payments.status} = 'succeeded') as int)`,
      pending: sql<number>`cast(count(*) filter (where ${payments.status} = 'pending') as int)`,
      all: sql<number>`cast(count(*) as int)`,
    })
    .from(payments);

  return {
    totalKop: Number(row?.total ?? 0),
    platformFeeKop: Number(row?.platformFee ?? 0),
    acquiringFeeKop: Number(row?.acquiringFee ?? 0),
    succeeded: Number(row?.succeeded ?? 0),
    pending: Number(row?.pending ?? 0),
    all: Number(row?.all ?? 0),
  };
}

/** Маскируем длинные реквизиты для публичных страниц */
export function maskAccount(value: string): string {
  if (!value || value.length < 8) return value;
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}
