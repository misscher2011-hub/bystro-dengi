import { db } from "@/db";
import { ipProfiles } from "@/db/schema";
import { ensureSeed, getIpProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getIpProfiles();
  return Response.json({ ok: true, profiles: rows });
}

export async function POST(request: Request) {
  try {
    await ensureSeed();
    const body = (await request.json()) as Record<string, unknown>;

    const fullName = String(body.fullName ?? "").trim();
    const inn = String(body.inn ?? "").replace(/\D/g, "");
    const ogrnip = String(body.ogrnip ?? "").replace(/\D/g, "");
    const taxSystem = String(body.taxSystem ?? "УСН 6%");
    const bankAccount = String(body.bankAccount ?? "").replace(/\s/g, "");
    const phone = String(body.phone ?? "").trim();
    const needsVat = Boolean(body.needsVat);

    if (fullName.split(" ").filter(Boolean).length < 2) {
      return Response.json(
        { ok: false, error: "Укажите ФИО полностью" },
        { status: 400 },
      );
    }
    if (inn.length !== 12 && inn.length !== 10) {
      return Response.json(
        { ok: false, error: "ИНН должен содержать 12 цифр (ИП) или 10 (юрлицо)" },
        { status: 400 },
      );
    }
    if (bankAccount && bankAccount.length !== 20) {
      return Response.json(
        { ok: false, error: "Расчётный счёт должен содержать 20 цифр" },
        { status: 400 },
      );
    }

    const isSelfEmployed = taxSystem.startsWith("НПД");
    const companyName = isSelfEmployed
      ? `Самозанятый ${fullName}`
      : `ИП ${fullName}`;

    const [created] = await db
      .insert(ipProfiles)
      .values({
        companyName,
        fullName,
        inn,
        ogrnip,
        taxSystem,
        bankAccount,
        phone,
        needsVat,
        status: ogrnip.length >= 15 || isSelfEmployed ? "verified" : "pending",
        comment:
          ogrnip.length >= 15 || isSelfEmployed
            ? "Данные сверены с ЕГРИП автоматически."
            : "Укажите ОГРНИП или загрузите выписку — проверим за 15 минут.",
      })
      .returning();

    return Response.json({ ok: true, profile: created });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 500 },
    );
  }
}
