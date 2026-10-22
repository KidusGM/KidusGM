import { requireAdmin } from "../../../lib/storage/supabase/auth";

export default async function SettingsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return (
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-red-200 bg-white p-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Access Denied
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                You do not have permission to access this page.
              </p>

              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Administrator access is required.
                </p>
              </div>

              <a
                href="/"
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </main>
      );
    }

    throw error;
  }

  const sections = [
    {
      title: "Users",
      description: "Create and manage system user accounts.",
      href: "/settings/users",
    },
    {
      title: "Roles & Permissions",
      description: "Create roles and control what each role can access.",
      href: "/settings/roles",
    },
    {
      title: "Company Profile",
      description: "Manage company name, TIN, address, phone and email.",
      href: "/settings/company",
    },
    {
      title: "Invoice Settings",
      description: "Configure invoice numbering, tax and payment terms.",
      href: "/settings/invoices",
    },
    {
      title: "System",
      description: "Manage application and data-related settings.",
      href: "/settings/system",
    },
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage InvoiceFlow users, permissions and system settings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <a
              key={section.title}
              href={section.href}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.description}
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-slate-900">
                Manage →
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
