import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import SiteLayoutForm from "@/components/admin/cms/SiteLayoutForm";

export const revalidate = 0; // Ensure admin always gets latest DB settings

export default async function SiteLayoutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Site Layout Configuration</h1>
        <p className="text-muted-foreground">Manage your global layout settings including header, footer, and storefront configuration.</p>
      </div>

      <div className="glass-card border border-border rounded-2xl p-6 shadow-sm">
        <SiteLayoutForm initialSettings={JSON.parse(JSON.stringify(settings))} />
      </div>
    </div>
  );
}
