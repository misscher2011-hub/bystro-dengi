import { db } from "@/db";
import { deals } from "@/db/schema";
import { commissionFor } from "@/lib/commission";
import { getDemoUser, getDeals, recalcUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();
  const rows = await getDeals(user.id);
  return Response.json({ ok: true, deals: rows, user });
}

export async function POST(request: Request) {
  try {
    const user = await getDemoUser();
    const body = (await request.json()) as Record<string, unknown>;

    const title = String(body.title ?? "").trim();
    const client = String(body.client ?? "").trim() || "Частный заказчик";
    const category = String(body.category ?? "Разное").trim();
    const amount = Math.round(Number(body.amount ?? 0));
    const status = body.status === "in_progress" ? "in_progress" : "paid";

    if (title.length < 3) {
      return Response.json(
        { ok: false, error: "Название сделки — минимум 3 символа" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || amount < 100) {
      return Response.json(
        { ok: false, error: "Сумма сделки должна быть от 100 ₽" },
        { status: 400 },
      );
    }

    const { rate, commission, net } = commissionFor(amount, user.totalEarned);

    const [created] = await db
      .insert(deals)
      .values({
        userId: user.id,
        title,
        client,
        category,
        amount,
        commissionRate: rate,
        commissionAmount: commission,
        netAmount: net,
        status,
      })
      .returning();

    const stats = await recalcUser(user.id);

    return Response.json({
      ok: true,
      deal: created,
      totalEarned: stats.gross,
      balance: stats.balance,
      tier: stats.tier.name,
      rate: stats.tier.rate,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось добавить сделку" },
      { status: 500 },
    );
  }
}
