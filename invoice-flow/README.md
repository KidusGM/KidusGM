# InvoiceFlow

InvoiceFlow is an invoice and billing management system developed as a final capstone project for the IBT College CodeOps Full Stack Software Development program.

## Live Application

https://invoice-flow-inky.vercel.app

## Overview

InvoiceFlow helps businesses manage customers, products, invoices, payments, expenses, and financial reports from one application. Users can create and manage customer records, maintain products and categories, create sales invoices and credit/debit notes, record payments, track outstanding balances, manage expenses, and review financial summaries.

The application includes authentication through Supabase Auth with Admin and Staff roles. Private routes are protected, while administrative features such as Settings are restricted to Admin users.

Business records are currently stored locally in the browser using IndexedDB. Authentication and user roles are handled through Supabase. This architecture keeps the current capstone lightweight while leaving a clear path for future migration to an ASP.NET Core backend with PostgreSQL or SQL Server.

## Main Features

- Customer management
- Product and category management
- Invoice creation and editing
- Sales invoices, credit notes, and debit notes
- Payment recording and receipts
- Expense management
- Financial and customer reports
- Admin and Staff roles
- Protected routes and server-side authorization checks
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