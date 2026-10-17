"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRub } from "@/lib/commission";

type Props = {
  payment: {
    id: number;
    amountKop: number;
    description: string;
    provider: string;
    status: string;
  };
  recipient: string;
  inn: string;
};

const PROVIDER_NAME: Record<string, string> = {
  yookassa: "ЮKassa",
  tbank: "Т-Банк",
  robokassa: "Robokassa",
  sbp: "СБП",
};

export default function DemoGateway({ payment, recipient, inn }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"ok" | "fail" | null>(null);

  async function confirm(outcome: "succeeded" | "canceled") {
    setBusy(outcome === "succeeded" ? "ok" : "fail");
    try {
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payment.id, outcome }),
      });
      router.push(
        outcome === "succeeded"
          ? `/pay/success?id=${payment.id}`
          : `/pay/fail?id=${payment.id}`,
      );
    } catch {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/12 bg-[#070d16] p-8 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-lg">
            🔐
          </span>
          <div>
            <div className="text-sm font-bold text-white">
              {PROVIDER_NAME[payment.provider] ?? payment.provider}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-amber-300">
              Демо-песочница
            </div>
          </div>
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] text-slate-300">
          Платёж №{payment.id}
        </span>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-xs text-slate-400">Сумма к оплате</div>
        <div className="mt-1 text-4xl font-black text-white">
          {formatRub(payment.amountKop / 100)}
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-slate-400">
          <div className="flex justify-between gap-4">
            <span>Назначение</span>
            <span className="text-right text-slate-200">{payment.description}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Получатель</span>
            <span className="text-right text-slate-200">{recipient}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>ИНН</span>
            <span className="text-right text-slate-200">{inn}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Номер карты (тестовая)</div>
          <div className="mt-1 font-mono text-lg tracking-widest text-white">
            5555 5555 5555 4444
          </div>
          <div className="mt-2 flex gap-5 text-xs text-slate-400">
            <span>12/30</span>
            <span>CVC ···</span>
            <span className="text-lime-300">3-D Secure пройден</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => confirm("succeeded")}
          disabled={busy !== null}
          className="w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 py-4 font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-60"
        >
          {busy === "ok" ? "Проводим платёж…" : "Подтвердить оплату"}
        </button>
        <button
          type="button"
          onClick={() => confirm("canceled")}
          disabled={busy !== null}
          className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-slate-300 transition hover:border-rose-400/40 disabled:opacity-60"
        >
          Отклонить платёж
        </button>
      </div>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-500">
        Это встроенный тестовый шлюз. После добавления ключей ЮKassa / Т-Банка
        пользователь будет попадать на настоящую платёжную страницу, а статус
        придёт в вебхук.
      </p>
    </div>
  );
}
