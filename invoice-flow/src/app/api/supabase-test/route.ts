import { createClient } from "../../../lib/storage/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    connected: !error,
    user: data.user ? data.user.email : null,
    error: error?.message ?? null,
  });
}

