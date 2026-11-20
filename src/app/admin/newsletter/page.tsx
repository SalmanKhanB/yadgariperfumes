import { getNewsletterSubscribers } from "@/server/actions/newsletter";
import NewsletterAdminClient from "./NewsletterAdminClient";

export const metadata = {
  title: "Newsletter Admin | Storefront",
};

export default async function NewsletterAdminPage() {
  const result = await getNewsletterSubscribers();
  const subscribers = result.success ? result.subscribers : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and export your newsletter subscribers.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <NewsletterAdminClient initialSubscribers={subscribers} />
      </div>
    </div>
  );
}
