"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Task } from "@/db/schema";
import { formatRub, getTier } from "@/lib/commission";

type Props = {
  tasks: Task[];
  userEarned: number;
};

const SORTS = [
  { key: "new", label: "Сначала новые" },
  { key: "budget", label: "Дорогие" },
  { key: "responses", label: "Мало откликов" },
] as const;

export default function TaskBoard({ tasks, userEarned }: Props) {
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [minBudget, setMinBudget] = useState(0);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("new");
  const [applied, setApplied] = useState<number[]>([]);

  const tier = getTier(userEarned);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category));
    return ["Все", ...Array.from(set).sort()];
  }, [tasks]);

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (category !== "Все" && t.category !== category) return false;
      if (t.budget < minBudget) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    const sorted = [...filtered];
    if (sort === "budget") sorted.sort((a, b) => b.budget - a.budget);
    else if (sort === "responses") sorted.sort((a, b) => a.responses - b.responses);
    else
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return sorted;
  }, [tasks, category, query, minBudget, sort]);

  const totalNet = visible.reduce(
    (sum, t) => sum + (t.budget - Math.round((t.budget * tier.rate) / 100)),
    0,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Поиск
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="бот, лендинг, тексты…"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/50"
          />

          <div className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Категория
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  category === c
                    ? "border-lime-300/60 bg-lime-300/15 text-lime-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Бюджет от</span>
            <span className="text-lime-300">{minBudget.toLocaleString("ru-RU")} ₽</span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={minBudget}
            onChange={(e) => setMinBudget(Number(e.target.value))}
            className="mt-3 w-full bg-white/10"
          />

          <div className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Сортировка
          </div>
          <div className="mt-2 space-y-1.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                  sort === s.key
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-lime-300/25 bg-gradient-to-br from-lime-300/12 to-transparent p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-lime-200">
            Ваша ставка
          </div>
          <div className="mt-2 text-4xl font-black text-white">{tier.rate}%</div>
          <div className="text-xs text-slate-300">
            {tier.emoji} {tier.name} · отклики бесплатно
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400">
            Если взять все {visible.length} заданий, на руки получится{" "}
            <b className="text-white">{formatRub(totalNet)}</b>
          </div>
        </div>

        <Link
          href="/tasks/new"
          className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition hover:border-lime-300/50"
        >
          + Разместить задание · 0 ₽
        </Link>
      </aside>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Найдено заданий: <b className="text-white">{visible.length}</b>
          </span>
          <span className="hidden sm:block">Отклик стоит 0 ₽ · без лимитов</span>
        </div>

        {visible.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-12 text-center text-slate-400">
            Ничего не нашлось. Попробуйте снять фильтры.
          </div>
        )}

        {visible.map((task) => {
          const fee = Math.round((task.budget * tier.rate) / 100);
          const net = task.budget - fee;
          const isApplied = applied.includes(task.id);
          return (
            <article
              key={task.id}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-lime-300/35"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  {task.category}
                </span>
                {task.isUrgent && (
                  <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-bold text-rose-300">
                    🔥 Срочно
                  </span>
                )}
                <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-400">
                  📍 {task.city}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-400">
                  ⏱ {task.deadlineDays} дн.
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-white">{task.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {task.description}
              </p>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/8 pt-4">
                <div className="flex flex-wrap gap-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">
                      Бюджет
                    </div>
                    <div className="text-xl font-black text-white">
                      {formatRub(task.budget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">
                      Комиссия {tier.rate}%
                    </div>
                    <div className="text-xl font-bold text-rose-300">
                      −{formatRub(fee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">
                      На руки
                    </div>
                    <div className="text-xl font-black text-lime-300">
                      {formatRub(net)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {task.customerName} · {task.responses} откл.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setApplied((prev) =>
                        prev.includes(task.id)
                          ? prev.filter((id) => id !== task.id)
                          : [...prev, task.id],
                      )
                    }
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                      isApplied
                        ? "border border-lime-300/50 bg-lime-300/15 text-lime-200"
                        : "bg-gradient-to-r from-lime-300 to-emerald-400 text-[#04150f] hover:brightness-110"
                    }`}
                  >
                    {isApplied ? "✓ Отклик отправлен" : "Откликнуться · 0 ₽"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
