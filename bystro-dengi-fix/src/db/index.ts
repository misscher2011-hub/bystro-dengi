import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Пул соединений создаётся лениво — только при первом реальном обращении
 * к базе. Это принципиально для Vercel: на этапе сборки переменная
 * DATABASE_URL может отсутствовать, а модуль импортируется всеми
 * маршрутами. Раньше Pool создавался на верхнем уровне и падал с
 * «DATABASE_URL is required» во время сборки.
 */

const globalForDb = globalThis as typeof globalThis & {
  __bystroPgPool?: Pool;
  __bystroDb?: ReturnType<typeof drizzle>;
};

function createPool(databaseUrl: string): Pool {
  const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);

  return new Pool({
    connectionString: databaseUrl,
    // На serverless держим мало соединений, иначе упрёмся в лимит базы.
    // Pooled-строка Neon (с -pooler) поднимает лимит до 10 000.
    max: isLocal ? 10 : 3,
    idleTimeoutMillis: isLocal ? 30_000 : 10_000,
    connectionTimeoutMillis: 15_000,
    // Облачный Postgres требует TLS, локальный — нет
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

/** Пул подключений. Бросает понятную ошибку, только если БД реально нужна. */
export function getPool(): Pool {
  if (globalForDb.__bystroPgPool) return globalForDb.__bystroPgPool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL не задан. Добавьте переменную окружения в Vercel " +
        "(Settings → Environment Variables) и сделайте Redeploy.",
    );
  }

  const pool = createPool(databaseUrl);
  globalForDb.__bystroPgPool = pool;
  return pool;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    if (!globalForDb.__bystroDb) {
      globalForDb.__bystroDb = drizzle(getPool());
    }
    return Reflect.get(globalForDb.__bystroDb as object, prop, receiver);
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getPool(), prop, receiver);
  },
});
