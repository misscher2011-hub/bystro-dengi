import Link from "next/link";

export const metadata = { title: "Платёж не прошёл — Быстро Деньги" };

export default function PayFailPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="rounded-[28px] border border-rose-400/30 bg-gradient-to-br from-rose-500/12 to-transparent p-10">
        <div className="text-6xl">⚠️</div>
        <h1 className="mt-5 text-3xl font-black text-white">Платёж отклонён</h1>
        <p className="mt-3 text-sm text-slate-300">
          Банк не подтвердил операцию. Деньги не списаны — попробуйте другую
          карту или оплатите через СБП: комиссия ниже, а подтверждение приходит
          мгновенно.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/pay"
            className="rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 px-6 py-3 font-bold text-[#04150f]"
          >
            Повторить оплату
          </Link>
          <Link
            href="/admin/payments"
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white"
          >
            История платежей
          </Link>
        </div>
      </div>
    </div>
  );
}
