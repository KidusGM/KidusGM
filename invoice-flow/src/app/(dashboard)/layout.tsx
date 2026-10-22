"use client";

import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="border-b bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {mobileMenuOpen ? "Close Menu" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="border-b bg-white md:hidden">
            <Sidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
