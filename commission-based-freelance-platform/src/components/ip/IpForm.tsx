"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TAX_SYSTEMS = [
  "УСН 6%",
  "УСН 15%",
  "НПД (самозанятость)",
  "ОСНО (с НДС)",
  "Патент (ПСН)",
];

export default function IpForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    inn: "",
    ogrnip: "",
    taxSystem: "УСН 6%",
    bankAccount: "",
    phone: "",
    needsVat: false,
  });
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; comment: string } | null>(
    null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ошибка отправки");
        setState("idle");
        return;
      }
      setResult({ status: data.profile.status, comment: data.profile.comment });
      setState("done");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
      setState("idle");
    }
  }

  if (state === "done" && result) {
    return (
      <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/12 to-transparent p-8 text-center">
        <div className="text-5xl">{result.status === "verified" ? "✅" : "⏳"}</div>
        <h3 className="mt-4 text-xl font-extrabold text-white">
          {result.status === "verified"
            ? "Статус подтверждён — можно принимать оплату на счёт"
            : "Заявка принята, проверяем данные"}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">{result.comment}</p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setResult(null);
            setForm({ ...form, fullName: "", inn: "", ogrnip: "", bankAccount: "" });
          }}
          className="mt-6 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"
    >
      <h3 className="text-xl font-extrabold text-white">
        Подключить статус ИП или самозанятого
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Проверяем данные по ЕГРИП и реестру самозанятых. Обычно занимает 15 минут.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            ФИО полностью
          </span>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Иванов Иван Иванович"
            className="bd-input"
            required
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            ИНН (12 цифр)
          </span>
          <input
            value={form.inn}
            onChange={(e) => setForm({ ...form, inn: e.target.value })}
            placeholder="771234567890"
            inputMode="numeric"
            className="bd-input"
            required
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            ОГРНИП (если есть)
          </span>
          <input
            value={form.ogrnip}
            onChange={(e) => setForm({ ...form, ogrnip: e.target.value })}
            placeholder="321774600123456"
            inputMode="numeric"
            className="bd-input"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Система налогообложения
          </span>
          <select
            value={form.taxSystem}
            onChange={(e) => setForm({ ...form, taxSystem: e.target.value })}
            className="bd-input"
          >
            {TAX_SYSTEMS.map((t) => (
              <option key={t} value={t} className="bg-[#070d16]">
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Телефон
          </span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+7 999 123-45-67"
            className="bd-input"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Расчётный счёт (20 цифр, необязательно)
          </span>
          <input
            value={form.bankAccount}
            onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
            placeholder="40802810500000018821"
            inputMode="numeric"
            className="bd-input"
          />
        </label>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.needsVat}
          onChange={(e) => setForm({ ...form, needsVat: e.target.checked })}
          className="h-4 w-4 accent-cyan-400"
        />
        Работаю с НДС — нужны счета-фактуры и УПД
      </label>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "saving"}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-400 py-4 font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "saving" ? "Проверяем в ЕГРИП…" : "Отправить на проверку"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        Подключение статуса — бесплатно. Комиссия площадки не меняется: 10% → 7% → 5%.
      </p>
    </form>
  );
}
