import { createClient } from "./server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, role_id")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
  };
}

export async function requireUser() {
  const current = await getCurrentUser();

  if (!current) {
    throw new Error("Unauthorized");
  }

  return current;
}

export async function requireAdmin() {
  const current = await requireUser();

  if (current.profile?.role !== "admin" && !current.profile?.role_id) {
    throw new Error("Forbidden");
  }

  return current;
}

export async function hasPermission(permissionName: string) {
  const current = await requireUser();

  if (current.profile?.role === "admin") {
    return true;
  }

  if (!current.profile?.role_id) {
    return false;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("role_permissions")
    .select(
      `
      permission_id,
      permissions!inner (
        name
      )
    `,
    )
    .eq("role_id", current.profile.role_id)
    .eq("permissions.name", permissionName)
    .maybeSingle();

  return !!data;
}

export async function requirePermission(permissionName: string) {
  const allowed = await hasPermission(permissionName);

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return true;
}
