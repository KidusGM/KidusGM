import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/storage/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role, role_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 },
      );
    }

    if (profile.role === "admin") {
      return NextResponse.json({
        permissions: [
          "dashboard",
          "customers",
          "products",
          "invoices",
          "payments",
          "expenses",
          "reports",
          "settings",
        ],
      });
    }

    if (!profile.role_id) {
      return NextResponse.json({ permissions: [] });
    }

    const { data: rolePermissions, error: rolePermissionsError } = await admin
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", profile.role_id);

    if (rolePermissionsError) {
      return NextResponse.json(
        { error: rolePermissionsError.message },
        { status: 500 },
      );
    }

    const permissionIds =
      rolePermissions?.map((item) => item.permission_id) ?? [];

    if (permissionIds.length === 0) {
      return NextResponse.json({ permissions: [] });
    }

    const { data: permissions, error: permissionsError } = await admin
      .from("permissions")
      .select("name")
      .in("id", permissionIds);

    if (permissionsError) {
      return NextResponse.json(
        { error: permissionsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      permissions: permissions?.map((permission) => permission.name) ?? [],
    });
  } catch (error) {
    console.error("Permission API error:", error);

    return NextResponse.json(
      { error: "Failed to load permissions." },
      { status: 500 },
    );
  }
}
