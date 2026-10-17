import Link from "next/link";
import EarningsDashboard from "@/components/admin/EarningsDashboard";
import {
  buildMonthlySeries,
  getDeals,
  getDemoUser,
  getIpProfiles,
  getWithdrawals,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Мои заработки — админ-панель Быстро Деньги",
  description: "Статистика заработка, комиссии, ступени и выводы средств.",
};

export default async function AdminPage() {
  const user = await getDemoUser();
  const [deals, withdrawals, ipProfiles] = await Promise.all([
    getDeals(user.id),
    getWithdrawals(user.id),
    getIpProfiles(),
  ]);

  const chart = buildMonthlySeries(
    deals.map((d) => ({
      amount: d.amount,
      netAmount: d.netAmount,
      commissionAmount: d.commissionAmount,
      createdAt: new Date(d.createdAt),
      status: d.status,
    })),
  );

  const myIp = ipProfiles.find((p) => p.userId === user.id);

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
            Админ-панель
          </span>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Мои заработки
          </h1>
          <p className="mt-2 text-slate-400">
            Всё прозрачно: сколько заработали, сколько удержал сервис и когда
            упадёт ставка.
          </p>
        </div>
        <div className="flex gap-2">
          {myIp && (
            <Link
              href="/ip"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200"
            >
              {myIp.status === "verified" ? "✓ ИП подтверждён" : "ИП на проверке"}
            </Link>
          )}
          <Link
            href="/tasks"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-lime-300/50"
          >
            Найти задание
          </Link>
        </div>
      </div>

      <EarningsDashboard
        user={user}
        deals={deals}
        withdrawals={withdrawals}
        chart={chart}
      />
    </div>
  );
}
