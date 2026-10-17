"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRub } from "@/lib/commission";

const CATEGORIES = [
  "Сайты",
  "Разработка",
  "Дизайн",
  "Тексты",
  "Реклама",
  "SEO",
  "Видео",
  "Аналитика",
  "Маркетинг",
  "Разное",
];

export default function NewTaskForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Сайты",
    budget: 25000,
    deadlineDays: 7,
    customerName: "",
    city: "Удалённо",
    isUrgent: false,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ошибка сохранения");
        setStatus("idle");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setError("Сеть недоступна, попробуйте ещё раз");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-lime-300/30 bg-gradient-to-br from-lime-300/12 to-transparent p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-extrabold text-white">
          Задание опубликовано. Списано 0 ₽
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
          Исполнители уже видят вашу задачу в ленте. Отклики придут в течение
          часа — просмотр контактов тоже бесплатный.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/tasks"
            className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3 font-bold text-[#04150f]"
          >
            Смотреть ленту заданий
          </Link>
          <button
            type="button"
            onClick={() => {
              setForm({ ...form, title: "", description: "" });
              setStatus("idle");
            }}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white"
          >
            Разместить ещё одно
          </button>
        </div>
      </div>
    );
  }

  const fee = Math.round(form.budget * 0.1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={submit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-7"
      >
        <Field label="Что нужно сделать?">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Например: сделать лендинг для доставки пиццы"
            className="bd-input"
            required
          />
        </Field>

        <Field label="Подробное описание">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Что есть на входе, что нужно на выходе, сроки, пожелания…"
            className="bd-input resize-none"
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Категория">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bd-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#070d16]">
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Бюджет, ₽">
            <input
              type="number"
              min={100}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="bd-input"
              required
            />
          </Field>

          <Field label="Срок, дней">
            <input
              type="number"
              min={1}
              max={180}
              value={form.deadlineDays}
              onChange={(e) =>
                setForm({ ...form, deadlineDays: Number(e.target.value) })
              }
              className="bd-input"
            />
          </Field>

          <Field label="Город / формат">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bd-input"
            />
          </Field>
        </div>

        <Field label="Ваше имя или компания">
          <input
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Иван П. / ООО «Ромашка»"
            className="bd-input"
            required
          />
        </Field>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.isUrgent}
            onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
            className="h-4 w-4 accent-lime-400"
          />
          Пометить как срочное (бесплатно, как и всё остальное)
        </label>

        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 py-4 text-base font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "saving" ? "Публикуем…" : "Опубликовать бесплатно · 0 ₽"}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-lime-300/25 bg-gradient-to-br from-lime-300/12 to-transparent p-7">
          <div className="text-xs font-bold uppercase tracking-widest text-lime-200">
            Стоимость размещения
          </div>
          <div className="mt-2 text-6xl font-black text-white">0 ₽</div>
          <p className="mt-3 text-sm text-slate-300">
            Вы не платите за размещение, отклики, контакты и «поднятие» задания.
            Комиссию платит исполнитель — и только после того, как получил
            деньги.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
          <h3 className="text-sm font-bold text-white">Как распределится бюджет</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Вы платите исполнителю</span>
              <span className="font-bold text-white">{formatRub(form.budget || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Комиссия сервиса (с исполнителя)</span>
              <span className="font-bold text-slate-300">{formatRub(fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ваши доп. расходы</span>
              <span className="font-bold text-lime-300">0 ₽</span>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-black/40 p-4 text-xs text-slate-400">
            На FL.ru за публикацию проектов пришлось бы оформить подписку от
            2 400 ₽/мес. Здесь — ноль, навсегда.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 text-sm text-slate-300">
          <h3 className="text-sm font-bold text-white">Безопасная сделка</h3>
          <ul className="mt-4 space-y-2.5">
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Деньги замораживаются до приёмки</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Возврат при невыполнении</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Арбитраж решает спор за 48 часов</li>
            <li className="flex gap-2.5"><span className="text-lime-300">✓</span> Чеки и закрывающие документы</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
