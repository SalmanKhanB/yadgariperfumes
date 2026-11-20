import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import SettingsTabsClient from "@/components/admin/SettingsTabsClient";

export const revalidate = 0;

export default async function NavigationSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      <SettingsTabsClient initialSettings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
