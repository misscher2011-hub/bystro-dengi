import Link from "next/link";
import RequisitesForm from "@/components/admin/RequisitesForm";
import { getMerchant } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Реквизиты ИП — Быстро Деньги",
  description: "Данные ИП владельца площадки: ИНН, ОГРНИП, банковские реквизиты.",
};

export default async function RequisitesPage() {
  const merchant = await getMerchant();

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Реквизиты моего ИП
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Эти данные автоматически подставляются в оферту, футер, чеки,
            счета-акты и в анкету при подключении эквайринга. Замените
            демонстрационные значения на свои.
          </p>
        </div>
        <Link
          href="/legal"
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-lime-300/50"
        >
          Открыть публичную страницу →
        </Link>
      </div>

      <RequisitesForm merchant={merchant} />
    </div>
  );
}
