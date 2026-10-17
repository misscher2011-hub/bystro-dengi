import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // На serverless (Vercel) каждый инстанс держит немного соединений,
    // иначе можно упереться в лимит базы. Пулер Neon поднимает лимит.
    max: isLocal ? 10 : 3,
    idleTimeoutMillis: isLocal ? 30_000 : 10_000,
    connectionTimeoutMillis: 15_000,
    // Neon и любой облачный Postgres требуют TLS; локально — нет
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
