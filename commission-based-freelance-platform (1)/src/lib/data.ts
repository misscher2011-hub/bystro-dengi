import { db } from "@/db";
import { ensureSchema } from "@/db/bootstrap";
import { deals, ipProfiles, tasks, users, withdrawals } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { commissionFor, getTier } from "./commission";

export const DEMO_SLUG = "demo";

type SeedDeal = {
  title: string;
  client: string;
  category: string;
  amount: number;
  daysAgo: number;
  status?: string;
};

const SEED_DEALS: SeedDeal[] = [
  { title: "Лендинг для автосервиса", client: "ООО «Турбо»", category: "Сайты", amount: 18000, daysAgo: 168 },
  { title: "Настройка Яндекс.Директ", client: "Мария К.", category: "Реклама", amount: 9000, daysAgo: 150 },
  { title: "Тексты для интернет-магазина (30 карточек)", client: "Shop&Go", category: "Тексты", amount: 7500, daysAgo: 132 },
  { title: "Telegram-бот для записи клиентов", client: "Студия «Нить»", category: "Разработка", amount: 21000, daysAgo: 118 },
  { title: "Дизайн мобильного приложения", client: "FinHub", category: "Дизайн", amount: 28000, daysAgo: 96 },
  { title: "SEO-аудит и семантика", client: "ИП Соколов", category: "SEO", amount: 11000, daysAgo: 84 },
  { title: "Монтаж 12 Reels", client: "Beauty Lab", category: "Видео", amount: 9500, daysAgo: 70 },
  { title: "Интеграция CRM amoCRM + сайт", client: "ООО «Стройдом»", category: "Разработка", amount: 34000, daysAgo: 56 },
  { title: "Брендбук и логотип", client: "Coffee Point", category: "Дизайн", amount: 26000, daysAgo: 41 },
  { title: "Поддержка сайта, месяц", client: "ООО «Турбо»", category: "Сайты", amount: 12000, daysAgo: 30 },
  { title: "Чат-бот поддержки на GPT", client: "EduPro", category: "Разработка", amount: 38000, daysAgo: 21 },
  { title: "Email-рассылка + вёрстка писем", client: "Vitamin Shop", category: "Маркетинг", amount: 14000, daysAgo: 12 },
  { title: "Переделка корзины интернет-магазина", client: "Shop&Go", category: "Разработка", amount: 22000, daysAgo: 5 },
  { title: "Редизайн личного кабинета", client: "FinHub", category: "Дизайн", amount: 26000, daysAgo: 2, status: "in_progress" },
];

const SEED_TASKS = [
  {
    title: "Сделать лендинг для доставки пиццы",
    description:
      "Нужен одностраничный сайт с меню, корзиной и оплатой. Дизайн есть в Figma, нужна только вёрстка и подключение эквайринга.",
    category: "Сайты",
    budget: 35000,
    deadlineDays: 7,
    customerName: "Иван П.",
    city: "Удалённо",
    isUrgent: false,
    responses: 12,
  },
  {
    title: "Написать 20 статей для блога клиники",
    description: "Медицинская тематика, по 4000 знаков, SEO-структура, уникальность от 95%.",
    category: "Тексты",
    budget: 24000,
    deadlineDays: 14,
    customerName: "Клиника «Здоровье»",
    city: "Удалённо",
    isUrgent: false,
    responses: 31,
  },
  {
    title: "Срочно: починить оплату на сайте (Tilda + ЮKassa)",
    description: "Платежи не доходят, нужен специалист сегодня. Доступы дам сразу.",
    category: "Разработка",
    budget: 8000,
    deadlineDays: 1,
    customerName: "ИП Галимов",
    city: "Удалённо",
    isUrgent: true,
    responses: 7,
  },
  {
    title: "Смонтировать 10 вертикальных видео для Reels",
    description: "Исходники есть, нужны динамичный монтаж, субтитры, музыка.",
    category: "Видео",
    budget: 18000,
    deadlineDays: 5,
    customerName: "Beauty Lab",
    city: "Удалённо",
    isUrgent: false,
    responses: 19,
  },
  {
    title: "Настроить рекламу в Яндекс.Директ для мебельного цеха",
    description: "Бюджет 120 000 ₽/мес. Нужны поиск + РСЯ, ретаргетинг и отчётность.",
    category: "Реклама",
    budget: 45000,
    deadlineDays: 10,
    customerName: "ООО «ДревПром»",
    city: "Казань",
    isUrgent: false,
    responses: 9,
  },
  {
    title: "Разработать Telegram-бота для записи в барбершоп",
    description: "Запись, напоминания, оплата, админка. Желательно Python + aiogram.",
    category: "Разработка",
    budget: 60000,
    deadlineDays: 21,
    customerName: "Barber Club",
    city: "Удалённо",
    isUrgent: false,
    responses: 14,
  },
  {
    title: "Логотип и фирменный стиль для кофейни",
    description: "3 концепции, брендбук на 10 страниц, макеты стаканов и вывески.",
    category: "Дизайн",
    budget: 40000,
    deadlineDays: 12,
    customerName: "Coffee Point",
    city: "Санкт-Петербург",
    isUrgent: false,
    responses: 27,
  },
  {
    title: "Собрать дашборд продаж в Power BI",
    description: "Источник — выгрузки 1С и Excel. Нужны 4 вкладки и автообновление.",
    category: "Аналитика",
    budget: 52000,
    deadlineDays: 15,
    customerName: "ООО «Снабсервис»",
    city: "Удалённо",
    isUrgent: false,
    responses: 5,
  },
  {
    title: "Перевести техническую документацию EN → RU",
    description: "80 страниц, инженерная тематика, вёрстка 1:1 в Word.",
    category: "Тексты",
    budget: 29000,
    deadlineDays: 20,
    customerName: "TechnoLine",
    city: "Удалённо",
    isUrgent: false,
    responses: 11,
  },
  {
    title: "Сделать мобильное приложение-каталог (Flutter)",
    description: "Каталог, корзина, push-уведомления, интеграция с API магазина.",
    category: "Разработка",
    budget: 180000,
    deadlineDays: 45,
    customerName: "Shop&Go",
    city: "Удалённо",
    isUrgent: false,
    responses: 8,
  },
];

