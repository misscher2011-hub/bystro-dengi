"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Payment, PaymentSetting } from "@/db/schema";
import type { ProviderStatus } from "@/lib/payments/types";
import { formatRub } from "@/lib/commission";

type Props = {
  providers: ProviderStatus[];
  settings: PaymentSetting[];
  payments: Payment[];
  stats: {
    totalKop: number;
    platformFeeKop: number;
    acquiringFeeKop: number;
    succeeded: number;
    pending: number;
    all: number;
  };
  baseUrl: string;
};

const STATUS: Record<string, { text: string; cls: string }> = {
  succeeded: { text: "Оплачен", cls: "bg-emerald-400/15 text-emerald-300" },
  pending: { text: "Ожидает", cls: "bg-amber-400/15 text-amber-300" },
  canceled: { text: "Отклонён", cls: "bg-rose-400/15 text-rose-300" },
};

export default function PaymentsPanel({
  providers,
  settings,
  payments,
  stats,
  baseUrl,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const settingMap = new Map(settings.map((s) => [s.provider, s]));
  const liveCount = providers.filter((p) => p.configured).length;

  async function toggle(provider: string, enabled: boolean) {
    setBusy(provider);
    try {
      await fetch("/api/merchant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, enabled }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Сводка */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Оборот через эквайринг"
          value={formatRub(stats.totalKop / 100)}
          hint={`${stats.succeeded} успешных платежей`}
          accent="from-lime-300/20"
        />
        <Kpi
          label="Комиссия площадки"
          value={formatRub(stats.platformFeeKop / 100)}
          hint="Ваш доход с безопасных сделок"
          accent="from-emerald-400/20"
        />
        <Kpi
          label="Комиссия эквайринга"
          value={formatRub(stats.acquiringFeeKop / 100)}
          hint="Удерживает платёжная система"
          accent="from-rose-400/15"
        />
        <Kpi
          label="Подключено систем"
          value={`${liveCount} / ${providers.length}`}
          hint={liveCount ? "Боевой режим активен" : "Все работают в демо-режиме"}
          accent="from-cyan-400/20"
        />
      </div>

      {/* Провайдеры */}
      <div className="grid gap-5 lg:grid-cols-2">
        {providers.map((p) => {
          const setting = settingMap.get(p.key);
          const on = setting?.enabled ?? true;
          return (
            <div
              key={p.key}
              className={`rounded-3xl border p-6 transition ${
                p.configured
                  ? "border-emerald-400/30 bg-emerald-400/[0.06]"
                  : "border-white/10 bg-white/[0.035]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black/40 text-2xl">
                    {p.logo}
                  </span>
                  <div>
                    <div className="text-base font-bold text-white">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      Эквайринг {p.feeLabel}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      p.configured
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-amber-400/15 text-amber-300"
                    }`}
                  >
                    {p.configured ? "LIVE" : "ДЕМО"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(p.key, !on)}
                    disabled={busy === p.key}
                    className={`h-6 w-11 rounded-full p-0.5 transition ${
                      on ? "bg-lime-400" : "bg-slate-600"
                    } disabled:opacity-50`}
                    aria-label="Включить / выключить"
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition ${
                        on ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                {p.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.methods.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] text-slate-300"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ключи в .env
                </div>
                <div className="mt-2 space-y-1.5">
                  {p.envKeys.map((key) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <code className="font-mono text-xs text-slate-300">{key}</code>
                      <span
                        className={`text-[10px] font-bold ${
                          p.configured ? "text-emerald-300" : "text-amber-300"
                        }`}
                      >
                        {p.configured ? "задан" : "не задан"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-white/8 pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Webhook URL
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copy(
                        `${baseUrl}/api/payments/webhook/${p.key === "sbp" ? "yookassa" : p.key}`,
                        p.key,
                      )
                    }
                    className="mt-1.5 w-full truncate rounded-lg bg-white/5 px-3 py-2 text-left font-mono text-[11px] text-cyan-200 hover:bg-white/10"
                  >
                    {copied === p.key
                      ? "✓ скопировано"
                      : `${baseUrl}/api/payments/webhook/${p.key === "sbp" ? "yookassa" : p.key}`}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">{p.payoutSupport}</span>
                <a
                  href={p.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-lime-300 hover:underline"
                >
                  Документация →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Инструкция */}
      <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/8 to-transparent p-7">
        <h3 className="text-lg font-bold text-white">
          Как включить боевой приём денег за 3 шага
        </h3>
        <ol className="mt-5 space-y-4 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/20 text-xs font-black text-cyan-200">
              1
            </span>
            <span>
              Зарегистрируйте магазин в ЮKassa на своё ИП (нужны ИНН, ОГРНИП и
              расчётный счёт — они уже заполнены в разделе «Реквизиты ИП») и
              получите <code className="font-mono text-cyan-200">shopId</code> и{" "}
              <code className="font-mono text-cyan-200">секретный ключ</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/20 text-xs font-black text-cyan-200">
              2
            </span>
            <span>
              Добавьте переменные окружения{" "}
              <code className="font-mono text-cyan-200">YOOKASSA_SHOP_ID</code> и{" "}
              <code className="font-mono text-cyan-200">YOOKASSA_SECRET_KEY</code>{" "}
              (для Т-Банка —{" "}
              <code className="font-mono text-cyan-200">TBANK_TERMINAL_KEY</code>,{" "}
              <code className="font-mono text-cyan-200">TBANK_PASSWORD</code>).
              Карточка провайдера сразу переключится в LIVE.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/20 text-xs font-black text-cyan-200">
              3
            </span>
            <span>
              Пропишите Webhook URL из карточки провайдера в личном кабинете
              платёжной системы — статусы платежей начнут обновляться
              автоматически.
            </span>
          </li>
        </ol>
        <Link
          href="/pay"
          className="mt-6 inline-block rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-400 px-6 py-3 font-extrabold text-[#04150f]"
        >
          Провести тестовый платёж →
        </Link>
      </div>

      {/* Транзакции */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">
            Транзакции ({payments.length})
          </h3>
          <span className="text-xs text-slate-500">
            {stats.pending} в обработке · {stats.succeeded} оплачено
          </span>
        </div>

        <div className="bd-scroll mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3 pr-4">№</th>
                <th className="pb-3 pr-4">Дата</th>
                <th className="pb-3 pr-4">Назначение</th>
                <th className="pb-3 pr-4">Система</th>
                <th className="pb-3 pr-4 text-right">Сумма</th>
                <th className="pb-3 pr-4 text-right">Комиссия</th>
                <th className="pb-3 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {payments.map((p) => {
                const badge = STATUS[p.status] ?? STATUS.pending;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                      {p.id}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{p.description}</div>
                      {p.errorText && (
                        <div className="text-[11px] text-rose-300">{p.errorText}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-slate-300">{p.provider}</span>
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          p.mode === "live"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-white/8 text-slate-400"
                        }`}
                      >
                        {p.mode === "live" ? "LIVE" : "DEMO"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-white">
                      {formatRub(p.amountKop / 100)}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-400">
                      {formatRub((p.platformFeeKop + p.acquiringFeeKop) / 100)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Платежей пока нет.{" "}
                    <Link href="/pay" className="text-lime-300 underline">
                      Проведите тестовый
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accent} to-transparent p-5`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white sm:text-3xl">{value}</div>
      <div className="mt-2 text-[11px] leading-tight text-slate-400">{hint}</div>
    </div>
  );
}
