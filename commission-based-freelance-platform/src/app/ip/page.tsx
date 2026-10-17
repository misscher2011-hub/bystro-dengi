import Link from "next/link";
import IpTaxCalculator from "@/components/ip/IpTaxCalculator";
import IpForm from "@/components/ip/IpForm";
import { getIpProfiles } from "@/lib/data";
import { getMerchant } from "@/lib/merchant";
import { getProviderStatuses } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Для ИП и самозанятых — Быстро Деньги",
  description:
    "Выплаты на расчётный счёт, акты и счета автоматически, работа с НДС-контрагентами. Комиссия та же: 10% → 7% → 5%.",
};

const BENEFITS = [
  {
    icon: "🏦",
    title: "Выплаты на расчётный счёт",
    text: "Деньги уходят на р/с ИП в течение рабочего дня. Минимум для вывода — те же 100 ₽.",
  },
  {
    icon: "🧾",
    title: "Акты и счета автоматически",
    text: "После приёмки работы площадка формирует счёт, акт и чек. Подписать можно в один клик.",
  },
  {
    icon: "📑",
    title: "Закрывающие документы для юрлиц",
    text: "Заказчики-компании получают полный пакет: договор-оферта, акт, УПД по запросу.",
  },
  {
    icon: "💼",
    title: "Работа с НДС",
    text: "Поддерживаем контрагентов на ОСНО: счёт-фактура и УПД формируются в кабинете.",
  },
  {
    icon: "📊",
    title: "Выгрузка для бухгалтерии",
    text: "Excel и 1С-выгрузка по всем сделкам и комиссиям за любой период.",
  },
  {
    icon: "🛡️",
    title: "Статус ИП в профиле",
    text: "Бейдж «ИП» повышает конверсию откликов на корпоративных заказах в 2,4 раза.",
  },
];

const DOCS = [
  { name: "Договор-оферта", desc: "Публичная оферта платформы", icon: "📄" },
  { name: "Счёт на оплату", desc: "Формируется по каждой сделке", icon: "🧾" },
  { name: "Акт выполненных работ", desc: "Подписание в один клик", icon: "✍️" },
  { name: "Отчёт по комиссиям", desc: "Excel / 1С за любой период", icon: "📊" },
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  verified: { text: "Подтверждён", cls: "bg-emerald-400/15 text-emerald-300" },
  pending: { text: "На проверке", cls: "bg-amber-400/15 text-amber-300" },
  rejected: { text: "Отклонён", cls: "bg-rose-400/15 text-rose-300" },
};

