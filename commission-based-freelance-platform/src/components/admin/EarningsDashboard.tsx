"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Deal, User, Withdrawal } from "@/db/schema";
import EarningsChart, { type ChartPoint } from "./EarningsChart";
import {
  MIN_WITHDRAWAL,
  formatNumber,
  formatRub,
  getTier,
  nextTier,
} from "@/lib/commission";

type Props = {
  user: User;
  deals: Deal[];
  withdrawals: Withdrawal[];
  chart: ChartPoint[];
};

const METHOD_LABEL: Record<string, string> = {
  sbp: "СБП",
  card: "Карта",
  ip_account: "Счёт ИП",
};

const CATEGORIES = [
  "Разработка",
  "Сайты",
  "Дизайн",
  "Тексты",
  "Реклама",
  "SEO",
  "Видео",
  "Маркетинг",
  "Разное",
];

export default function EarningsDashboard({
  user,
  deals,
  withdrawals,
  chart,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"deals" | "withdrawals">("deals");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  const tier = getTier(user.totalEarned);
  const next = nextTier(user.totalEarned);

  const stats = useMemo(() => {
    const paid = deals.filter((d) => d.status === "paid");
    const gross = paid.reduce((s, d) => s + d.amount, 0);
    const fee = paid.reduce((s, d) => s + d.commissionAmount, 0);
    const net = paid.reduce((s, d) => s + d.netAmount, 0);
    const pending = deals
      .filter((d) => d.status === "in_progress")
      .reduce((s, d) => s + d.netAmount, 0);
    const withdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
    const avg = paid.length ? Math.round(gross / paid.length) : 0;
    const effective = gross > 0 ? (fee / gross) * 100 : 0;
    const savedVsKwork = Math.round(gross * 0.2) - fee;
    return { gross, fee, net, pending, withdrawn, avg, effective, savedVsKwork, count: paid.length };
  }, [deals, withdrawals]);

  const progress = next
    ? Math.min(
        100,
        Math.round(((user.totalEarned - tier.from) / (next.from - tier.from)) * 100),
      )
    : 100;

  function notify(kind: "ok" | "err", text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4200);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-2xl ${
            toast.kind === "ok"
              ? "border-lime-300/40 bg-[#0d1a12] text-lime-200"
              : "border-rose-400/40 bg-[#1a0d12] text-rose-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* ── Профиль + ступень ── */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-3xl">
              {user.avatarEmoji}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-sm text-slate-400">
                {user.specialization} · {user.city} · ★{" "}
                {(user.rating / 10).toFixed(1)}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-gradient-to-r ${tier.accent} px-4 py-2 text-sm font-black text-[#04150f]`}
            >
              {tier.emoji} {tier.name} · {tier.rate}%
            </div>
          </div>

          <div className="mt-6">
            {next ? (
              <>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>
                    До ставки <b className="text-white">{next.rate}%</b> осталось{" "}
                    <b className="text-lime-300">
                      {formatRub(Math.max(next.from - user.totalEarned, 0))}
                    </b>
                  </span>
                  <span className="text-slate-500">
                    {formatNumber(user.totalEarned)} / {formatNumber(next.from)} ₽
                  </span>
                </div>
                <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
                👑 Вы на максимальной ступени — всего 5% комиссии.
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Сделок закрыто" value={String(stats.count)} />
            <Mini label="Средний чек" value={formatRub(stats.avg)} />
            <Mini
              label="Эффективная ставка"
              value={`${stats.effective.toFixed(1)}%`}
            />
            <Mini label="В работе" value={formatRub(stats.pending)} />
          </div>
        </div>

        <WithdrawCard
          balance={user.balance}
          onDone={(msg) => {
            notify("ok", msg);
            router.refresh();
          }}
          onError={(msg) => notify("err", msg)}
        />
      </div>

      {/* ── KPI ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Заработано всего"
          value={formatRub(stats.gross)}
          hint="Брутто по закрытым сделкам"
          accent="from-lime-300/20"
        />
        <Kpi
          label="Получено на руки"
          value={formatRub(stats.net)}
          hint="После комиссии сервиса"
          accent="from-emerald-400/20"
        />
        <Kpi
          label="Комиссия сервиса"
          value={formatRub(stats.fee)}
          hint={`Эффективно ${stats.effective.toFixed(1)}% вместо 20% у Kwork`}
          accent="from-rose-400/15"
        />
        <Kpi
          label="Выведено"
          value={formatRub(stats.withdrawn)}
          hint={`${withdrawals.length} выплат · комиссия 0 ₽`}
          accent="from-cyan-400/20"
        />
      </div>

      <div className="rounded-3xl border border-lime-300/25 bg-gradient-to-r from-lime-300/10 to-transparent px-6 py-4 text-sm text-lime-100">
        💡 На Kwork с таким оборотом вы бы отдали{" "}
        <b>{formatRub(Math.round(stats.gross * 0.2))}</b> комиссии. Здесь вы
        сэкономили <b>{formatRub(Math.max(stats.savedVsKwork, 0))}</b>.
      </div>

      {/* ── График + добавление сделки ── */}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <EarningsChart data={chart} />
        <AddDealForm
          rate={tier.rate}
          onDone={(msg) => {
            notify("ok", msg);
            router.refresh();
          }}
          onError={(msg) => notify("err", msg)}
          categories={CATEGORIES}
        />
      </div>

      {/* ── Таблицы ── */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(
              [
                ["deals", `Сделки (${deals.length})`],
                ["withdrawals", `Выводы (${withdrawals.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  tab === key
                    ? "bg-white/12 text-white"
                    : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            Комиссия удерживается в момент приёмки работы
          </span>
        </div>

        <div className="bd-scroll mt-5 overflow-x-auto">
          {tab === "deals" ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Сделка</th>
                  <th className="pb-3 pr-4">Заказчик</th>
                  <th className="pb-3 pr-4">Дата</th>
                  <th className="pb-3 pr-4 text-right">Сумма</th>
                  <th className="pb-3 pr-4 text-right">Ставка</th>
                  <th className="pb-3 pr-4 text-right">Комиссия</th>
                  <th className="pb-3 text-right">На руки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{d.title}</div>
                      <div className="text-xs text-slate-500">
                        {d.category}
                        {d.status === "in_progress" && (
                          <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            в работе
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{d.client}</td>
                    <td className="py-3 pr-4 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-white">
                      {formatNumber(d.amount)} ₽
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-400">
                      {d.commissionRate}%
                    </td>
                    <td className="py-3 pr-4 text-right text-rose-300">
                      −{formatNumber(d.commissionAmount)} ₽
                    </td>
                    <td className="py-3 text-right font-bold text-lime-300">
                      {formatNumber(d.netAmount)} ₽
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Дата</th>
                  <th className="pb-3 pr-4">Способ</th>
                  <th className="pb-3 pr-4">Реквизиты</th>
                  <th className="pb-3 pr-4 text-right">Сумма</th>
                  <th className="pb-3 text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(w.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      {METHOD_LABEL[w.method] ?? w.method}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{w.destination}</td>
                    <td className="py-3 pr-4 text-right font-bold text-white">
                      {formatNumber(w.amount)} ₽
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          w.status === "done"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-amber-400/15 text-amber-300"
                        }`}
                      >
                        {w.status === "done" ? "Выплачено" : "В обработке"}
                      </span>
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Пока выводов не было. Минимальная сумма — {MIN_WITHDRAWAL} ₽.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── sub components ───────────── */

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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function WithdrawCard({
  balance,
  onDone,
  onError,
}: {
  balance: number;
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [amount, setAmount] = useState(Math.min(balance, 1000) || MIN_WITHDRAWAL);
  const [method, setMethod] = useState("sbp");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) onError(data.error ?? "Ошибка вывода");
      else onDone(`Заявка на ${formatRub(amount)} создана. Комиссия за вывод 0 ₽`);
    } catch {
      onError("Сеть недоступна");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-lime-300/25 bg-gradient-to-br from-lime-300/12 to-transparent p-7"
    >
      <div className="text-xs font-bold uppercase tracking-widest text-lime-200">
        Доступно к выводу
      </div>
      <div className="mt-1 text-4xl font-black text-white">{formatRub(balance)}</div>
      <p className="mt-2 text-xs text-slate-300">
        Минимум {MIN_WITHDRAWAL} ₽ · комиссия 0 ₽ · хоть каждый день
      </p>

      <div className="mt-5 flex gap-2">
        {[100, 300, 1000].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className="flex-1 rounded-xl border border-white/15 bg-black/30 py-2 text-xs font-bold text-white transition hover:border-lime-300/50"
          >
            {v} ₽
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAmount(balance)}
          className="flex-1 rounded-xl border border-white/15 bg-black/30 py-2 text-xs font-bold text-white transition hover:border-lime-300/50"
        >
          Всё
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min={MIN_WITHDRAWAL}
          max={balance}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="bd-input flex-1"
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bd-input w-36"
        >
          <option value="sbp" className="bg-[#070d16]">СБП</option>
          <option value="card" className="bg-[#070d16]">Карта</option>
          <option value="ip_account" className="bg-[#070d16]">Счёт ИП</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={busy || balance < MIN_WITHDRAWAL}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 py-3.5 font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-50"
      >
        {busy ? "Отправляем…" : "Вывести деньги"}
      </button>
    </form>
  );
}

function AddDealForm({
  rate,
  categories,
  onDone,
  onError,
}: {
  rate: number;
  categories: string[];
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    client: "",
    category: "Разработка",
    amount: 30000,
    status: "paid" as "paid" | "in_progress",
  });
  const [busy, setBusy] = useState(false);

  const fee = Math.round((form.amount * rate) / 100);
  const net = form.amount - fee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        onError(data.error ?? "Не удалось добавить сделку");
      } else {
        onDone(
          `Сделка добавлена: +${formatRub(net)} на баланс (комиссия ${data.rate}%)`,
        );
        setForm({ ...form, title: "", client: "" });
      }
    } catch {
      onError("Сеть недоступна");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
    >
      <h3 className="text-lg font-bold text-white">Добавить сделку</h3>
      <p className="mt-1 text-xs text-slate-400">
        Комиссия считается автоматически по вашей текущей ступени ({rate}%).
      </p>

      <div className="mt-4 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Название работы"
          className="bd-input"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            placeholder="Заказчик"
            className="bd-input"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bd-input"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#070d16]">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={100}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="bd-input"
            required
          />
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as "paid" | "in_progress" })
            }
            className="bd-input"
          >
            <option value="paid" className="bg-[#070d16]">Оплачено</option>
            <option value="in_progress" className="bg-[#070d16]">В работе</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-black/40 p-3 text-center">
        <div>
          <div className="text-[10px] uppercase text-slate-500">Сумма</div>
          <div className="text-sm font-bold text-white">
            {formatNumber(form.amount)} ₽
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-500">Комиссия</div>
          <div className="text-sm font-bold text-rose-300">−{formatNumber(fee)} ₽</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-500">На руки</div>
          <div className="text-sm font-bold text-lime-300">{formatNumber(net)} ₽</div>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-2xl border border-white/15 bg-white/8 py-3 font-bold text-white transition hover:border-lime-300/50 disabled:opacity-50"
      >
        {busy ? "Сохраняем…" : "Записать сделку"}
      </button>
    </form>
  );
}
