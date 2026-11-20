"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/format";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";

type CurrencyContextType = {
  currency: string;
  formatPrice: (amount: number) => string;
  setCurrency: (currency: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  formatPrice: (amount: number) => formatCurrencyUtil(amount, "USD"),
  setCurrency: () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ 
  children, 
  currency: initialCurrency = "USD" 
}: { 
  children: ReactNode; 
  currency?: string;
}) {
  const [currency, setCurrencyState] = useState<string>(initialCurrency);

  useEffect(() => {
    if (initialCurrency) {
      setCurrencyState(initialCurrency);
    }
  }, [initialCurrency]);

  useEffect(() => {
    // Sync with latest DB currency setting uncached
    async function loadCurrency() {
      const res = await fetchSiteSettingsAction(true);
      if (res.success && res.data?.currency) {
        setCurrencyState(res.data.currency);
      }
    }
    loadCurrency();
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
  };

  const formatPrice = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) return formatCurrencyUtil(0, currency);
    return formatCurrencyUtil(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
