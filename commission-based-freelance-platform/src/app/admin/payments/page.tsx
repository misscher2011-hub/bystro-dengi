import { headers } from "next/headers";
import PaymentsPanel from "@/components/admin/PaymentsPanel";
import { getProviderStatuses } from "@/lib/payments";
import { getPaymentSettings, getPaymentStats, getPayments } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Платёжные системы — Быстро Деньги",
  description: "Подключение эквайринга: ЮKassa, СБП, Т-Банк, Robokassa.",
};

export default async function AdminPaymentsPage() {
  const [settings, payments, stats, headerList] = await Promise.all([
    getPaymentSettings(),
    getPayments(),
    getPaymentStats(),
    headers(),
  ]);

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Платёжные системы
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Приём денег от заказчиков и выплаты исполнителям. Пока боевые ключи не
          заданы, все платежи идут через встроенную демо-песочницу — логика
          одинаковая.
        </p>
      </div>

      <PaymentsPanel
        providers={getProviderStatuses()}
        settings={settings}
        payments={payments}
        stats={stats}
        baseUrl={baseUrl}
      />
    </div>
  );
}
