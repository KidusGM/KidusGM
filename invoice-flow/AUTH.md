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

InvoiceFlow uses role-based authorization with three roles and permission-based access:

### Admin

Admins have access to all application modules and administrative features:

- Dashboard
- Customers
- Products
- Invoices
- Payments
- Expenses
- Reports
- Settings
- User management
- Role and permission management

### Cashier

Cashiers can access the modules assigned to their role, including:

- Dashboard
- Customers
- Invoices
- Payments
- Reports

Cashiers cannot access restricted modules such as Products, Expenses, or Settings unless those permissions are explicitly assigned.

### Accountant

Accountants can access the modules assigned to their role, including accounting and financial functionality.

Access is controlled through the permission system rather than simply relying on the navigation menu.

User roles and permissions are stored in Supabase.

The profile contains:

- `id`
- `full_name`
- `role`
- `created_at`

The supported roles are:

- `admin`
- `cashier`
- `accountant`

Application permissions include:

- `dashboard`
- `customers`
- `products`
- `invoices`
- `payments`
- `expenses`
- `reports`
- `settings`

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
supabase.auth.getUser();
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
current.profile?.role !== "admin";
```

If the role is not `admin`, the action is rejected with:

```ts
throw new Error("Forbidden");
```

### Layer 3: Permission-based user interface

`src/components/layout/Sidebar.tsx`

The sidebar reads the authenticated user's permissions and displays only the navigation items available to that user.

This controls the user interface experience, but it is not treated as the primary security boundary. Protected server-side actions remain responsible for authorization.

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

### Attack 2: Non-admin user attempts an administrator action

**Test:**

A non-admin account sent a POST request to:

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

The user is authenticated, but does not have the `admin` role, so the action is refused.

---

### Attack 3: Admin performs an administrator action

**Test:**

An authenticated administrator sent a POST request to:

`/api/auth-test`

**Expected result:**

```text
200 OK
```

**Actual result:**

```text
200 OK
```

The administrator is authenticated and has the required `admin` role.

---

### Attack 4: Unsafe external redirect

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
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
```

Only internal paths beginning with `/` are accepted. External URLs such as `https://example.com` are rejected and replaced with `/`.

This prevents an open-redirect attack.

## Direct URL Authorization Test

A non-admin user attempted to access:

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

Therefore, removing the Settings link from a user's sidebar is only a usability feature. Direct URL access is still protected by server-side authorization.

## Security Test Summary

| Security Test                        | Expected        | Actual        | Result |
| ------------------------------------ | --------------- | ------------- | ------ |
| Signed-out protected action          | 401             | 401           | PASS   |
| Non-admin performs admin action      | 403             | 403           | PASS   |
| Admin performs admin action          | 200             | 200           | PASS   |
| Unsafe external `next` URL           | Stay inside app | `/`           | PASS   |
| Non-admin directly opens `/settings` | Access denied   | Access denied | PASS   |

## Security Design Decision

InvoiceFlow does not rely on client-side navigation or hidden buttons as its primary security mechanism.

The security boundary is enforced through:

1. Supabase authentication
2. Route protection in `src/proxy.ts`
3. Server-side authorization checks
4. Database-backed user roles and permissions in Supabase

The sidebar reflects the user's permissions in the interface, while protected server-side actions provide the actual authorization boundary.
