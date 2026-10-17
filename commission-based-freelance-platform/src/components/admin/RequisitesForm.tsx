"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MerchantProfile } from "@/db/schema";

type Props = { merchant: MerchantProfile };

const TAX_SYSTEMS = [
  "УСН «Доходы» 6%",
  "УСН «Доходы минус расходы» 15%",
  "НПД (самозанятость)",
  "Патент (ПСН)",
  "ОСНО (с НДС)",
];

export default function RequisitesForm({ merchant }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    brandName: merchant.brandName,
    legalName: merchant.legalName,
    ownerName: merchant.ownerName,
    inn: merchant.inn,
    ogrnip: merchant.ogrnip,
    okved: merchant.okved,
    taxSystem: merchant.taxSystem,
    registeredAt: merchant.registeredAt,
    legalAddress: merchant.legalAddress,
    bankName: merchant.bankName,
    bankInn: merchant.bankInn,
    bankAddress: merchant.bankAddress,
    bik: merchant.bik,
    corrAccount: merchant.corrAccount,
    settlementAccount: merchant.settlementAccount,
    email: merchant.email,
    phone: merchant.phone,
    website: merchant.website,
    supportHours: merchant.supportHours,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/merchant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg({ kind: "err", text: data.error ?? "Не удалось сохранить" });
      } else {
        setMsg({
          kind: "ok",
          text: "Реквизиты сохранены — обновлены в футере, на странице оплаты и в офёрте",
        });
        router.refresh();
      }
    } catch {
      setMsg({ kind: "err", text: "Сеть недоступна" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Section title="Основные данные ИП" icon="🏢">
          <Grid>
            <Field label="Бренд / название сервиса">
              <input
                value={form.brandName}
                onChange={(e) => set("brandName", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="Полное наименование">
              <input
                value={form.legalName}
                onChange={(e) => set("legalName", e.target.value)}
                placeholder="ИП Иванов Иван Иванович"
                className="bd-input"
                required
              />
            </Field>
            <Field label="ФИО предпринимателя">
              <input
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="ИНН (12 цифр)">
              <input
                value={form.inn}
                onChange={(e) => set("inn", e.target.value)}
                inputMode="numeric"
                className="bd-input"
                required
              />
            </Field>
            <Field label="ОГРНИП (15 цифр)">
              <input
                value={form.ogrnip}
                onChange={(e) => set("ogrnip", e.target.value)}
                inputMode="numeric"
                className="bd-input"
              />
            </Field>
            <Field label="Основной ОКВЭД">
              <input
                value={form.okved}
                onChange={(e) => set("okved", e.target.value)}
                placeholder="63.11"
                className="bd-input"
              />
            </Field>
            <Field label="Система налогообложения">
              <select
                value={form.taxSystem}
                onChange={(e) => set("taxSystem", e.target.value)}
                className="bd-input"
              >
                {TAX_SYSTEMS.map((t) => (
                  <option key={t} value={t} className="bg-[#070d16]">
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Дата регистрации">
              <input
                value={form.registeredAt}
                onChange={(e) => set("registeredAt", e.target.value)}
                placeholder="12.03.2021"
                className="bd-input"
              />
            </Field>
          </Grid>
          <Field label="Адрес регистрации">
            <input
              value={form.legalAddress}
              onChange={(e) => set("legalAddress", e.target.value)}
              className="bd-input"
            />
          </Field>
        </Section>

        <Section title="Банковские реквизиты" icon="🏦">
          <Grid>
            <Field label="Банк">
              <input
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="ИНН банка (10 цифр)">
              <input
                value={form.bankInn}
                onChange={(e) => set("bankInn", e.target.value)}
                inputMode="numeric"
                className="bd-input"
              />
            </Field>
            <Field label="БИК (9 цифр)">
              <input
                value={form.bik}
                onChange={(e) => set("bik", e.target.value)}
                inputMode="numeric"
                className="bd-input"
              />
            </Field>
            <Field label="Расчётный счёт (20 цифр)">
              <input
                value={form.settlementAccount}
                onChange={(e) => set("settlementAccount", e.target.value)}
                inputMode="numeric"
                className="bd-input"
              />
            </Field>
            <Field label="Корр. счёт банка (20 цифр)">
              <input
                value={form.corrAccount}
                onChange={(e) => set("corrAccount", e.target.value)}
                inputMode="numeric"
                className="bd-input"
              />
            </Field>
          </Grid>
          <Field label="Юридический адрес банка">
            <input
              value={form.bankAddress}
              onChange={(e) => set("bankAddress", e.target.value)}
              className="bd-input"
            />
          </Field>
        </Section>

        <Section title="Контакты для клиентов" icon="📞">
          {(!form.email || !form.phone) && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-xs text-amber-200">
              Заполните e-mail и телефон поддержки — они обязательны для оферты,
              чеков по 54-ФЗ и анкеты при подключении эквайринга.
            </div>
          )}
          <Grid>
            <Field label="E-mail поддержки">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="Телефон">
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="Сайт">
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="bd-input"
              />
            </Field>
            <Field label="Часы работы">
              <input
                value={form.supportHours}
                onChange={(e) => set("supportHours", e.target.value)}
                className="bd-input"
              />
            </Field>
          </Grid>
        </Section>

        {msg && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              msg.kind === "ok"
                ? "border-lime-300/35 bg-lime-300/10 text-lime-200"
                : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-to-r from-lime-300 to-emerald-400 py-4 text-base font-extrabold text-[#04150f] transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Сохраняем…" : "Сохранить реквизиты"}
        </button>
      </div>

      {/* Превью */}
      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/10 to-transparent p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-200">
              Как это выглядит в оферте
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="text-base font-black text-white">{form.legalName}</div>
              <PreviewRow label="ИНН" value={form.inn} />
              <PreviewRow label="ОГРНИП" value={form.ogrnip} />
              <PreviewRow label="ОКВЭД" value={form.okved} />
              <PreviewRow label="Налогообложение" value={form.taxSystem} />
              <PreviewRow label="Адрес" value={form.legalAddress} />
              <div className="my-2 h-px bg-white/10" />
              <PreviewRow label="Банк" value={form.bankName} />
              <PreviewRow label="ИНН банка" value={form.bankInn} />
              <PreviewRow label="БИК" value={form.bik} />
              <PreviewRow label="Р/с" value={form.settlementAccount} />
              <PreviewRow label="К/с" value={form.corrAccount} />
              <PreviewRow label="Адрес банка" value={form.bankAddress} />
              <div className="my-2 h-px bg-white/10" />
              <PreviewRow label="E-mail" value={form.email} />
              <PreviewRow label="Телефон" value={form.phone} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-xs leading-relaxed text-slate-400">
            <b className="text-white">Где используются реквизиты:</b> футер сайта,
            публичная оферта на странице «Документы», платёжная страница
            (получатель), чеки 54-ФЗ, счета и акты для заказчиков-юрлиц, а также
            анкета магазина при подключении эквайринга.
          </div>
        </div>
      </aside>
    </form>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <span>{icon}</span>
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-200">{value || "—"}</span>
    </div>
  );
}
