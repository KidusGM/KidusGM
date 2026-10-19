# InvoiceFlow Authentication and Authorization

## Authentication

InvoiceFlow uses **Supabase Authentication** with email and password sign-in.

The authentication flow is implemented using:

- `src/lib/storage/supabase/client.ts` for browser-side Supabase access
- `src/lib/storage/supabase/server.ts` for server-side Supabase access
- `src/app/signin/page.tsx` for the sign-in form
- `src/proxy.ts` for protecting application routes

After successful authentication, Supabase maintains the user's session using secure authentication cookies.

## Authorization

InvoiceFlow uses role-based authorization with two roles:

### Admin

Admins can access:

- Dashboard
- Customers
- Products
- Invoices
- Payments
- Expenses
- Reports
- Settings
- Administrative actions

### Staff

Staff can access:

- Dashboard
- Customers
- Products
- Invoices
- Payments
- Expenses
- Reports

Staff cannot access administrator-only Settings or administrator actions.

User roles are stored in the `public.profiles` table in Supabase.

The profile contains:

- `id`
- `full_name`
- `role`
- `created_at`

The allowed roles are `admin` and `staff`.

## Private Routes

Application routes are protected by `src/proxy.ts`.

When a user is not authenticated and attempts to access a private route, the proxy redirects the user to:

`/signin`

The requested internal path is passed through the `next` parameter so the user can return to the requested page after signing in.

The `/signin` page and authentication test endpoint are handled separately by the proxy.

## Authorization Layers

InvoiceFlow uses multiple security layers rather than relying only on hidden navigation links.

### Layer 1: Route protection

`src/proxy.ts`

The proxy checks the Supabase session using:

```ts
supabase.auth.getUser()
```

Unauthenticated users are prevented from accessing private application routes.

### Layer 2: Server-side role authorization

`src/lib/storage/supabase/auth.ts`

The application provides:

- `getCurrentUser()`
- `requireUser()`
- `requireAdmin()`

`requireUser()` rejects requests without an authenticated user.

`requireAdmin()` first requires an authenticated user and then checks:

```ts
current.profile?.role !== "admin"
```

If the role is not `admin`, the action is rejected with:

```ts
throw new Error("Forbidden");
```

### Layer 3: User interface permissions

`src/components/layout/Sidebar.tsx`

The sidebar reads the authenticated user's role from the `profiles` table.

The Settings menu is displayed only when the user has the `admin` role.

This improves user experience, but it is not treated as the security boundary. Server-side authorization remains the actual protection.

## Protected Administrative Action

The endpoint:

`src/app/api/auth-test/route.ts`

uses:

```ts
const { user, profile } = await requireAdmin();
```

This means the endpoint requires both:

1. An authenticated Supabase user
2. An `admin` role

The endpoint returns:

- `200` when an authorized administrator performs the action
- `401` when there is no authenticated user
- `403` when an authenticated user does not have the required role

## Security Attack Tests

### Attack 1: Signed-out user attempts a protected action

**Test:**

A signed-out browser sent a POST request to:

`/api/auth-test`

**Expected result:**

```text
401 Unauthorized
```

**Actual result:**

```text
401 Unauthorized
```

**Security enforcement:**

`requireUser()` in:

`src/lib/storage/supabase/auth.ts`

rejects the request when no authenticated Supabase user exists.

This prevents unauthenticated users from executing the protected administrative action.

---

### Attack 2: Staff user attempts an administrator action

**Test:**

The Staff account `yonig759522@gmail.com` sent a POST request to:

`/api/auth-test`

**Expected result:**

```text
403 Forbidden
```

**Actual result:**

```text
403 Forbidden
```

**Security enforcement:**

`requireAdmin()` in:

`src/lib/storage/supabase/auth.ts`

checks:

```ts
if (current.profile?.role !== "admin") {
  throw new Error("Forbidden");
}
```

The Staff user is authenticated, but does not have the `admin` role, so the action is refused.

---

### Attack 3: Unsafe external redirect

**Test:**

The following URL was used:

```text
/signin?next=https://example.com
```

After successful authentication, the application must not redirect the user to the external website.

**Expected result:**

The user remains inside InvoiceFlow.

**Actual result:**

The user was redirected to:

```text
/
```

**Security enforcement:**

`src/app/signin/page.tsx` validates the `next` parameter:

```ts
const safeNext =
  next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/";
```

Only internal paths beginning with `/` are accepted. External URLs such as `https://example.com` are rejected and replaced with `/`.

This prevents an open-redirect attack.

## Direct URL Authorization Test

A Staff user attempted to access:

```text
/settings
```

directly rather than using the navigation menu.

The request was rejected and the page displayed:

**Access Denied**

The Settings page calls:

```ts
await requireAdmin();
```

Therefore, removing the Settings link from the Staff sidebar is only a usability feature. Direct URL access is still protected by server-side authorization.

## Security Test Summary

| Security Test | Expected | Actual | Result |
|---|---|---|---|
| Signed-out protected action | 401 | 401 | PASS |
| Staff performs admin action | 403 | 403 | PASS |
| Admin performs admin action | 200 | 200 | PASS |
| Unsafe external `next` URL | Stay inside app | `/` | PASS |
| Staff directly opens `/settings` | Access denied | Access denied | PASS |

## Security Design Decision

InvoiceFlow does not rely on client-side navigation or hidden buttons as its primary security mechanism.

The security boundary is enforced server-side through:

1. Supabase authentication
2. Route protection in `src/proxy.ts`
3. Server-side role checks in `requireUser()` and `requireAdmin()`
4. Database-backed user roles in `public.profiles`

The sidebar only reflects the user's permissions in the interface.