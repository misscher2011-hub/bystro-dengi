import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Быстро Деньги — биржа заданий без подписок, комиссия от 5%",
  description:
    "Бесплатно. Без подписок. Платишь только 10% когда получил деньги. Комиссия падает до 7% и 5%. Вывод от 100 ₽ хоть каждый день.",
};

/**
 * Все данные сайта приходят из базы (задания, сделки, реквизиты ИП в футере),
 * поэтому статический пререндеринг на этапе сборки не используется.
 *
 * Это снимает зависимость `next build` от доступности PostgreSQL:
 * на Vercel переменная DATABASE_URL бывает недоступна в момент сборки,
 * и пререндеринг падал с ошибкой. При динамическом рендеринге запрос
 * к базе происходит только во время реального обращения пользователя.
 */
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#05080f] text-slate-100 antialiased selection:bg-lime-300 selection:text-black">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
