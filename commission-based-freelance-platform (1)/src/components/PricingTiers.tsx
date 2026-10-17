import { TIERS, formatNumber } from "@/lib/commission";

export default function PricingTiers({
  currentEarned,
}: {
  currentEarned?: number;
}) {
  return (
    <section id="tariffs" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Вариант PRO
        </span>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Чем больше зарабатываешь — <span className="bd-text-gradient">тем меньше платишь</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
          Ступень меняется автоматически по накопленному заработку. Новичок видит
          цель, ТОП не уходит к конкурентам. Никаких подписок, оплат за отклики и
          скрытых списаний.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const active =
            currentEarned !== undefined &&
            currentEarned >= tier.from &&
            (tier.to === null || currentEarned < tier.to);
          return (
            <div
              key={tier.key}
              className={`relative overflow-hidden rounded-3xl p-[1px] transition hover:-translate-y-1 ${
                tier.key === "pro"
                  ? "bg-gradient-to-b from-lime-300/70 via-emerald-400/25 to-transparent"
                  : "bg-white/10"
              }`}
            >
              <div className="relative h-full rounded-[23px] bg-[#070d16] p-7">
                {tier.key === "pro" && (
                  <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#04150f]">
                    Популярный
                  </span>
                )}
                {active && (
                  <span className="absolute right-5 top-5 rounded-full border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200">
                    Ваша ступень
                  </span>
                )}

                <div className="text-4xl">{tier.emoji}</div>
                <h3 className="mt-4 text-xl font-bold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{tier.tagline}</p>

                <div className="mt-6 flex items-end gap-2">
                  <span
                    className={`bg-gradient-to-r ${tier.accent} bg-clip-text text-6xl font-black leading-none text-transparent`}
                  >
                    {tier.rate}%
                  </span>
                  <span className="pb-2 text-sm text-slate-400">комиссия</span>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {tier.to === null
                    ? `от ${formatNumber(tier.from)} ₽ заработка`
                    : tier.from === 0
                      ? `до ${formatNumber(tier.to)} ₽ заработка`
                      : `от ${formatNumber(tier.from)} ₽ заработка`}
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex gap-2.5">
                      <span className="mt-0.5 text-lime-300">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 rounded-2xl bg-black/40 px-4 py-3 text-xs text-slate-400">
                  С заказа на 100 000 ₽ вы получите{" "}
                  <span className="font-bold text-white">
                    {formatNumber(100000 - (100000 * tier.rate) / 100)} ₽
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-3">
        {[
          { icon: "🆓", title: "Заказчик платит 0 ₽", text: "Размещение задания и отклики бесплатны навсегда" },
          { icon: "💸", title: "Вывод от 100 ₽", text: "СБП, карта или расчётный счёт ИП — хоть каждый день" },
          { icon: "🔒", title: "Безопасная сделка", text: "Деньги резервируются, комиссия списывается по факту" },
        ].map((item) => (
          <div key={item.title} className="flex gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-sm font-bold text-white">{item.title}</div>
              <div className="text-xs text-slate-400">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
