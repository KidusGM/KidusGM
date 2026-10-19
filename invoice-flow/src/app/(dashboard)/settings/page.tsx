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

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

          <p className="mt-2 text-sm text-slate-500">
            Administrative settings are available only to authorized
            administrators.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">
              Admin access confirmed.
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              You have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
