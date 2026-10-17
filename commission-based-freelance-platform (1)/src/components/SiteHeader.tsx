"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/tasks", label: "Задания" },
  { href: "/ip", label: "Для ИП" },
  { href: "/pay", label: "Оплата" },
  { href: "/admin", label: "Кабинет" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05080f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-500 text-lg shadow-lg shadow-emerald-500/30">
            ⚡
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-white">
              Быстро Деньги
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">
              биржа без подписок
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/tasks/new"
            className="hidden rounded-xl border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-lime-300/60 hover:text-lime-200 sm:block"
          >
            Разместить задание · 0 ₽
          </Link>
          <Link
            href="/admin"
            className="rounded-xl bg-gradient-to-r from-lime-300 to-emerald-400 px-4 py-2 text-sm font-bold text-[#04150f] transition hover:brightness-110"
          >
            Начать
          </Link>
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#05080f] px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
