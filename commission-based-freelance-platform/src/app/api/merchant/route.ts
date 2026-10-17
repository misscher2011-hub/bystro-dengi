import { getMerchant, setProviderEnabled, updateMerchant } from "@/lib/merchant";

export const dynamic = "force-dynamic";

const FIELDS = [
  "brandName",
  "legalName",
  "ownerName",
  "inn",
  "ogrnip",
  "okved",
  "taxSystem",
  "registeredAt",
  "legalAddress",
  "bankName",
  "bankInn",
  "bankAddress",
  "bik",
  "corrAccount",
  "settlementAccount",
  "email",
  "phone",
  "website",
  "supportHours",
] as const;

export async function GET() {
  const merchant = await getMerchant();
  return Response.json({ ok: true, merchant });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Переключение платёжной системы
    if (typeof body.provider === "string" && typeof body.enabled === "boolean") {
      const row = await setProviderEnabled(body.provider, body.enabled);
      return Response.json({ ok: true, setting: row });
    }

    const values: Record<string, string> = {};
    for (const field of FIELDS) {
      if (body[field] !== undefined) values[field] = String(body[field]).trim();
    }

    if (values.inn !== undefined) {
      const digits = values.inn.replace(/\D/g, "");
      if (digits.length !== 12 && digits.length !== 10) {
        return Response.json(
          { ok: false, error: "ИНН должен содержать 12 цифр (ИП) или 10 (юрлицо)" },
          { status: 400 },
        );
      }
      values.inn = digits;
    }
    if (values.ogrnip) {
      const digits = values.ogrnip.replace(/\D/g, "");
      if (digits.length !== 15) {
        return Response.json(
          { ok: false, error: "ОГРНИП должен содержать 15 цифр" },
          { status: 400 },
        );
      }
      values.ogrnip = digits;
    }
    if (values.bik) {
      const digits = values.bik.replace(/\D/g, "");
      if (digits.length !== 9) {
        return Response.json(
          { ok: false, error: "БИК должен содержать 9 цифр" },
          { status: 400 },
        );
      }
      values.bik = digits;
    }
    if (values.bankInn) {
      const digits = values.bankInn.replace(/\D/g, "");
      if (digits.length !== 10 && digits.length !== 12) {
        return Response.json(
          { ok: false, error: "ИНН банка должен содержать 10 цифр" },
          { status: 400 },
        );
      }
      values.bankInn = digits;
    }
    for (const key of ["settlementAccount", "corrAccount"] as const) {
      if (values[key]) {
        const digits = values[key].replace(/\D/g, "");
        if (digits.length !== 20) {
          return Response.json(
            {
              ok: false,
              error:
                key === "settlementAccount"
                  ? "Расчётный счёт должен содержать 20 цифр"
                  : "Корр. счёт должен содержать 20 цифр",
            },
            { status: 400 },
          );
        }
        values[key] = digits;
      }
    }
    if (values.legalName !== undefined && values.legalName.length < 5) {
      return Response.json(
        { ok: false, error: "Укажите полное наименование ИП" },
        { status: 400 },
      );
    }

    const merchant = await updateMerchant(values);
    return Response.json({ ok: true, merchant });
  } catch {
    return Response.json(
      { ok: false, error: "Не удалось сохранить реквизиты" },
      { status: 500 },
    );
  }
}