export default async function IpPage() {
  const [profiles, merchant] = await Promise.all([getIpProfiles(), getMerchant()]);
  const providers = getProviderStatuses();
  const verified = profiles.filter((p) => p.status === "verified").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/12 via-emerald-400/8 to-transparent p-8 sm:p-12">
        <div className="bd-grid absolute inset-0 opacity-40" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Раздел ИП
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
              Для ИП и самозанятых —{" "}
              <span className="bd-text-gradient">белые деньги без бухгалтера</span>
            </h1>
            <p className="mt-5 max-w-xl text-slate-300">
              Принимайте оплату от юрлиц на расчётный счёт, получайте акты и
              счета автоматически и оставайтесь на той же ступени комиссии:{" "}
              <b className="text-white">10% → 7% → 5%</b>. Подключение статуса —
              бесплатно.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#ip-form"
                className="rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-400 px-6 py-3.5 font-extrabold text-[#04150f] transition hover:brightness-110"
              >
                Подключить статус ИП
              </Link>
              <Link
                href="#ip-calc"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:border-cyan-300/50"
              >
                Посчитать налоги
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { v: `${verified}`, l: "подтверждённых ИП" },
              { v: "15 мин", l: "проверка в ЕГРИП" },
              { v: "0 ₽", l: "за подключение" },
              { v: "6%", l: "налог на УСН вместо 13%" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-black/35 p-5"
              >
                <div className="text-2xl font-black text-white">{s.v}</div>
                <div className="mt-1 text-[11px] leading-tight text-slate-400">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Что получает ИП на площадке
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-cyan-300/35"
            >
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-4 text-base font-bold text-white">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Реквизиты площадки */}
      <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.035] p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              С кем вы заключаете договор
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Площадка работает от лица ИП — все выплаты и документы официальные.
            </p>
          </div>
          <Link
            href="/legal"
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:border-cyan-300/50"
          >
            Оферта и реквизиты →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Наименование
            </div>
            <div className="mt-1.5 text-sm font-bold leading-snug text-white">
              {merchant.legalName}
            </div>
          </div>
          {[
            ["ИНН", merchant.inn],
            ["ОГРНИП", merchant.ogrnip],
            ["Налогообложение", merchant.taxSystem],
            ["Расчётный счёт", merchant.settlementAccount],
            ["Банк", `${merchant.bankName} · БИК ${merchant.bik}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {label}
              </div>
              <div className="mt-1.5 break-all text-sm font-bold text-white">
                {value || "—"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {providers.map((p) => (
            <span
              key={p.key}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300"
            >
              <span>{p.logo}</span> {p.name}
            </span>
          ))}
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300">
            🧾 Чек по 54-ФЗ
          </span>
        </div>
      </section>

      {/* Calculator */}
      <section id="ip-calc" className="mt-14 scroll-mt-24">
        <IpTaxCalculator />
      </section>

      {/* Compare statuses */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Физлицо, самозанятый или ИП?
        </h2>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Параметр</th>
                <th className="px-5 py-4">Физлицо</th>
                <th className="px-5 py-4">Самозанятый</th>
                <th className="px-5 py-4 text-cyan-200">ИП на УСН 6%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-slate-300">
              {[
                ["Налог с дохода", "13% НДФЛ", "4% / 6% НПД", "6% УСН"],
                ["Лимит дохода в год", "без лимита", "2,4 млн ₽", "250 млн ₽"],
                ["Работа с юрлицами", "сложно", "да, с чеком", "да, полный пакет"],
                ["Счёт-фактура и НДС", "нет", "нет", "да, при ОСНО"],
                ["Выплата на р/с", "нет", "на карту", "на расчётный счёт"],
                ["Страховые взносы", "нет", "нет", "~53 700 ₽/год"],
                ["Комиссия площадки", "10% → 7% → 5%", "10% → 7% → 5%", "10% → 7% → 5%"],
              ].map((row) => (
                <tr key={row[0]} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 font-semibold text-white">{row[0]}</td>
                  <td className="px-5 py-3.5">{row[1]}</td>
                  <td className="px-5 py-3.5">{row[2]}</td>
                  <td className="px-5 py-3.5 font-semibold text-cyan-200">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Form + registry */}
      <section id="ip-form" className="mt-14 grid gap-6 scroll-mt-24 lg:grid-cols-[1.05fr_0.95fr]">
        <IpForm />

        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Реестр исполнителей</h3>
              <span className="text-xs text-slate-500">{profiles.length} записей</span>
            </div>
            <div className="bd-scroll mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const badge = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {p.companyName}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          ИНН {p.inn}
                          {p.ogrnip ? ` · ОГРНИП ${p.ogrnip}` : ""}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-white/8 px-2.5 py-1 text-slate-300">
                        {p.taxSystem}
                      </span>
                      {p.needsVat && (
                        <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-cyan-200">
                          работает с НДС
                        </span>
                      )}
                      {p.bankAccount && (
                        <span className="rounded-full bg-white/8 px-2.5 py-1 text-slate-400">
                          р/с ···{p.bankAccount.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h3 className="text-lg font-bold text-white">Документы</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DOCS.map((d) => (
                <div
                  key={d.name}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <span className="text-xl">{d.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400">{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ИП */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Вопросы по работе ИП
        </h2>
        <div className="mt-6 space-y-3">
          {[
            {
              q: "Меняется ли комиссия для ИП?",
              a: "Нет. Ступени одинаковые для всех: 10% до 50 000 ₽ заработка, 7% от 50 000 ₽ и 5% от 300 000 ₽. Подключение статуса ИП бесплатное.",
            },
            {
              q: "Как быстро приходят деньги на расчётный счёт?",
              a: "Платёжка уходит в тот же рабочий день, зачисление — по регламенту вашего банка, обычно в течение нескольких часов. Минимальная сумма вывода — 100 ₽.",
            },
            {
              q: "Кто формирует акты и счета?",
              a: "Площадка. После приёмки работы документы появляются в кабинете, а заказчику уходят на почту. Подпись — простая электронная, по SMS-коду.",
            },
            {
              q: "Что если заказчик работает с НДС?",
              a: "Укажите в заявке «работаю с НДС» — площадка добавит счёт-фактуру и УПД в пакет документов по каждой сделке.",
            },
            {
              q: "Я самозанятый, подойдёт ли раздел?",
              a: "Да. Для НПД площадка формирует чек в «Мой налог» автоматически, а выплаты идут на карту или счёт. Лимит 2,4 млн ₽ в год контролируем в кабинете.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 open:border-cyan-300/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-white">
                {item.q}
                <span className="text-cyan-300 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[32px] border border-cyan-300/25 bg-gradient-to-r from-cyan-400/12 to-transparent p-10 text-center">
        <h2 className="text-2xl font-black text-white sm:text-4xl">
          Бесплатно. Без подписок. Платишь только 10%, когда получил деньги.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Для ИП — те же условия плюс документы, счета и выплаты на расчётный счёт.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/tasks"
            className="rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-400 px-7 py-4 font-extrabold text-[#04150f]"
          >
            Найти заказ для ИП
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white"
          >
            Мои заработки
          </Link>
        </div>
      </section>
    </div>
  );
}
