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
    .select("id, full_name, role")
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

  if (current.profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return current;
}