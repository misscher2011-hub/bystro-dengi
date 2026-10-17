import Link from "next/link";
import { getMerchant } from "@/lib/merchant";
import { getProviderStatuses } from "@/lib/payments";
import { TIERS } from "@/lib/commission";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Документы и реквизиты — Быстро Деньги",
  description:
    "Публичная оферта, реквизиты ИП, условия оплаты, возврата и политика обработки данных.",
};

export default async function LegalPage() {
  const merchant = await getMerchant();
  const providers = getProviderStatuses();

  const requisites: [string, string][] = [
    ["Полное наименование", merchant.legalName],
    ["ФИО предпринимателя", merchant.ownerName],
    ["ИНН", merchant.inn],
    ["ОГРНИП", merchant.ogrnip],
    ["ОКВЭД", merchant.okved],
    ["Налогообложение", merchant.taxSystem],
    ["Дата регистрации", merchant.registeredAt],
    ["Адрес регистрации", merchant.legalAddress],
  ];

  const bank: [string, string][] = [
    ["Банк", merchant.bankName],
    ["ИНН банка", merchant.bankInn],
    ["БИК банка", merchant.bik],
    ["Расчётный счёт", merchant.settlementAccount],
    ["Корреспондентский счёт", merchant.corrAccount],
    ["Юридический адрес банка", merchant.bankAddress],
  ];

  const contactLine =
    [merchant.email, merchant.phone].filter(Boolean).join(", ") ||
    "через форму поддержки на сайте";
  const dataRequestTarget = merchant.email || "в службу поддержки сервиса";
  const siteRef = merchant.website || "«Быстро Деньги»";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
          Документы
        </span>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">
          Реквизиты и оферта
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Сервис «{merchant.brandName}» работает официально: платежи принимает
          индивидуальный предприниматель, по каждой операции формируется чек по
          54-ФЗ.
        </p>
      </div>

      {/* Реквизиты */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            🏢 Реквизиты ИП
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            {requisites.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-white/6 pb-2.5">
                <dt className="shrink-0 text-slate-400">{label}</dt>
                <dd className="text-right font-semibold text-white">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            🏦 Банковские реквизиты
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            {bank.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-white/6 pb-2.5">
                <dt className="shrink-0 text-slate-400">{label}</dt>
                <dd className="break-all text-right font-mono text-white">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-2xl bg-black/40 p-4 text-xs text-slate-400">
            Назначение платежа: «Оплата услуг по договору-оферте на сайте{" "}
            {siteRef}. НДС не облагается (
            {merchant.taxSystem.includes("НДС") ? "ОСНО" : "спецрежим"}
            )».
          </div>
        </section>
      </div>

      {/* Способы оплаты */}
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-7">
        <h2 className="text-lg font-bold text-white">💳 Способы оплаты</h2>
        <p className="mt-2 text-sm text-slate-400">
          Платежи обрабатывают лицензированные операторы. Данные карты не
          попадают на серверы площадки — используется PCI DSS-инфраструктура
          эквайера и 3-D Secure.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p) => (
            <div
              key={p.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="text-2xl">{p.logo}</div>
              <div className="mt-2 text-sm font-bold text-white">{p.name}</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {p.methods.slice(0, 3).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Оферта */}
      <section className="mt-6 space-y-3">
        <h2 className="text-2xl font-extrabold text-white">Публичная оферта</h2>
        {[
          {
            q: "1. Предмет договора",
            a: `${merchant.legalName} (далее — Исполнитель) предоставляет пользователям доступ к сервису «${merchant.brandName}» — площадке для размещения заданий и поиска исполнителей, а также к сервису безопасной сделки. Размещение заданий заказчиками осуществляется бесплатно.`,
          },
          {
            q: "2. Стоимость услуг и комиссия",
            a: `Вознаграждение Исполнителя удерживается только из суммы, фактически полученной пользователем-исполнителем: ${TIERS.map((t) => `${t.rate}% (${t.name})`).join(", ")}. Ступень определяется автоматически по накопленному заработку: до 50 000 ₽ — 10%, от 50 000 ₽ — 7%, от 300 000 ₽ — 5%. Абонентская плата, плата за размещение заданий и за отклики не взимается.`,
          },
          {
            q: "3. Порядок расчётов",
            a: "Оплата производится банковской картой, через СБП или по счёту на расчётный счёт ИП. Денежные средства по безопасной сделке резервируются до подписания акта приёмки. Чек по 54-ФЗ направляется на e-mail плательщика автоматически.",
          },
          {
            q: "4. Выплаты исполнителям",
            a: "Минимальная сумма вывода — 100 ₽, комиссия за вывод не взимается. Переводы по СБП и на карты проходят в течение 5 минут, на расчётный счёт ИП — в течение рабочего дня. Количество выводов в сутки не ограничено.",
          },
          {
            q: "5. Возврат средств",
            a: "Если работа не выполнена, заказчик вправе подать заявление на возврат в течение 10 календарных дней. Спор рассматривается арбитражем площадки в срок до 48 часов; при положительном решении средства возвращаются тем же способом, которым была произведена оплата.",
          },
          {
            q: "6. Персональные данные",
            a: `Исполнитель обрабатывает персональные данные в соответствии с 152-ФЗ исключительно для оказания услуг: идентификации пользователей, проведения расчётов и формирования отчётных документов. Запрос на удаление данных направляется ${dataRequestTarget}.`,
          },
          {
            q: "7. Реквизиты и контакты",
            a: `${merchant.legalName}. ИНН ${merchant.inn}, ОГРНИП ${merchant.ogrnip}. Адрес регистрации: ${merchant.legalAddress}. Банковские реквизиты: р/с ${merchant.settlementAccount} в ${merchant.bankName}, БИК ${merchant.bik}, к/с ${merchant.corrAccount}. Контакты: ${contactLine}. Поддержка: ${merchant.supportHours}.`,
          },
        ].map((item) => (
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
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/pay"
          className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3.5 font-extrabold text-[#04150f]"
        >
          Перейти к оплате
        </Link>
        <Link
          href="/admin/requisites"
          className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white"
        >
          Изменить реквизиты
        </Link>
      </div>
    </div>
  );
}
