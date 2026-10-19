# InvoiceFlow Data Architecture

## Overview

InvoiceFlow currently uses two data systems:

1. **Supabase Authentication** for user authentication and role information.
2. **IndexedDB** in the browser for InvoiceFlow business data.

Business data is intentionally stored locally for the current capstone version. This keeps the application functional without requiring a separate application backend or external business database.

## Data Sources

### Supabase

Supabase is used for:

- User authentication
- User sessions
- User profiles
- User roles

The main profile table is:

```text
public.profiles
```

Important fields include:

- `id`
- `full_name`
- `role`
- `created_at`

The `id` references the corresponding Supabase authentication user.

### IndexedDB

InvoiceFlow business records are stored in the browser using IndexedDB.

The database is defined in:

```text
src/lib/storage/db.ts
```

Database name:

```text
invoice-flow-db
```

Current database version:

```text
2
```

## IndexedDB Stores

The application currently uses these stores:

| Store | Purpose |
|---|---|
| `customers` | Customer and company information |
| `products` | Products and item information |
| `categories` | Product categories |
| `invoices` | Sales invoices, credit notes and debit notes |
| `payments` | Invoice payment records |
| `expenses` | Business expense records |

## Business Data Queries

The application uses the storage functions defined in:

```text
src/lib/storage/db.ts
```

### Customers

Customer pages use:

```ts
getCustomers()
```

for retrieving customers.

Customer creation uses:

```ts
addRecord("customers", data)
```

Customer updates use:

```ts
updateRecord("customers", data)
```

Customer deletion uses:

```ts
deleteRecord("customers", id)
```

Customer codes are generated using:

```ts
generateCustomerCode()
```

Customer searches are performed in the browser using customer name, customer code, TIN and phone number.

### Products

Products are retrieved from IndexedDB using the product storage functions.

Products are created, updated and deleted through IndexedDB operations.

Product identifiers are generated using:

```ts
generateItemId()
```

Duplicate product checks are performed before saving products.

### Invoices

Invoices are retrieved using:

```ts
getInvoices()
```

Invoices are stored in the `invoices` IndexedDB store.

Invoice numbers are generated using:

```ts
generateInvoiceNumber()
```

Invoice records contain their line items, totals, taxes, discounts, payment status and other invoice information.

Draft invoices can be updated before submission.

### Payments

Payments are stored in:

```text
payments
```

Payment records contain:

- Receipt number
- Invoice ID
- Amount
- Payment date
- Payment method
- Notes
- Creation date

Receipt numbers are generated using:

```ts
generatePaymentReceiptNumber()
```

When a payment is recorded, the related invoice is also updated with its new `paidAmount` and payment status.

### Expenses

Expenses are stored in:

```text
expenses
```

The application supports creating, editing and deleting expense records.

Expense records contain:

- Description
- Amount
- Category
- Expense date
- Notes
- Creation date

## Where Queries Run

### Business data

Business-data queries run **in the user's browser**.

The application accesses IndexedDB through:

```text
src/lib/storage/db.ts
```

This means customer, product, invoice, payment and expense data is currently client-side data.

### Authentication data

Authentication and role checks use Supabase.

Browser authentication uses:

```text
src/lib/storage/supabase/client.ts
```

Server-side authentication and authorization use:

```text
src/lib/storage/supabase/server.ts
src/lib/storage/supabase/auth.ts
```

The application uses server-side authorization for protected administrative actions.

## Data Refresh Rules

Because business data is stored in IndexedDB, pages load their data when the page/component mounts.

For example, customer data is loaded through a React effect:

```ts
useEffect(() => {
  getCustomers().then(setCustomers);
}, []);
```

After creating, updating or deleting a record, the affected page refreshes its local React state by retrieving the updated IndexedDB data.

For example, after deleting a customer:

```ts
const updatedCustomers = await getCustomers();
setCustomers(updatedCustomers);
```

This keeps the visible interface synchronized with the browser database.

## Relationships

Business records use IDs to connect related records.

Important relationships include:

```text
Customer
   ↓ customerId
Invoice
   ↓ invoiceId
Payment
```

Invoices contain their own invoice items and reference products using product IDs.

Payments reference the invoice they belong to using:

```text
invoiceId
```

Expenses are independent business records and do not require an invoice relationship.

## Security and Data Access

IndexedDB business data is client-side storage. It should therefore not be treated as a secure multi-user database.

The application's real authentication and authorization boundary is Supabase.

Authentication protects access to the application through `src/proxy.ts`.

Administrative server-side operations use:

```ts
requireUser()
requireAdmin()
```

from:

```text
src/lib/storage/supabase/auth.ts
```

The current capstone intentionally separates authentication from the local business-data prototype.

## Future Data Architecture

A future production version should move business data from IndexedDB into a server-side database accessed through a secure API.

A planned architecture is:

```text
Next.js frontend
       ↓
ASP.NET Core API
       ↓
PostgreSQL / SQL Server
```

This would allow:

- Multi-user business data
- Server-side authorization for individual records
- Centralized backups
- Concurrent access from multiple devices
- Audit history
- Stronger data integrity
- Production-grade reporting

The current IndexedDB architecture was selected for the capstone because it