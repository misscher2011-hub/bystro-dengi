import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { MIN_WITHDRAWAL } from "@/lib/commission";
import { getDemoUser, getWithdrawals, recalcUser } from "@/lib/data";

export const dynamic = "force-dynamic";

const METHODS = new Set(["sbp", "card", "ip_account"]);

export async function GET() {
  const user = await getDemoUser();
  const rows = await getWithdrawals(user.id);
  return Response.json({ ok: true, withdrawals: rows, balance: user.balance });
}

export async function POST(request: Request) {
  try {
    const user = await getDemoUser();
    const body = (await request.json()) as Record<string, unknown>;

    const amount = Math.round(Number(body.amount ?? 0));
    const method = String(body.method ?? "sbp");
    const destination = String(body.destination ?? "").trim() || "+7 ··· 42-18";

    if (!METHODS.has(method)) {
      return Response.json(
        { ok: false, error: "Неизвестный способ вывода" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
      return Response.json(
        {
          ok: false,
          error: `Минимальная сумма вывода — ${MIN_WITHDRAWAL} ₽`,
        },
        { status: 400 },
      );
    }
    if (amount > user.balance) {
      return Response.json(
        {
          ok: false,
          error: `Недостаточно средств. Доступно ${user.balance.toLocaleString("ru-RU")} ₽`,
        },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(withdrawals)
      .values({
        userId: user.id,
        amount,
        method,
        destination,
        status: method === "ip_account" ? "processing" : "done",
      })
      .returning();

    const stats = await recalcUser(user.id);

    return Response.json({
      ok: true,
      withdrawal: created,
      balance: stats.balance,
      fee: 0,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось создать заявку на вывод" },
      { status: 500 },
    );
  }
}
