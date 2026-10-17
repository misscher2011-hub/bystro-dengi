import "dotenv/config";
import type { Config } from "drizzle-kit";

/**
 * Конфигурация Drizzle Kit.
 *
 * URL берётся из переменной окружения DATABASE_URL (файл .env),
 * поэтому одни и те же команды работают и с локальной базой, и с Neon:
 *
 *   npx drizzle-kit generate   # сгенерировать миграцию из schema.ts
 *   npx drizzle-kit push       # применить схему к базе
 *
 * Локальное значение ниже — только резерв, чтобы проект запускался
 * сразу после клонирования без настройки.
 */
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
} satisfies Config;
