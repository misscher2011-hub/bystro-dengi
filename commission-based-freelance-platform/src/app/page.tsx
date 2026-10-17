import Link from "next/link";
import PricingTiers from "@/components/PricingTiers";
import CommissionCalculator from "@/components/CommissionCalculator";
import { getTasks, getTopUsers } from "@/lib/data";
import { formatNumber, formatRub, getTier } from "@/lib/commission";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Заказчик публикует задание",
    text: "Бесплатно и без модерации по 3 дня. Никаких подписок и пакетов откликов.",
    icon: "📝",
  },
  {
    n: "02",
    title: "Исполнители откликаются",
    text: "Отклик стоит 0 ₽. Заказчик выбирает по рейтингу, кейсам и цене.",
    icon: "⚡",
  },
  {
    n: "03",
    title: "Деньги в безопасной сделке",
    text: "Сумма резервируется на счёте сервиса, пока работа не сдана.",
    icon: "🔒",
  },
  {
    n: "04",
    title: "Работа принята — вы получили деньги",
    text: "Только в этот момент сервис берёт свой процент: 10%, 7% или 5%.",
    icon: "💚",
  },
];

const FAQ = [
  {
    q: "Сколько стоит разместить задание?",
    a: "0 ₽. Всегда. Заказчик не платит ни за размещение, ни за просмотр откликов, ни за контакты исполнителя. Мы зарабатываем только тогда, когда заработал исполнитель.",
  },
  {
    q: "Как работает ступенчатая комиссия?",
    a: "Пока суммарный заработок на площадке меньше 50 000 ₽ — комиссия 10%. После 50 000 ₽ ставка автоматически падает до 7%, после 300 000 ₽ — до 5%. Пересчёт происходит мгновенно, заявки писать не нужно.",
  },
  {
    q: "Какой минимум для вывода?",
    a: "100 ₽. Выводить можно хоть каждый день: СБП и карты — до 5 минут, расчётный счёт ИП — в течение рабочего дня. Комиссия за вывод — 0 ₽.",
  },
  {
    q: "Есть ли платные подписки или PRO-аккаунты?",
    a: "Нет. Ни подписок, ни платных откликов, ни «поднятия в топ» за деньги. Единственный платёж — процент с уже полученных вами денег.",
  },
  {
    q: "Я ИП или самозанятый — что мне даёт площадка?",
    a: "Раздел «Для ИП»: выплаты на расчётный счёт, автоматические акты и счета, закрывающие документы для юрлиц, работа с НДС-контрагентами и выгрузка для бухгалтерии.",
  },
  {
    q: "Что если заказчик не заплатит?",
    a: "Деньги заранее резервируются в безопасной сделке. Если заказчик пропал — средства разблокируются в вашу пользу по регламенту арбитража за 48 часов.",
  },
];

const TICKER = [
  "Полина вывела 12 400 ₽ · СБП · 2 мин",
  "Новое задание: Telegram-бот · 60 000 ₽",
  "Рустам перешёл на ставку 5% 👑",
  "Артём вывел 350 ₽ · карта",
  "Новое задание: лендинг пиццерии · 35 000 ₽",
  "Ника заработала 184 000 ₽ за 6 месяцев",
  "Комиссия за размещение задания: 0 ₽",
];

