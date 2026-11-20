import { fetchProductsAction } from "@/server/actions/productActions";
import ReorderClient from "./ReorderClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Reorder Products",
  description: "Drag and drop to reorder products globally.",
};

export default async function ReorderProductsPage() {
  const res = await fetchProductsAction({});
  let products = [];
  if (res.success && res.data) {
    products = res.data;
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-black tracking-tight">Reorder Products</h1>
        <p className="text-muted-foreground mt-1">Drag and drop to change the global sorting of your products across the storefront.</p>
      </div>

      <div className="bg-background rounded-xl border border-border shadow-sm p-6">
        <ReorderClient initialProducts={products} />
      </div>
    </div>
  );
}
