"use client";

import { useMemo, useState } from "react";
import { TIERS, formatRub, getTier, nextTier } from "@/lib/commission";

const PRESETS = [5000, 15000, 50000, 120000];

export default function CommissionCalculator() {
  const [amount, setAmount] = useState(45000);
  const [earned, setEarned] = useState(0);
  const [ordersPerMonth, setOrdersPerMonth] = useState(3);

  const tier = useMemo(() => getTier(earned), [earned]);
  const next = useMemo(() => nextTier(earned), [earned]);

  const commission = Math.round((amount * tier.rate) / 100);
  const net = amount - commission;

  const monthGross = amount * ordersPerMonth;
  const monthFee = Math.round((monthGross * tier.rate) / 100);
  const monthNet = monthGross - monthFee;

  // Конкуренты: Kwork 20%, FL.ru PRO-подписка 2400 ₽/мес + 10% сервисный сбор
  const kworkNet = monthGross - Math.round(monthGross * 0.2);
  const flNet = monthGross - Math.round(monthGross * 0.1) - 2400;
  const saveVsKwork = monthNet - kworkNet;
  const saveVsFl = monthNet - flNet;

  const toNext = next ? Math.max(next.from - earned, 0) : 0;
  const progress = next
    ? Math.min(100, Math.round(((earned - tier.from) / (next.from - tier.from)) * 100))
    : 100;

  return (
    <section id="calculator" className="mx-auto max-w-6xl px-4 py-16">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-1">
        <div className="rounded-[28px] bg-[#070d16]/80 p-6 sm:p-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                Калькулятор комиссии
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Посчитай, сколько придёт <span className="bd-text-gradient">на руки</span>
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
              Текущая ставка:{" "}
              <span className="font-black text-lime-300">{tier.rate}%</span>{" "}
              <span className="text-slate-500">·</span> {tier.emoji} {tier.name}
            </div>
          </div>

          <div className="mt-9 grid gap-9 lg:grid-cols-[1.05fr_0.95fr]">
            {/* --- Controls --- */}
            <div className="space-y-8">
              <div>
                <div className="flex items-end justify-between">
                  <label className="text-sm font-semibold text-slate-300">
                    Сумма заказа
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5">
                    <input
                      type="number"
                      min={500}
                      max={1000000}
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          Math.max(0, Math.min(1_000_000, Number(e.target.value) || 0)),
                        )
                      }
                      className="w-28 bg-transparent text-right text-lg font-bold text-white outline-none"
                    />
                    <span className="text-slate-400">₽</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={500}
                  max={300000}
                  step={500}
                  value={Math.min(amount, 300000)}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-4 w-full bg-white/10"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        amount === p
                          ? "border-lime-300/60 bg-lime-300/15 text-lime-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {p.toLocaleString("ru-RU")} ₽
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Сколько уже заработано на площадке
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {TIERS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setEarned(t.from === 0 ? 0 : t.from)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        tier.key === t.key
                          ? "border-lime-300/60 bg-lime-300/10"
                          : "border-white/10 bg-white/5 hover:border-white/25"
                      }`}
                    >
                      <div className="text-lg">{t.emoji}</div>
                      <div className="mt-1 text-xs font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.rate}% комиссия</div>
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={5000}
                  value={Math.min(earned, 500000)}
                  onChange={(e) => setEarned(Number(e.target.value))}
                  className="mt-5 w-full bg-white/10"
                />
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>0 ₽</span>
                  <span>50 000 ₽ → 7%</span>
                  <span>300 000 ₽ → 5%</span>
                </div>
                {next ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>
                        До ставки <b className="text-white">{next.rate}%</b> осталось
                        заработать
                      </span>
                      <span className="font-bold text-lime-300">{formatRub(toNext)}</span>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-xs text-amber-200">
                    👑 Максимальная ступень. Вы платите всего 5% — лучшая ставка
                    на рынке.
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">
                    Заказов в месяц
                  </label>
                  <span className="text-sm font-bold text-white">{ordersPerMonth}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={ordersPerMonth}
                  onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                  className="mt-3 w-full bg-white/10"
                />
              </div>
            </div>

            {/* --- Result --- */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-lime-300/25 bg-gradient-to-br from-lime-300/15 via-emerald-400/5 to-transparent p-6 bd-glow">
                <div className="text-xs font-semibold uppercase tracking-widest text-lime-200/80">
                  Вы получаете на руки
                </div>
                <div className="mt-2 text-5xl font-black tracking-tight text-white sm:text-6xl">
                  {formatRub(net)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-black/40 p-3">
                    <div className="text-slate-400">Сумма заказа</div>
                    <div className="mt-1 text-lg font-bold text-white">
                      {formatRub(amount)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-3">
                    <div className="text-slate-400">
                      Комиссия сервиса {tier.rate}%
                    </div>
                    <div className="mt-1 text-lg font-bold text-rose-300">
                      −{formatRub(commission)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-black/30 px-3 py-2.5 text-xs text-slate-300">
                  <span className="text-base">🏦</span> Вывести можно уже от{" "}
                  <b className="text-lime-300">100 ₽</b> — комиссия за вывод 0 ₽
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-white">
                    Доход за месяц
                  </span>
                  <span className="text-2xl font-black text-white">
                    {formatRub(monthNet)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {ordersPerMonth} заказ(а/ов) по {formatRub(amount)} · комиссия{" "}
                  {formatRub(monthFee)}
                </div>

                <div className="mt-5 space-y-3">
                  <CompareRow
                    label="Быстро Деньги"
                    value={monthNet}
                    max={monthGross}
                    note={`${tier.rate}% · подписка 0 ₽`}
                    highlight
                  />
                  <CompareRow
                    label="Kwork"
                    value={kworkNet}
                    max={monthGross}
                    note="20% с каждого заказа"
                  />
                  <CompareRow
                    label="FL.ru PRO"
                    value={flNet}
                    max={monthGross}
                    note="подписка 2 400 ₽/мес + сбор"
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-400/15 to-transparent px-4 py-3 text-sm text-emerald-200">
                  Экономия в месяц: <b>{formatRub(Math.max(saveVsKwork, 0))}</b> против
                  Kwork и <b>{formatRub(Math.max(saveVsFl, 0))}</b> против FL.ru PRO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareRow({
  label,
  value,
  max,
  note,
  highlight,
}: {
  label: string;
  value: number;
  max: number;
  note: string;
  highlight?: boolean;
}) {
  const width = max > 0 ? Math.max(4, Math.round((Math.max(value, 0) / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className={highlight ? "font-bold text-lime-300" : "text-slate-300"}>
          {label}
        </span>
        <span className={highlight ? "font-bold text-white" : "text-slate-400"}>
          {Math.max(value, 0).toLocaleString("ru-RU")} ₽
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all ${
            highlight
              ? "bg-gradient-to-r from-lime-300 to-emerald-400"
              : "bg-slate-500/60"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{note}</div>
    </div>
  );
}