const SEED_TOP_USERS = [
  {
    slug: "polina-d",
    name: "Полина Д.",
    email: "polina@bystro.dengi",
    city: "Санкт-Петербург",
    specialization: "UX/UI дизайн",
    avatarEmoji: "🎨",
    totalEarned: 612000,
    balance: 18400,
    rating: 49,
    isIp: true,
  },
  {
    slug: "rustam-k",
    name: "Рустам К.",
    email: "rustam@bystro.dengi",
    city: "Казань",
    specialization: "Backend / интеграции",
    avatarEmoji: "⚙️",
    totalEarned: 418000,
    balance: 7300,
    rating: 50,
    isIp: true,
  },
  {
    slug: "nika-v",
    name: "Ника В.",
    email: "nika@bystro.dengi",
    city: "Новосибирск",
    specialization: "Копирайтинг и SEO",
    avatarEmoji: "✍️",
    totalEarned: 184000,
    balance: 2150,
    rating: 48,
    isIp: false,
  },
  {
    slug: "artem-s",
    name: "Артём С.",
    email: "artem@bystro.dengi",
    city: "Удалённо",
    specialization: "Видеомонтаж",
    avatarEmoji: "🎬",
    totalEarned: 46500,
    balance: 900,
    rating: 47,
    isIp: false,
  },
];

function daysAgoDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

let seedPromise: Promise<void> | null = null;

export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function seed(): Promise<void> {
  // Сначала гарантируем, что таблицы вообще существуют (чистая база Neon)
  await ensureSchema();

  const existing = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(users);
  if ((existing[0]?.count ?? 0) > 0) return;

  // onConflictDoNothing — защита от гонки при параллельном старте
  // нескольких serverless-инстансов на Vercel
  const inserted = await db
    .insert(users)
    .values({
      slug: DEMO_SLUG,
      name: "Алексей Морозов",
      email: "alex@bystro.dengi",
      city: "Москва",
      specialization: "Веб-разработка и автоматизация",
      avatarEmoji: "🧑‍💻",
      totalEarned: 0,
      balance: 0,
      rating: 49,
      isIp: true,
    })
    .onConflictDoNothing()
    .returning();

  const demo = inserted[0];
  if (!demo) return; // кто-то успел раньше — данные уже есть

  await db.insert(users).values(SEED_TOP_USERS).onConflictDoNothing();
  await db.insert(tasks).values(
    SEED_TASKS.map((t, index) => ({
      ...t,
      createdAt: daysAgoDate(index * 0.6 + 0.2),
    })),
  );

  let running = 0;
  const dealRows = SEED_DEALS.map((d) => {
    const { rate, commission, net } = commissionFor(d.amount, running);
    if ((d.status ?? "paid") === "paid") running += d.amount;
    return {
      userId: demo.id,
      title: d.title,
      client: d.client,
      category: d.category,
      amount: d.amount,
      commissionRate: rate,
      commissionAmount: commission,
      netAmount: net,
      status: d.status ?? "paid",
      createdAt: daysAgoDate(d.daysAgo),
    };
  });
  await db.insert(deals).values(dealRows);

  const paidNet = dealRows
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.netAmount, 0);

  const withdrawalRows = [
    { amount: 24000, method: "card", destination: "**** 4417", daysAgo: 140 },
    { amount: 41000, method: "sbp", destination: "+7 ··· 42-18", daysAgo: 92 },
    { amount: 68000, method: "ip_account", destination: "р/с ···8821", daysAgo: 48 },
    { amount: 52000, method: "sbp", destination: "+7 ··· 42-18", daysAgo: 19 },
    { amount: 300, method: "sbp", destination: "+7 ··· 42-18", daysAgo: 3 },
  ];
  await db.insert(withdrawals).values(
    withdrawalRows.map((w) => ({
      userId: demo.id,
      amount: w.amount,
      method: w.method,
      destination: w.destination,
      status: "done",
      createdAt: daysAgoDate(w.daysAgo),
    })),
  );

  const withdrawn = withdrawalRows.reduce((sum, w) => sum + w.amount, 0);

  await db
    .update(users)
    .set({
      totalEarned: running,
      balance: Math.max(paidNet - withdrawn, 0),
    })
    .where(eq(users.id, demo.id));

  await db.insert(ipProfiles).values([
    {
      userId: demo.id,
      companyName: "ИП Морозов Алексей Сергеевич",
      fullName: "Морозов Алексей Сергеевич",
      inn: "771234567890",
      ogrnip: "321774600123456",
      taxSystem: "УСН 6%",
      bankAccount: "40802810500000018821",
      phone: "+7 999 123-42-18",
      needsVat: false,
      status: "verified",
      comment: "Проверено автоматически через ЕГРИП за 4 минуты.",
      createdAt: daysAgoDate(170),
    },
    {
      companyName: "ИП Данилова Полина Игоревна",
      fullName: "Данилова Полина Игоревна",
      inn: "780512345678",
      ogrnip: "320784700098765",
      taxSystem: "НПД (самозанятость)",
      bankAccount: "40802810700000004417",
      phone: "+7 921 440-12-09",
      needsVat: false,
      status: "verified",
      comment: "Работает с юрлицами, выставляет счета.",
      createdAt: daysAgoDate(120),
    },
    {
      companyName: "ИП Каримов Рустам Ильдарович",
      fullName: "Каримов Рустам Ильдарович",
      inn: "165901234567",
      ogrnip: "319169000054321",
      taxSystem: "УСН 15%",
      bankAccount: "",
      phone: "+7 843 221-08-77",
      needsVat: true,
      status: "pending",
      comment: "Ожидает загрузки выписки из ЕГРИП.",
      createdAt: daysAgoDate(4),
    },
  ]);
}

