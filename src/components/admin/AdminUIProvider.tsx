"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminUIContextType {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AdminUIContext.Provider value={{ isMobileMenuOpen, setMobileMenuOpen }}>
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const context = useContext(AdminUIContext);
  if (context === undefined) {
    throw new Error("useAdminUI must be used within an AdminUIProvider");
  }
  return context;
}
