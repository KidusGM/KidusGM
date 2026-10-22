import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isSignInPage = pathname === "/signin";
  const isAuthTestApi = pathname === "/api/auth-test";

  if (!user && !isSignInPage && !isAuthTestApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  if (user && isSignInPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (user) {
    let requiredPermission: string | null = null;

    if (pathname === "/") {
      requiredPermission = "dashboard";
    } else if (
      pathname === "/customers" ||
      pathname.startsWith("/customers/")
    ) {
      requiredPermission = "customers";
    } else if (pathname === "/products" || pathname.startsWith("/products/")) {
      requiredPermission = "products";
    } else if (pathname === "/invoices" || pathname.startsWith("/invoices/")) {
      requiredPermission = "invoices";
    } else if (pathname === "/payments" || pathname.startsWith("/payments/")) {
      requiredPermission = "payments";
    } else if (pathname === "/expenses" || pathname.startsWith("/expenses/")) {
      requiredPermission = "expenses";
    } else if (pathname === "/reports" || pathname.startsWith("/reports/")) {
      requiredPermission = "reports";
    } else if (pathname === "/settings" || pathname.startsWith("/settings/")) {
      requiredPermission = "settings";
    }

    if (requiredPermission) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("role, role_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (profile.role !== "admin") {
        if (!profile.role_id) {
          return new NextResponse("Forbidden", { status: 403 });
        }

        const { data: rolePermissions, error: rolePermissionsError } =
          await admin
            .from("role_permissions")
            .select("permission_id")
            .eq("role_id", profile.role_id);

        if (rolePermissionsError) {
          return new NextResponse("Forbidden", { status: 403 });
        }

        const permissionIds =
          rolePermissions?.map((item) => item.permission_id) ?? [];

        if (permissionIds.length === 0) {
          return new NextResponse("Forbidden", { status: 403 });
        }

        const { data: permissions, error: permissionsError } = await admin
          .from("permissions")
          .select("name")
          .in("id", permissionIds);

        if (permissionsError) {
          return new NextResponse("Forbidden", { status: 403 });
        }

        const hasPermission = permissions?.some(
          (permission) => permission.name === requiredPermission,
        );

        if (!hasPermission) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/supabase-test).*)"],
};