export async function getDemoUser() {
  await ensureSeed();
  const [user] = await db.select().from(users).where(eq(users.slug, DEMO_SLUG));
  return user;
}

export async function getTopUsers() {
  await ensureSeed();
  return db.select().from(users).orderBy(desc(users.totalEarned)).limit(4);
}

export async function getTasks(category?: string) {
  await ensureSeed();
  const query = db.select().from(tasks);
  if (category && category !== "Все") {
    return query
      .where(and(eq(tasks.category, category), eq(tasks.status, "open")))
      .orderBy(desc(tasks.createdAt))
      .limit(60);
  }
  return query.orderBy(desc(tasks.createdAt)).limit(60);
}

export async function getDeals(userId: number) {
  await ensureSeed();
  return db
    .select()
    .from(deals)
    .where(eq(deals.userId, userId))
    .orderBy(desc(deals.createdAt));
}

export async function getWithdrawals(userId: number) {
  await ensureSeed();
  return db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt));
}

export async function getIpProfiles() {
  await ensureSeed();
  return db.select().from(ipProfiles).orderBy(desc(ipProfiles.createdAt));
}

export type MonthPoint = { label: string; gross: number; net: number; fee: number };

export function buildMonthlySeries(
  rows: { amount: number; netAmount: number; commissionAmount: number; createdAt: Date; status: string }[],
  months = 6,
): MonthPoint[] {
  const now = new Date();
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("ru-RU", { month: "short" });
    const gross = rows
      .filter(
        (r) =>
          r.status === "paid" &&
          r.createdAt.getFullYear() === d.getFullYear() &&
          r.createdAt.getMonth() === d.getMonth(),
      )
      .reduce((sum, r) => sum + r.amount, 0);
    const net = rows
      .filter(
        (r) =>
          r.status === "paid" &&
          r.createdAt.getFullYear() === d.getFullYear() &&
          r.createdAt.getMonth() === d.getMonth(),
      )
      .reduce((sum, r) => sum + r.netAmount, 0);
    points.push({ label, gross, net, fee: gross - net });
  }
  return points;
}

export async function recalcUser(userId: number) {
  const rows = await db
    .select({
      gross: sql<number>`cast(coalesce(sum(case when ${deals.status} = 'paid' then ${deals.amount} else 0 end), 0) as int)`,
      net: sql<number>`cast(coalesce(sum(case when ${deals.status} = 'paid' then ${deals.netAmount} else 0 end), 0) as int)`,
    })
    .from(deals)
    .where(eq(deals.userId, userId));

  const [paidOut] = await db
    .select({
      total: sql<number>`cast(coalesce(sum(${withdrawals.amount}), 0) as int)`,
    })
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId));

  const gross = rows[0]?.gross ?? 0;
  const net = rows[0]?.net ?? 0;
  const balance = Math.max(net - (paidOut?.total ?? 0), 0);

  await db
    .update(users)
    .set({ totalEarned: gross, balance })
    .where(eq(users.id, userId));

  return { gross, balance, tier: getTier(gross) };
}
