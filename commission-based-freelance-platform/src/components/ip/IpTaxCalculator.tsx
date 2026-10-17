"use client";

import { useState } from "react";
import { formatRub, getTier } from "@/lib/commission";

const STATUSES = [
  {
    key: "person",
    label: "Физлицо",
    emoji: "🙋",
    taxRate: 13,
    taxName: "НДФЛ 13%",
    note: "Платформа удерживает налог и подаёт данные в ФНС",
  },
  {
    key: "self",
    label: "Самозанятый",
    emoji: "🧾",
    taxRate: 6,
    taxName: "НПД 6% (с юрлиц)",
    note: "Чек формируется автоматически в «Мой налог»",
  },
  {
    key: "ip",
    label: "ИП на УСН",
    emoji: "🏢",
    taxRate: 6,
    taxName: "УСН 6% доходы",
    note: "Выплата на расчётный счёт, акт и счёт — автоматически",
  },
] as const;

export default function IpTaxCalculator() {
  const [amount, setAmount] = useState(150000);
  const [earned, setEarned] = useState(300000);
  const [status, setStatus] = useState<(typeof STATUSES)[number]["key"]>("ip");

  const tier = getTier(earned);
  const current = STATUSES.find((s) => s.key === status)!;

  const fee = Math.round((amount * tier.rate) / 100);
  const afterFee = amount - fee;
  const tax = Math.round((afterFee * current.taxRate) / 100);
  const net = afterFee - tax;

  return (
    <div className="rounded-[32px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 via-emerald-400/5 to-transparent p-1">
      <div className="rounded-[28px] bg-[#070d16]/85 p-6 sm:p-9">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Калькулятор: комиссия + налог
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Считаем честно: сначала комиссия площадки по вашей ступени, затем налог
          по выбранному статусу.
        </p>

        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-300">
                  Сумма контракта
                </label>
                <span className="text-lg font-black text-white">
                  {formatRub(amount)}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-3 w-full bg-white/10"
              />
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="text-sm font-semibold text-slate-300">
                  Заработано на площадке
                </label>
                <span className="text-sm font-bold text-lime-300">
                  ставка {tier.rate}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={600000}
                step={10000}
                value={earned}
                onChange={(e) => setEarned(Number(e.target.value))}
                className="mt-3 w-full bg-white/10"
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>0 ₽ · 10%</span>
                <span>50 000 ₽ · 7%</span>
                <span>300 000 ₽ · 5%</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-300">
                Ваш налоговый статус
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key)}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      status === s.key
                        ? "border-cyan-300/60 bg-cyan-300/10"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    <div className="text-lg">{s.emoji}</div>
                    <div className="mt-1 text-xs font-bold text-white">{s.label}</div>
                    <div className="text-[11px] text-slate-400">{s.taxRate}%</div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">{current.note}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
              <Line label="Сумма контракта" value={formatRub(amount)} />
              <Line
                label={`Комиссия площадки ${tier.rate}%`}
                value={`−${formatRub(fee)}`}
                tone="bad"
              />
              <Line
                label={current.taxName}
                value={`−${formatRub(tax)}`}
                tone="bad"
              />
              <div className="my-3 h-px bg-white/10" />
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-white">
                  Чистыми в кармане
                </span>
                <span className="text-3xl font-black text-lime-300">
                  {formatRub(net)}
                </span>
              </div>
              <div className="mt-2 text-right text-xs text-slate-500">
                {((net / amount) * 100).toFixed(1)}% от суммы контракта
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-xs text-slate-300">
              <b className="text-white">Почему ИП выгоднее:</b> физлицо отдаёт
              13% НДФЛ, а ИП на УСН — 6%. При контракте{" "}
              {formatRub(amount)} разница составляет{" "}
              <b className="text-lime-300">
                {formatRub(Math.round((afterFee * 7) / 100))}
              </b>{" "}
              в вашу пользу.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bad";
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={tone === "bad" ? "font-bold text-rose-300" : "font-bold text-white"}>
        {value}
      </span>
    </div>
  );
}
