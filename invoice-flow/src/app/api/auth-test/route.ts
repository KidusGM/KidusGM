import { requireAdmin } from "../../../lib/storage/supabase/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { user, profile } = await requireAdmin();

    return NextResponse.json({
      success: true,
      message: "Admin action allowed.",
      user: user.email,
      role: profile?.role ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
