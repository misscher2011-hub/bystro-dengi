import { notFound } from "next/navigation";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import DemoGateway from "@/components/pay/DemoGateway";
import { getMerchant } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export const metadata = { title: "Подтверждение платежа — демо-шлюз" };

export default async function DemoPayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isFinite(paymentId)) notFound();

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId));
  if (!payment) notFound();

  const merchant = await getMerchant();

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <DemoGateway
        payment={{
          id: payment.id,
          amountKop: payment.amountKop,
          description: payment.description,
          provider: payment.provider,
          status: payment.status,
        }}
        recipient={merchant.legalName}
        inn={merchant.inn}
      />
    </div>
  );
}
