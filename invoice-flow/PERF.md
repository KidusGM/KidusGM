# InvoiceFlow Performance

## Performance Goals

InvoiceFlow uses the following performance targets for the capstone deployment:

| Metric | Target | Measured | Status |
|---|---:|---:|---|
| LCP | < 2.5s | 2.3s | Pass |
| CLS | < 0.1 | 0 | Pass |
| INP | < 200ms | Not reported by Lighthouse run | Not measured |

## Performance Approach

The application was developed with the following performance considerations.

### Server and Client Components

InvoiceFlow uses the Next.js App Router.

Pages that require browser APIs or interactive state use Client Components, while authentication and authorization checks can run on the server.

Examples include:

- Customer, invoice, payment, and expense interfaces use client-side state because they interact with IndexedDB.
- Server-side authentication helpers use Supabase server clients.
- Client-side behavior is limited to pages and components that require browser interaction.

### Browser Storage

Business data currently uses IndexedDB rather than repeatedly requesting records from a remote business-data API.

This reduces network dependency for the current capstone architecture and allows the core business workflows to operate without a separate backend.

### Images

The application avoids unnecessary large images.

Any images added to the application should remain reasonably small and optimized where practical.

### Accessibility

The interface was developed with:

- Semantic headings
- Form labels
- Keyboard-accessible controls
- Visible focus states
- Error messages
- Empty states
- Descriptive button labels

Keyboard navigation was considered during interface development, although a complete dedicated keyboard-only accessibility audit remains future work.

## Changes Made During Development

| Change | Reason | Expected impact |
|---|---|---|
| Used Next.js App Router | Provides modern routing and server/client component separation | Reduces unnecessary client-side behavior |
| Used IndexedDB for current business data | Avoids unnecessary network requests for business records | Reduces network dependency |
| Kept interactive pages as Client Components only where needed | Browser storage and form interactions require client-side APIs | Avoids unnecessary client/server complexity |
| Added authentication at the route/server level | Protects private application areas | Prevents unauthorized application access |
| Added role-based server authorization | Protects administrator actions | Prevents unauthorized administrative operations |

## Production Measurement

The deployed InvoiceFlow application was tested using Chrome Lighthouse 13.4.1.

The measurement was performed in a Chrome Incognito session using:

- Mobile emulation: Moto G Power
- Network: Slow 4G throttling
- Browser: Chromium 154
- Lighthouse: 13.4.1
- Test type: Initial page load

### Measured Results

| Metric | Result | Target | Status |
|---|---:|---:|---|
| First Contentful Paint | 0.9s | — | Good |
| Largest Contentful Paint | 2.3s | < 2.5s | Pass |
| Total Blocking Time | 390ms | — | Observation |
| Cumulative Layout Shift | 0 | < 0.1 | Pass |
| Speed Index | 1.5s | — | Good |
| Interaction to Next Paint | Not reported | < 200ms | Not measured |

The Lighthouse audit also identified several optimization opportunities:

- Approximately 43 KiB of estimated unused JavaScript
- Approximately 14 KiB of estimated legacy JavaScript savings
- 7 long main-thread tasks

These were recorded as optimization opportunities rather than blocking issues for the capstone release.

## Measurement Process

1. Build the application using the production build.
2. Deploy the application to Vercel.
3. Open the deployed application in a clean browser session.
4. Run a Lighthouse performance audit.
5. Record the production performance measurements.
6. Compare the measured values against the performance targets.
7. Record the final results in this document.

## Final Performance Checklist

- [x] Production build succeeds
- [x] LCP below 2.5 seconds
- [x] CLS below 0.1
- [ ] INP below 200 milliseconds
- [ ] Dedicated keyboard-only accessibility audit completed
- [ ] Real phone usability tested
- [ ] Images checked for unnecessary large files
- [ ] Client-side bundle checked for accidentally exposed secrets
- [x] Final LCP and CLS measurements recorded from the deployed application

## Performance Limitations

The current application stores business data in browser-local IndexedDB.

Because of this architecture, performance measurements primarily represent the client application and initial page load rather than a complete production API and database environment.

A future ASP.NET Core backend with PostgreSQL or SQL Server should be performance-tested separately for:

- API response times
- Database query performance
- Concurrent users
- Server-side caching
- Large business datasets
- Authentication and authorization overhead
- Multi-user workloads