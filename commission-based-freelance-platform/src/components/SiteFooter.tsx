import Link from "next/link";
import { getMerchant, shortLegalName } from "@/lib/merchant";
import { getProviderStatuses } from "@/lib/payments";

export default async function SiteFooter() {
  const merchant = await getMerchant();
  const providers = getProviderStatuses();

  return (
    <footer className="mt-24 border-t border-white/10 bg-black/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-500 text-lg">
              ⚡
            </span>
            <span className="text-lg font-extrabold text-white">
              {merchant.brandName}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Биржа заданий, где заказчик платит 0 ₽ за размещение, а исполнитель
            отдаёт сервису только процент с уже полученных денег. Вывод от 100 ₽
            — хоть каждый день.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {providers.map((p) => (
              <span
                key={p.key}
                title={p.methods.join(", ")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-300"
              >
                <span>{p.logo}</span>
                {p.name}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[11px] leading-relaxed text-slate-400">
            <div className="font-bold text-slate-200">{merchant.legalName}</div>
            <div className="mt-1">
              ИНН {merchant.inn}
              {merchant.ogrnip ? ` · ОГРНИП ${merchant.ogrnip}` : ""}
            </div>
            {merchant.legalAddress && <div>{merchant.legalAddress}</div>}
            {merchant.settlementAccount && (
              <div className="mt-1">
                р/с {merchant.settlementAccount} · {merchant.bankName} · БИК{" "}
                {merchant.bik}
              </div>
            )}
            {(merchant.email || merchant.phone) && (
              <div className="mt-1">
                {[merchant.email, merchant.phone].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-1 text-slate-500">{merchant.supportHours}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Разделы
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link className="hover:text-lime-300" href="/tasks">Лента заданий</Link></li>
            <li><Link className="hover:text-lime-300" href="/tasks/new">Разместить задание</Link></li>
            <li><Link className="hover:text-lime-300" href="/admin">Мои заработки</Link></li>
            <li><Link className="hover:text-lime-300" href="/ip">Раздел ИП</Link></li>
            <li><Link className="hover:text-lime-300" href="/pay">Оплата</Link></li>
            <li><Link className="hover:text-lime-300" href="/#calculator">Калькулятор комиссии</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">
            Документы
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link className="hover:text-lime-300" href="/legal">Публичная оферта</Link></li>
            <li><Link className="hover:text-lime-300" href="/legal">Реквизиты ИП</Link></li>
            <li><Link className="hover:text-lime-300" href="/legal">Политика данных</Link></li>
            <li><Link className="hover:text-lime-300" href="/admin/payments">Платёжные системы</Link></li>
          </ul>
          <div className="mt-5 space-y-1.5 text-xs text-slate-500">
            <div>Размещение задания — 0 ₽</div>
            <div>Комиссия 10% → 7% → 5%</div>
            <div>Минимальный вывод — 100 ₽</div>
            <div>Чек по 54-ФЗ на каждый платёж</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {merchant.brandName} ·{" "}
        {shortLegalName(merchant)} · ИНН {merchant.inn}
      </div>
    </footer>
  );
}
