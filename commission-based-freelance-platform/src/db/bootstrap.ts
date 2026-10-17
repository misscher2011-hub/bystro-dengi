import { sql } from "drizzle-orm";
import { db, pool } from "./index";
import { SCHEMA_SQL } from "./ddl";

/**
 * Автоматическое создание схемы на чистой базе.
 *
 * Нужно для деплоя на Vercel + Neon: после подключения новой базы таблицы
 * создаются при первом обращении к сайту — миграции вручную запускать не нужно.
 *
 * Реализация рассчитана на работу через PgBouncer (pooled-строка Neon):
 * session-level advisory locks при transaction pooling ненадёжны, поэтому
 * вместо них используется идемпотентный SQL (CREATE TABLE IF NOT EXISTS)
 * и предварительная проверка каталога.
 */

const REQUIRED_TABLES = [
  "users",
  "tasks",
  "deals",
  "withdrawals",
  "ip_profiles",
  "merchant_profile",
  "payment_settings",
  "payments",
] as const;

const TABLE_LIST_SQL = `(${REQUIRED_TABLES.map((t) => `'${t}'`).join(",")})`;

let applied: Promise<void> | null = null;

async function tablesExist(): Promise<boolean> {
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(sql`information_schema.tables`)
    .where(
      sql`table_schema = 'public' and table_name in ${sql.raw(TABLE_LIST_SQL)}`,
    );
  return (row?.count ?? 0) >= REQUIRED_TABLES.length;
}

async function applySchema(): Promise<void> {
  if (await tablesExist()) return;

  try {
    // Один batch по простому протоколу: Postgres выполняет все
    // CREATE TABLE IF NOT EXISTS атомарно в неявной транзакции.
    await pool.query(SCHEMA_SQL);
  } catch (error) {
    // 42P07 (table already exists) и 23505 — значит, схему создал другой инстанс
    const code = (error as { code?: string }).code;
    if (code === "42P07" || code === "23505") return;
    throw error;
  }

  if (!(await tablesExist())) {
    throw new Error("Не удалось создать схему базы данных");
  }
}

export function ensureSchema(): Promise<void> {
  if (!applied) {
    applied = applySchema().catch((error) => {
      applied = null;
      throw error;
    });
  }
  return applied;
}
