# InvoiceFlow

InvoiceFlow is an invoice and billing management system developed as a final capstone project for the IBT College CodeOps Full Stack Software Development program.

## Live Application

https://invoice-flow-inky.vercel.app

## Overview

InvoiceFlow helps businesses manage customers, products, invoices, payments, expenses, and financial reports from one application.

Users can create and manage customer records, maintain products and categories, create sales invoices and credit/debit notes, record payments and receipts, track outstanding balances, manage expenses, and review financial summaries.

The application includes authentication through Supabase Auth with role-based permissions for Admin, Cashier, and Accountant users. Private routes and administrative features are protected based on user permissions.

Business records are currently stored locally in the browser using IndexedDB. Authentication, user accounts, roles, and permissions are handled through Supabase. This architecture keeps the current capstone lightweight while leaving a clear path for future migration to an ASP.NET Core backend with PostgreSQL or SQL Server.

## Main Features

- Customer management
- Customer search and customer codes
- Product and category management
- Invoice creation and editing
- Sales invoices, credit notes, and debit notes
- Invoice workflow from draft to submitted, approved, and issued
- Invoice cancellation with payment protection
- Payment recording and receipts
- Outstanding balance tracking
- Expense management
- Financial and customer reports
- Dashboard financial summaries
- Admin, Cashier, and Accountant roles
- Role-based permissions
- Protected routes and server-side authorization checks
- Responsive desktop and mobile navigation
- Responsive dashboard interface

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- IndexedDB
- Vercel

## Local Development

Clone the repository and enter the project directory:

```bash
cd invoice-flow
npm install
npm run dev
```

Then open the local development URL shown in the terminal.

## Data Storage

InvoiceFlow currently uses two different storage layers:

- **Supabase**: Authentication, users, roles, and permissions.
- **IndexedDB**: Customers, products, categories, invoices, payments, and expenses.

Because business data is stored locally in IndexedDB, data created in one browser/device is not automatically available on another browser/device.

## Project Status

InvoiceFlow is a completed capstone application with the core invoicing, payment, reporting, authentication, authorization, and dashboard functionality implemented.

The project is intentionally structured so that the business data layer can be migrated to a server-side API and database in a future version.

## Future Direction

Potential future improvements include:

- ASP.NET Core Web API backend
- PostgreSQL or SQL Server database
- Server-side business data storage
- Multi-user synchronization
- Advanced accounting features
- Automated backups
- More detailed audit logging
- Additional reporting and analytics
