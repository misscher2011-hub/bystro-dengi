import Link from "next/link";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatRub } from "@/lib/commission";
import { getMerchant } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export const metadata = { title: "Платёж принят — Быстро Деньги" };

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const paymentId = Number(id ?? 0);
  const merchant = await getMerchant();

  const [payment] = paymentId
    ? await db.select().from(payments).where(eq(payments.id, paymentId))
    : [];

  const succeeded = payment?.status === "succeeded";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="rounded-[28px] border border-lime-300/30 bg-gradient-to-br from-lime-300/12 to-transparent p-10">
        <div className="text-6xl">{succeeded ? "✅" : "⏳"}</div>
        <h1 className="mt-5 text-3xl font-black text-white">
          {succeeded ? "Платёж принят" : "Платёж обрабатывается"}
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          {succeeded
            ? "Деньги зарезервированы в безопасной сделке. Исполнитель получит их после приёмки работы."
            : "Банк подтверждает операцию. Статус обновится автоматически, когда придёт уведомление от платёжной системы."}
        </p>

        {payment && (
          <div className="mt-7 space-y-2 rounded-2xl border border-white/10 bg-black/35 p-5 text-left text-sm">
            <Row label="Платёж" value={`№${payment.id}`} />
            <Row label="Сумма" value={formatRub(payment.amountKop / 100)} />
            <Row label="Система" value={payment.provider} />
            <Row label="Режим" value={payment.mode === "live" ? "LIVE" : "ДЕМО"} />
            {payment.platformFeeKop > 0 && (
              <Row
                label="Комиссия сервиса"
                value={formatRub(payment.platformFeeKop / 100)}
              />
            )}
            <Row label="Получатель" value={merchant.legalName} />
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/admin/payments"
            className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3 font-bold text-[#04150f]"
          >
            Все платежи
          </Link>
          <Link
            href="/tasks"
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white"
          >
            К заданиям
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
