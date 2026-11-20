"use client";

import { SessionProvider } from "next-auth/react";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "next-themes";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
      <WishlistProvider>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </WishlistProvider>
    </SessionProvider>
  );
}

