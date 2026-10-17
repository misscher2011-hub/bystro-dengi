import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Исполнители (фрилансеры) платформы «Быстро Деньги» */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  city: varchar("city", { length: 120 }).default("Москва").notNull(),
  specialization: varchar("specialization", { length: 160 })
    .default("Универсал")
    .notNull(),
  avatarEmoji: varchar("avatar_emoji", { length: 8 }).default("🙂").notNull(),
  /** Накопленный заработок (брутто, ₽) — определяет ступень комиссии */
  totalEarned: integer("total_earned").default(0).notNull(),
  /** Текущий баланс, доступный к выводу (₽) */
  balance: integer("balance").default(0).notNull(),
  rating: integer("rating").default(50).notNull(), // 0..50 => 5.0
  isIp: boolean("is_ip").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Задания от заказчиков. Размещение — всегда 0 ₽ */
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  budget: integer("budget").notNull(),
  deadlineDays: integer("deadline_days").default(3).notNull(),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }).default("Удалённо").notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  responses: integer("responses").default(0).notNull(),
  status: varchar("status", { length: 32 }).default("open").notNull(), // open | in_progress | done
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Сделки исполнителя — основа раздела «Мои заработки» */
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  client: varchar("client", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).default("Разное").notNull(),
  /** Сумма заказа брутто, ₽ */
  amount: integer("amount").notNull(),
  /** Ставка комиссии на момент сделки, % */
  commissionRate: integer("commission_rate").notNull(),
  /** Комиссия сервиса, ₽ */
  commissionAmount: integer("commission_amount").notNull(),
  /** К выплате исполнителю, ₽ */
  netAmount: integer("net_amount").notNull(),
  status: varchar("status", { length: 32 }).default("paid").notNull(), // paid | in_progress
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Выводы средств. Минимальная сумма — 100 ₽ */
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 60 }).notNull(), // card | sbp | qiwi | ip_account
  destination: varchar("destination", { length: 120 }).default("").notNull(),
  status: varchar("status", { length: 32 }).default("done").notNull(), // done | processing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Заявки и профили ИП / самозанятых */
export const ipProfiles = pgTable("ip_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  inn: varchar("inn", { length: 16 }).notNull(),
  ogrnip: varchar("ogrnip", { length: 20 }).default("").notNull(),
  taxSystem: varchar("tax_system", { length: 60 }).default("УСН 6%").notNull(),
  bankAccount: varchar("bank_account", { length: 40 }).default("").notNull(),
  phone: varchar("phone", { length: 40 }).default("").notNull(),
  needsVat: boolean("needs_vat").default(false).notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(), // pending | verified | rejected
  comment: text("comment").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Реквизиты ИП — владельца площадки (единственная строка) */
export const merchantProfile = pgTable("merchant_profile", {
  id: serial("id").primaryKey(),
  brandName: varchar("brand_name", { length: 120 }).default("Быстро Деньги").notNull(),
  legalName: varchar("legal_name", { length: 200 }).notNull(),
  ownerName: varchar("owner_name", { length: 160 }).notNull(),
  inn: varchar("inn", { length: 16 }).notNull(),
  ogrnip: varchar("ogrnip", { length: 20 }).default("").notNull(),
  okved: varchar("okved", { length: 40 }).default("62.01").notNull(),
  taxSystem: varchar("tax_system", { length: 60 }).default("УСН «Доходы» 6%").notNull(),
  registeredAt: varchar("registered_at", { length: 40 }).default("").notNull(),
  legalAddress: varchar("legal_address", { length: 300 }).default("").notNull(),
  bankName: varchar("bank_name", { length: 160 }).default("").notNull(),
  bankInn: varchar("bank_inn", { length: 16 }).default("").notNull(),
  bankAddress: varchar("bank_address", { length: 300 }).default("").notNull(),
  bik: varchar("bik", { length: 12 }).default("").notNull(),
  corrAccount: varchar("corr_account", { length: 24 }).default("").notNull(),
  settlementAccount: varchar("settlement_account", { length: 24 }).default("").notNull(),
  email: varchar("email", { length: 160 }).default("").notNull(),
  phone: varchar("phone", { length: 40 }).default("").notNull(),
  website: varchar("website", { length: 160 }).default("").notNull(),
  supportHours: varchar("support_hours", { length: 120 })
    .default("Пн–Вс, 09:00–21:00 МСК")
    .notNull(),
  offerUrl: varchar("offer_url", { length: 200 }).default("/legal").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Настройки подключённых платёжных систем */
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 40 }).notNull().unique(),
  displayName: varchar("display_name", { length: 80 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  /** Комиссия эквайринга в сотых долях процента (базисных пунктах) */
  feeBps: integer("fee_bps").default(290).notNull(),
  payoutEnabled: boolean("payout_enabled").default(false).notNull(),
  note: text("note").default("").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Платежи через эквайринг */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 120 }).default("").notNull(),
  provider: varchar("provider", { length: 40 }).notNull(),
  mode: varchar("mode", { length: 16 }).default("demo").notNull(), // live | demo
  purpose: varchar("purpose", { length: 40 }).default("escrow").notNull(), // escrow | topup | commission
  /** Сумма в копейках */
  amountKop: integer("amount_kop").notNull(),
  /** Комиссия платформы в копейках */
  platformFeeKop: integer("platform_fee_kop").default(0).notNull(),
  /** Комиссия эквайринга в копейках */
  acquiringFeeKop: integer("acquiring_fee_kop").default(0).notNull(),
  description: varchar("description", { length: 250 }).default("").notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(), // pending | succeeded | canceled
  method: varchar("method", { length: 40 }).default("bank_card").notNull(),
  customerEmail: varchar("customer_email", { length: 160 }).default("").notNull(),
  confirmationUrl: text("confirmation_url").default("").notNull(),
  idempotenceKey: varchar("idempotence_key", { length: 80 }).default("").notNull(),
  taskId: integer("task_id"),
  userId: integer("user_id"),
  errorText: varchar("error_text", { length: 250 }).default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export type User = typeof users.$inferSelect;
export type MerchantProfile = typeof merchantProfile.$inferSelect;
export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type IpProfile = typeof ipProfiles.$inferSelect;
