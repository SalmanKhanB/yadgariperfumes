"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmationRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 3000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="mt-6 rounded-xl bg-foreground px-6 py-3 font-bold text-background"
    >
      Check order status
    </button>
  );
}
