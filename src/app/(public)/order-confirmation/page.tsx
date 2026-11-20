import { getOrderByStripeSession } from "@/server/repositories/orderRepository";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderConfirmationRootPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  if (typeof sessionId === "string" && sessionId) {
    const order = await getOrderByStripeSession(sessionId);
    if (order) {
      redirect(`/order-confirmation/${order._id}`);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-32 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-black tracking-tight">Order confirmation unavailable</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Use your order number and checkout email to look up an existing order.
      </p>
      <Link href="/track-order" className="mt-6 rounded-xl bg-foreground px-6 py-3 font-bold text-background">
        Track an order
      </Link>
    </div>
  );
}
