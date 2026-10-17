"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Мои заработки", icon: "📈" },
  { href: "/admin/payments", label: "Платёжные системы", icon: "💳" },
  { href: "/admin/requisites", label: "Реквизиты ИП", icon: "🏢" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-gradient-to-r from-lime-300 to-emerald-400 text-[#04150f]"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
