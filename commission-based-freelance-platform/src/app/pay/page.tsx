import Link from "next/link";
import CheckoutForm from "@/components/pay/CheckoutForm";
import { getProviderStatuses } from "@/lib/payments";
import { getMerchant, getPaymentSettings } from "@/lib/merchant";
import { getDemoUser } from "@/lib/data";
import { getRate } from "@/lib/commission";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Оплата — Быстро Деньги",
  description: "Приём платежей через ЮKassa, СБП, Т-Банк и Robokassa.",
};

export default async function PayPage() {
  const [providers, settings, merchant, user] = await Promise.all([
    Promise.resolve(getProviderStatuses()),
    getPaymentSettings(),
    getMerchant(),
    getDemoUser(),
  ]);

  const enabled: Record<string, boolean> = {};
  for (const s of settings) enabled[s.provider] = s.enabled;
  const rate = getRate(user.totalEarned);
  const live = providers.some((p) => p.configured);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
          Приём платежей
        </span>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">
          Оплата через безопасную сделку
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Деньги резервируются на стороне эквайера и уходят исполнителю только
          после приёмки работы. Размещение задания при этом остаётся 0 ₽.
        </p>
        {!live && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm text-amber-200">
            Боевые ключи эквайринга пока не заданы — платежи проходят во
            встроенной демо-песочнице. Добавьте ключи в разделе{" "}
            <Link href="/admin/payments" className="font-bold underline">
              Платёжные системы
            </Link>
            , и тот же код начнёт принимать реальные деньги.
          </div>
        )}
      </div>

      <div className="mt-10">
        <CheckoutForm
          providers={providers}
          enabled={enabled}
          rate={rate}
          recipient={merchant.legalName}
        />
      </div>
    </div>
  );
}