export default async function HomePage() {
  const [tasks, topUsers] = await Promise.all([getTasks(), getTopUsers()]);
  const latest = tasks.slice(0, 6);
  const totalBudget = tasks.reduce((sum, t) => sum + t.budget, 0);

  return (
    <div>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden">
        <div className="bd-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />
                {tasks.length} активных заданий на {formatRub(totalBudget)}
              </span>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
                Бесплатно. Без подписок.
                <br />
                Платишь только{" "}
                <span className="bd-text-gradient">10%</span>, когда{" "}
                <span className="bd-text-gradient">получил деньги</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                «Быстро Деньги» — биржа заданий, где заказчик не платит ни рубля
                за размещение, а исполнитель отдаёт процент только с реально
                полученной оплаты. Дальше ставка падает: <b className="text-white">10% → 7% → 5%</b>.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/tasks"
                  className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3.5 text-base font-extrabold text-[#04150f] transition hover:brightness-110"
                >
                  Найти задание и заработать
                </Link>
                <Link
                  href="/tasks/new"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-bold text-white transition hover:border-lime-300/50"
                >
                  Разместить задание · 0 ₽
                </Link>
              </div>

              <div className="mt-9 grid max-w-lg grid-cols-3 gap-4">
                {[
                  { v: "0 ₽", l: "размещение задания" },
                  { v: "от 100 ₽", l: "минимальный вывод" },
                  { v: "5–10%", l: "вся комиссия" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xl font-black text-white sm:text-2xl">{s.v}</div>
                    <div className="mt-1 text-[11px] leading-tight text-slate-400">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="bd-float relative">
              <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-emerald-500/25 via-lime-300/10 to-cyan-400/20 blur-3xl" />
              <div className="relative rounded-[28px] border border-white/12 bg-[#070d16]/90 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-300">
                    Сделка №4812
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Работа принята
                  </span>
                </div>
                <div className="mt-5 text-sm text-slate-400">Заказчик заплатил</div>
                <div className="text-4xl font-black text-white">100 000 ₽</div>

                <div className="mt-5 space-y-2.5 text-sm">
                  <Row label="Комиссия площадки (10%)" value="−10 000 ₽" muted />
                  <Row label="Комиссия за вывод" value="0 ₽" muted />
                  <Row label="Подписка" value="0 ₽" muted />
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">На карту исполнителю</span>
                    <span className="text-xl font-black text-lime-300">90 000 ₽</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                  На FL.ru за этот месяц вы бы отдали ещё{" "}
                  <b className="text-white">2 400 ₽</b> подписки — даже если бы не
                  получили ни одного заказа.
                </div>

                <Link
                  href="/#calculator"
                  className="mt-5 block rounded-2xl bg-white/10 py-3 text-center text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Посчитать свой заказ →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ticker */}
        <div className="relative overflow-hidden border-y border-white/10 bg-black/40 py-3">
          <div className="bd-ticker flex w-max gap-10 whitespace-nowrap text-sm text-slate-400">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-lime-300">●</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TARIFFS ───────── */}
      <PricingTiers />

      {/* ───────── CALCULATOR ───────── */}
      <CommissionCalculator />

      {/* ───────── LIVE TASKS ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Свежие задания
            </h2>
            <p className="mt-2 text-slate-400">
              Отклик — бесплатно. Без лимитов и пакетов.
            </p>
          </div>
          <Link
            href="/tasks"
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:border-lime-300/50"
          >
            Все задания →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((task) => (
            <Link
              key={task.id}
              href="/tasks"
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-lime-300/40"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  {task.category}
                </span>
                {task.isUrgent && (
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                    Срочно
                  </span>
                )}
              </div>
              <h3 className="mt-3 line-clamp-2 text-base font-bold text-white group-hover:text-lime-200">
                {task.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {task.description}
              </p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xl font-black text-white">
                    {formatRub(task.budget)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    на руки {formatRub(task.budget - Math.round(task.budget * 0.1))} при 10%
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">
                  {task.responses} откликов
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
          Как это работает
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-6"
            >
              <span className="absolute right-5 top-4 text-3xl font-black text-white/8">
                {step.n}
              </span>
              <div className="text-3xl">{step.icon}</div>
              <h3 className="mt-4 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── WITHDRAWAL + COMPARE ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/12 to-transparent p-8">
            <div className="text-4xl">💸</div>
            <h3 className="mt-4 text-2xl font-extrabold text-white">
              Вывод от 100 ₽ — хоть каждый день
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Никаких «накопите 1 000 ₽ и ждите вторника». Заработал 300 ₽ —
              вывел 300 ₽. Это особенно важно новичкам: первые деньги должны
              приходить сразу, иначе площадке не верят.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              {[
                "СБП по номеру телефона — до 5 минут",
                "Банковская карта любого банка РФ",
                "Расчётный счёт ИП и самозанятых",
                "Комиссия за вывод — 0 ₽",
              ].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-lime-300">✓</span> {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
            <h3 className="text-2xl font-extrabold text-white">
              Сравнение с конкурентами
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Расчёт для исполнителя с доходом 100 000 ₽ в месяц.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Площадка</th>
                    <th className="px-4 py-3">Подписка</th>
                    <th className="px-4 py-3 text-right">Остаётся</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {[
                    { n: "Быстро Деньги", s: "0 ₽", r: "90 000 ₽", hl: true },
                    { n: "Kwork", s: "0 ₽", r: "80 000 ₽" },
                    { n: "FL.ru PRO", s: "2 400 ₽", r: "87 600 ₽" },
                    { n: "Профи.ру", s: "платные отклики", r: "~82 000 ₽" },
                  ].map((row) => (
                    <tr key={row.n} className={row.hl ? "bg-lime-300/8" : ""}>
                      <td className={`px-4 py-3 ${row.hl ? "font-bold text-lime-300" : "text-slate-200"}`}>
                        {row.n}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{row.s}</td>
                      <td className={`px-4 py-3 text-right font-bold ${row.hl ? "text-white" : "text-slate-300"}`}>
                        {row.r}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              На ступенях 7% и 5% разрыв становится ещё больше: при доходе
              300 000 ₽ вы экономите до 45 000 ₽ в месяц.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── TOP FREELANCERS ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          ТОП исполнителей месяца
        </h2>
        <p className="mt-2 text-slate-400">
          Ставка комиссии считается автоматически по накопленному заработку.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topUsers.map((u) => {
            const tier = getTier(u.totalEarned);
            return (
              <div
                key={u.id}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-center"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-2xl">
                  {u.avatarEmoji}
                </div>
                <div className="mt-3 font-bold text-white">{u.name}</div>
                <div className="text-xs text-slate-400">{u.specialization}</div>
                <div className="mt-3 text-lg font-black text-white">
                  {formatNumber(u.totalEarned)} ₽
                </div>
                <div className="text-[11px] text-slate-500">заработано всего</div>
                <div
                  className={`mt-3 inline-block rounded-full bg-gradient-to-r ${tier.accent} px-3 py-1 text-[11px] font-black text-[#04150f]`}
                >
                  {tier.emoji} {tier.name} · {tier.rate}%
                </div>
                {u.isIp && (
                  <div className="mt-2 text-[11px] text-cyan-300">ИП · работает с НДС</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── ИП TEASER ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-[32px] border border-cyan-300/20 bg-gradient-to-r from-cyan-400/12 via-emerald-400/8 to-transparent p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-200">
                Новый раздел
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                Для ИП и самозанятых
              </h2>
              <p className="mt-4 max-w-xl text-slate-300">
                Выплаты на расчётный счёт, автоматические акты и счета, работа с
                юрлицами и НДС-контрагентами, выгрузка документов для
                бухгалтерии. Статус ИП подтверждается за 15 минут через ЕГРИП.
              </p>
              <Link
                href="/ip"
                className="mt-7 inline-block rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-400 px-6 py-3.5 font-extrabold text-[#04150f] transition hover:brightness-110"
              >
                Перейти в раздел ИП →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { t: "Акты и счета", d: "автоматически" },
                { t: "Выплаты на р/с", d: "в течение дня" },
                { t: "НДС-контрагенты", d: "поддерживаются" },
                { t: "Статус ИП", d: "за 15 минут" },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-bold text-white">{c.t}</div>
                  <div className="text-xs text-slate-400">{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
          Частые вопросы
        </h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 open:border-lime-300/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-white">
                {item.q}
                <span className="text-lime-300 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="relative overflow-hidden rounded-[32px] border border-lime-300/25 bg-gradient-to-br from-lime-300/15 via-emerald-500/10 to-transparent p-10 text-center sm:p-16">
          <div className="bd-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              Бесплатно. Без подписок.
              <br />
              Платишь только 10%, когда получил деньги.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              Зарегистрируйся за минуту, возьми первое задание сегодня и выведи
              первые деньги уже от 100 ₽.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/tasks"
                className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-7 py-4 text-base font-extrabold text-[#04150f] transition hover:brightness-110"
              >
                Начать зарабатывать
              </Link>
              <Link
                href="/admin"
                className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 text-base font-bold text-white transition hover:border-lime-300/50"
              >
                Открыть «Мои заработки»
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-slate-400" : "text-white"}>{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}
