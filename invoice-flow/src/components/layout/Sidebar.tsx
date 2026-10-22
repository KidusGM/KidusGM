"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/storage/supabase/client";

const supabase = createClient();

const navigation = [
  { name: "Dashboard", href: "/", permission: "dashboard" },
  { name: "Customers", href: "/customers", permission: "customers" },
  { name: "Products", href: "/products", permission: "products" },
  { name: "Invoices", href: "/invoices", permission: "invoices" },
  { name: "Payments", href: "/payments", permission: "payments" },
  { name: "Expenses", href: "/expenses", permission: "expenses" },
  { name: "Reports", href: "/reports", permission: "reports" },
  { name: "Settings", href: "/settings", permission: "settings" },
];

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>([]);
  const [roleLoaded, setRoleLoaded] = useState(false);

  async function loadPermissions() {
    setRoleLoaded(false);

    try {
      const response = await fetch("/api/auth/permissions", {
        cache: "no-store",
      });

      if (!response.ok) {
        setAllowedPermissions([]);
        setRoleLoaded(true);
        return;
      }

      const data = await response.json();

      setAllowedPermissions(data.permissions ?? []);
      setRoleLoaded(true);
    } catch (error) {
      console.error("Permission loading error:", error);
      setAllowedPermissions([]);
      setRoleLoaded(true);
    }
  }

  useEffect(() => {
    loadPermissions();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        await loadPermissions();
      }

      if (event === "SIGNED_OUT") {
        setAllowedPermissions([]);
        setRoleLoaded(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  }

  const visibleNavigation = navigation.filter((item) =>
    allowedPermissions.includes(item.permission),
  );

  return (
    <aside
      className={
        mobile
          ? "w-full bg-white"
          : "hidden w-64 shrink-0 border-r bg-white md:block"
      }
    >
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">InvoiceFlow</h1>

        <p className="mt-1 text-sm text-slate-500">Invoice & Billing</p>
      </div>

      <nav className="p-4">
        {!roleLoaded ? (
          <p className="px-4 py-2 text-sm text-slate-500">Loading...</p>
        ) : (
          <ul className="space-y-1">
            {visibleNavigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={onNavigate}
                  className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Sign out
        </button>
      </nav>
    </aside>
  );
}
