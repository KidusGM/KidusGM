"use client";

import { useEffect, useState } from "react";

type Role = {
  id: string;
  name: string;
};

type Permission = {
  id: string;
  name: string;
};

type RolePermission = {
  role_id: string;
  permission_id: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await fetch("/api/settings/roles");

      if (!response.ok) {
        throw new Error("Failed to load roles.");
      }

      const data = await response.json();

      setRoles(data.roles);
      setPermissions(data.permissions);

      const initial = new Set<string>(
        data.rolePermissions.map(
          (item: RolePermission) => `${item.role_id}:${item.permission_id}`,
        ),
      );

      setAssigned(initial);
      setLoading(false);
    }

    loadData();
  }, []);

  function togglePermission(roleId: string, permissionId: string) {
    setAssigned((current) => {
      const next = new Set(current);
      const key = `${roleId}:${permissionId}`;

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  async function saveRolePermissions(roleId: string) {
    const permissionIds = permissions
      .filter((permission) => assigned.has(`${roleId}:${permission.id}`))
      .map((permission) => permission.id);

    const response = await fetch("/api/settings/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId,
        permissionIds,
      }),
    });

    if (!response.ok) {
      alert("Failed to save permissions.");
      return;
    }

    alert("Permissions saved successfully.");
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-600">
            Loading roles and permissions...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage which areas of InvoiceFlow each role can access.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {role.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the permissions for this role.
                </p>
              </div>

              <div className="space-y-3">
                {permissions.map((permission) => {
                  const checked = assigned.has(`${role.id}:${permission.id}`);

                  return (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          togglePermission(role.id, permission.id)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        {permission.name.charAt(0).toUpperCase() +
                          permission.name.slice(1)}
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => saveRolePermissions(role.id)}
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Save Permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
