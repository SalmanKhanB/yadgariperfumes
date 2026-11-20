import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";
import { getOrdersByCustomerId } from "@/server/repositories/userRepository";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import CustomerOrdersView from "./CustomerOrdersView";

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login");

  const isEnvAdmin = session.user.id === "admin-1";
  let orders: any[] = [];

  if (!isEnvAdmin) {
    const rawOrders = await getOrdersByCustomerId(session.user.id);
    orders = JSON.parse(JSON.stringify(rawOrders));
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'My Account', href: '/account' }, { label: 'Order History' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground">
            Order History & Tracking
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Track your orders in real-time, view order details, or initiate cancellations and returns.
          </p>
        </div>

        <CustomerOrdersView initialOrders={orders} />
      </div>
    </div>
  );
}

