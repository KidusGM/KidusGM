import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, name")
      .order("name");

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const { data: permissions, error: permissionsError } = await supabase
      .from("permissions")
      .select("id, name")
      .order("name");

    if (permissionsError) {
      return NextResponse.json(
        { error: permissionsError.message },
        { status: 500 },
      );
    }

    const { data: rolePermissions, error: rolePermissionsError } =
      await supabase.from("role_permissions").select("role_id, permission_id");

    if (rolePermissionsError) {
      return NextResponse.json(
        { error: rolePermissionsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      roles: roles ?? [],
      permissions: permissions ?? [],
      rolePermissions: rolePermissions ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load roles and permissions." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const roleId = body.roleId;
    const permissionIds = body.permissionIds;

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "Invalid role or permissions." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (permissionIds.length > 0) {
      const rows = permissionIds.map((permissionId: string) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      const { error: insertError } = await supabase
        .from("role_permissions")
        .insert(rows);

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      message: "Permissions saved successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save permissions." },
      { status: 500 },
    );
  }
}
