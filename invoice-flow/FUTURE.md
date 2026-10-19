# InvoiceFlow Future Work

InvoiceFlow was intentionally scoped to prioritize a complete and demonstrable invoice and billing workflow within the capstone deadline.

The following features were considered but intentionally deferred:

## Backend API and Central Database

Business data currently uses IndexedDB in the browser. A future version will move business data to an ASP.NET Core Web API with PostgreSQL or SQL Server.

This was deferred to keep the capstone focused and avoid introducing unnecessary backend complexity before the required functionality was complete.

## Multi-User Business Data Isolation

The current capstone uses browser-local business data. A production version will associate every business record with an authenticated user or organization and enforce ownership at the API and database level.

This is necessary for true multi-user operation.

## Advanced User Management

The current system supports Admin and Staff roles. A future version could provide an Admin interface for creating users, assigning roles, disabling accounts, and managing permissions.

This was deferred because the core role-based authorization requirements were already implemented.

## Automated Invoice Delivery

Future versions could send invoices and payment receipts by email or other supported communication channels.

This was deferred because external messaging infrastructure was outside the core capstone scope.

## Advanced Reporting and Analytics

Future reporting could include dashboards with charts, sales trends, customer profitability, tax analysis, and exportable reports.

The current version focuses on the financial summaries and histories required for the capstone.

## Automated Backups and Audit Logs

A backend-based version should provide automated database backups and detailed audit logs for important actions such as invoice changes, payments, and administrative operations.

These features were deferred because the current business data is stored locally in IndexedDB.

## Mobile Application

A dedicated mobile application could provide mobile-first access for sales staff and business users.

This was intentionally excluded from the capstone so development could remain focused on the responsive web application.

## Summary

These features were deferred rather than abandoned. The current architecture provides a foundation for migrating business data to a centralized ASP.NET Core backend and expanding InvoiceFlow into a production-ready multi-user system.
