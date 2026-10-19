"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/storage/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Customers", href: "/customers" },
  { name: "Products", href: "/products" },
  { name: "Invoices", href: "/invoices" },
  { name: "Payments", href: "/payments" },
  { name: "Expenses", href: "/expenses" },
  { name: "Reports", href: "/reports" },
  { name: "Settings", href: "/settings", adminOnly: true },
];

export default function Sidebar() {
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    async function loadUserRole(userId: string) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      setIsAdmin(profile?.role === "admin");
      setRoleLoaded(true);
    }

    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        setRoleLoaded(true);
        return;
      }

      await loadUserRole(user.id);
    }

    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadUserRole(session.user.id);
      }

      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        setRoleLoaded(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  }

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || (roleLoaded && isAdmin),
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">InvoiceFlow</h1>

        <p className="mt-1 text-sm text-slate-500">Invoice & Billing</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {visibleNavigation.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </nav>
    </aside>
  );
}
