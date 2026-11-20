import { Inter } from "next/font/google";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { AdminUIProvider } from "@/components/admin/AdminUIProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";
import { ADMIN_ROLES, AdminRole } from "@/server/auth/adminGuard";

const adminFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-admin",
});

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) { 
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const settings = await getCachedSiteSettings();
  const cleanSettings = JSON.parse(JSON.stringify(settings));

  return (
    <CurrencyProvider currency={cleanSettings.currency || "USD"}>
      <AdminUIProvider>
      <div className={`${adminFont.variable} font-admin flex h-screen w-full bg-background overflow-hidden text-foreground print:h-auto print:overflow-visible print:bg-white print:block`}>
        <div className="print:hidden">
          <AdminSidebar />
        </div>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative print:h-auto print:overflow-visible print:block">
          {/* Optional: Add a subtle ambient glow to admin panel based on primary color */}
          <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent pointer-events-none print:hidden" />
          <div className="relative z-10 flex flex-col h-full print:h-auto print:block">
            <div className="print:hidden">
              <AdminHeader />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:block">
              <div className="max-w-[100rem] mx-auto w-full print:max-w-full print:p-0 print:m-0">
                {children}
              </div>
            </main>
          </div>
        </div>
        <div className="print:hidden">
          <CommandPalette />
        </div>
      </div>
      </AdminUIProvider>
    </CurrencyProvider>
  ); 
}
