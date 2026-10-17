export type TierKey = "newbie" | "pro" | "top";

export type Tier = {
  key: TierKey;
  name: string;
  rate: number; // %
  from: number; // ₽ накопленного заработка
  to: number | null;
  emoji: string;
  tagline: string;
  accent: string; // tailwind gradient
  perks: string[];
};

/** Тарифная сетка «Вариант PRO» */
export const TIERS: Tier[] = [
  {
    key: "newbie",
    name: "Новичок",
    rate: 10,
    from: 0,
    to: 50_000,
    emoji: "🚀",
    tagline: "Старт без вложений",
    accent: "from-sky-400 to-cyan-300",
    perks: [
      "Регистрация и отклики — бесплатно",
      "Вывод от 100 ₽ хоть каждый день",
      "Безопасная сделка на каждый заказ",
      "Бейдж «Новичок» — заказчики дают шанс",
    ],
  },
  {
    key: "pro",
    name: "Опытный",
    rate: 7,
    from: 50_000,
    to: 300_000,
    emoji: "💼",
    tagline: "Заработал 50 000 ₽ — платишь меньше",
    accent: "from-emerald-400 to-lime-300",
    perks: [
      "Комиссия падает автоматически",
      "Приоритет в ленте заданий",
      "Моментальный вывод по СБП",
      "Персональный профиль с кейсами",
    ],
  },
  {
    key: "top",
    name: "ТОП",
    rate: 5,
    from: 300_000,
    to: null,
    emoji: "👑",
    tagline: "Лучшая ставка на рынке",
    accent: "from-amber-300 to-orange-400",
    perks: [
      "5% — ниже, чем у любых конкурентов",
      "Личный менеджер и закрывающие документы",
      "Витрина ТОП-исполнителей на главной",
      "Работа с ИП и юрлицами, счета и акты",
    ],
  },
];

export const MIN_WITHDRAWAL = 100;
export const MAX_FAST_WITHDRAWAL = 300;

export function getTier(totalEarned: number): Tier {
  if (totalEarned >= 300_000) return TIERS[2];
  if (totalEarned >= 50_000) return TIERS[1];
  return TIERS[0];
}

export function getRate(totalEarned: number): number {
  return getTier(totalEarned).rate;
}

export function nextTier(totalEarned: number): Tier | null {
  const current = getTier(totalEarned);
  const index = TIERS.findIndex((t) => t.key === current.key);
  return index < TIERS.length - 1 ? TIERS[index + 1] : null;
}

export function commissionFor(amount: number, totalEarned = 0) {
  const tier = getTier(totalEarned);
  const commission = Math.round((amount * tier.rate) / 100);
  return {
    tier,
    rate: tier.rate,
    commission,
    net: amount - commission,
  };
}

const rubFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

export function formatRub(value: number): string {
  return `${rubFormatter.format(Math.round(value))} ₽`;
}

export function formatNumber(value: number): string {
  return rubFormatter.format(Math.round(value));
}

/** Сколько бы взяли конкуренты (подписка + комиссия) — для блока сравнения */
export const COMPETITORS = [
  { name: "FL.ru", sub: "от 2 400 ₽/мес", fee: "+ до 20% за PRO-аккаунт" },
  { name: "Kwork", sub: "0 ₽/мес", fee: "20% с каждого заказа" },
  { name: "Профи.ру", sub: "0 ₽/мес", fee: "платные отклики 150–900 ₽" },
  { name: "Быстро Деньги", sub: "0 ₽/мес", fee: "10% → 7% → 5%" },
];
