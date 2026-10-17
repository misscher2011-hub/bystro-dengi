import { db } from "@/db";
import { tasks } from "@/db/schema";
import { ensureSeed, getTasks } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const rows = await getTasks(category);
  return Response.json({ ok: true, tasks: rows });
}

export async function POST(request: Request) {
  try {
    await ensureSeed();
    const body = (await request.json()) as Record<string, unknown>;

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "Разное").trim();
    const customerName = String(body.customerName ?? "").trim();
    const budget = Math.round(Number(body.budget ?? 0));
    const deadlineDays = Math.max(1, Math.round(Number(body.deadlineDays ?? 3)));
    const city = String(body.city ?? "Удалённо").trim() || "Удалённо";
    const isUrgent = Boolean(body.isUrgent);

    if (title.length < 5) {
      return Response.json(
        { ok: false, error: "Название задания — минимум 5 символов" },
        { status: 400 },
      );
    }
    if (description.length < 10) {
      return Response.json(
        { ok: false, error: "Опишите задачу подробнее (минимум 10 символов)" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(budget) || budget < 100) {
      return Response.json(
        { ok: false, error: "Бюджет должен быть от 100 ₽" },
        { status: 400 },
      );
    }
    if (!customerName) {
      return Response.json(
        { ok: false, error: "Укажите имя или название компании" },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(tasks)
      .values({
        title,
        description,
        category,
        budget,
        deadlineDays,
        customerName,
        city,
        isUrgent,
        responses: 0,
        status: "open",
      })
      .returning();

    return Response.json({ ok: true, task: created, placementFee: 0 });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось сохранить задание" },
      { status: 500 },
    );
  }
}
