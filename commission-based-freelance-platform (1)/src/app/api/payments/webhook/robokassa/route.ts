import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyRobokassaResult } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * ResultURL Robokassa. Принимает POST (form-data) или GET (query).
 * В ответ нужно отдать "OK<InvId>".
 */
async function handle(params: URLSearchParams) {
  const outSum = params.get("OutSum") ?? "";
  const invId = params.get("InvId") ?? "";
  const signature = params.get("SignatureValue") ?? "";

  if (!verifyRobokassaResult(outSum, invId, signature)) {
    return new Response("bad sign", { status: 403 });
  }

  const localId = Number(invId);
  if (Number.isFinite(localId) && localId > 0) {
    await db
      .update(payments)
      .set({ status: "succeeded", paidAt: new Date() })
      .where(eq(payments.id, localId));
  }

  return new Response(`OK${invId}`, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const params = new URLSearchParams();
    form.forEach((value, key) => params.set(key, String(value)));
    return handle(params);
  } catch {
    return new Response("error", { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(new URL(request.url).searchParams);
}
