"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProviderStatus } from "@/lib/payments/types";
import { formatRub } from "@/lib/commission";

type Props = {
  providers: ProviderStatus[];
  enabled: Record<string, boolean>;
  rate: number;
  recipient: string;
};

const PURPOSES = [
  { key: "escrow", label: "Безопасная сделка", hint: "Деньги резервируются до приёмки работы" },
  { key: "topup", label: "Пополнение баланса", hint: "Зачисляется на счёт в кабинете" },
  { key: "commission", label: "Оплата счёта ИП", hint: "Оплата по выставленному счёту" },
];

export default function CheckoutForm({ providers, enabled, rate, recipient }: Props) {
  const router = useRouter();
  const active = providers.filter((p) => enabled[p.key] !== false);
  const [provider, setProvider] = useState(active[0]?.key ?? "yookassa");
  const [amount, setAmount] = useState(25000);
  const [purpose, setPurpose] = useState("escrow");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = providers.find((p) => p.key === provider);
  const platformFee = purpose === "escrow" ? Math.round((amount * rate) / 100) : 0;
  const executorGets = amount - platformFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          amount,
          purpose,
          customerEmail: email,
          description:
            PURPOSES.find((p) => p.key === purpose)?.label ?? "Оплата на площадке",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Платёж не создан");
        setBusy(false);
        return;
      }
      const url: string = data.confirmationUrl;
      if (url.startsWith("/")) router.push(url);
      else window.location.href = url;
    } catch {
      setError("Сеть недоступна");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-7">
        <div>
          <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Способ оплаты
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setProvider(p.key)}
                className={`rounded-2xl border p-4 text-left transition ${
                  provider === p.key
                    ? "border-lime-300/60 bg-lime-300/10"
                    : "border-white/10 bg-black/30 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{p.logo}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.configured
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-amber-400/15 text-amber-300"
                    }`}
                  >
                    {p.configured ? "LIVE" : "ДЕМО"}
                  </span>
                </div>
                <div className="mt-2 text-sm font-bold text-white">{p.name}</div>
                <div className="text-[11px] text-slate-400">
                  {p.methods.slice(0, 2).join(" · ")} · {p.feeLabel}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Назначение платежа
          </span>
          <div className="space-y-2">
            {PURPOSES.map((p) => (
              <label
                key={p.key}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                  purpose === p.key
                    ? "border-lime-300/50 bg-lime-300/8"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <input
                  type="radio"
                  name="purpose"
                  checked={purpose === p.key}
                  onChange={() => setPurpose(p.key)}
                  className="mt-1 h-4 w-4 accent-lime-400"
                />
                <span>
                  <span className="block text-sm font-bold text-white">{p.label}</span>
                  <span className="block text-[11px] text-slate-400">{p.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Сумма, ₽
            </span>
            <input
              type="number"
              min={10}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bd-input"
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              E-mail для чека
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@mail.ru"
              className="bd-input"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1000, 5000, 25000, 100000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                amount === v
                  ? "border-lime-300/60 bg-lime-300/15 text-lime-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
              }`}
            >
              {v.toLocaleString("ru-RU")} ₽
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 py-4 text-base font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Создаём платёж…" : `Оплатить ${formatRub(amount || 0)}`}
        </button>
        <p className="text-center text-[11px] text-slate-500">
          Нажимая кнопку, вы принимаете оферту. Платёж проходит на стороне{" "}
          {chosen?.name ?? "платёжной системы"} — карта не касается нашего сервера.
        </p>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-lime-300/25 bg-gradient-to-br from-lime-300/12 to-transparent p-7">
          <div className="text-xs font-bold uppercase tracking-widest text-lime-200">
            К оплате
          </div>
          <div className="mt-2 text-5xl font-black text-white">
            {formatRub(amount || 0)}
          </div>
          <div className="mt-5 space-y-2.5 text-sm">
            <Row label="Получатель" value={recipient} />
            <Row label="Система" value={chosen?.name ?? "—"} />
            <Row
              label="Режим"
              value={chosen?.configured ? "Боевой (LIVE)" : "Демо-песочница"}
            />
            {purpose === "escrow" && (
              <>
                <div className="h-px bg-white/10" />
                <Row label={`Комиссия сервиса ${rate}%`} value={formatRub(platformFee)} />
                <Row label="Исполнитель получит" value={formatRub(executorGets)} strong />
              </>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-sm text-slate-300">
          <h3 className="text-sm font-bold text-white">Безопасность платежей</h3>
          <ul className="mt-4 space-y-2.5 text-xs">
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> PCI DSS — данные карты обрабатывает банк-эквайер</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> 3-D Secure 2.0 на всех картах</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Чек по 54-ФЗ приходит на e-mail</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Возврат в течение 10 дней по заявлению</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span
        className={`text-right ${strong ? "text-base font-black text-lime-300" : "font-semibold text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
