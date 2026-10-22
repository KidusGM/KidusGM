import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function UsersPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, role_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("id, name");

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const roleMap = new Map(
    roles?.map((role) => [role.id, role.name]) ?? [],
  );

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Manage InvoiceFlow user accounts and roles.
            </p>
          </div>

          <Link
            href="/settings/users/create"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Create User
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Full Name
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Role
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Created
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {user.full_name || "Unnamed User"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {roleMap.get(user.role_id) || "No Role"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(
                          user.created_at,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}