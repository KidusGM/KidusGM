# InvoiceFlow Performance

## Performance Goals

InvoiceFlow uses the following performance targets for the production deployment:

| Metric | Target | Measured | Status |
|---|---:|---:|---|
| LCP | < 2.5s | Pending production measurement | Pending |
| CLS | < 0.1 | Pending production measurement | Pending |
| INP | < 200ms | Pending production measurement | Pending |

These targets are based on the capstone performance requirements.

## Performance Approach

The application was developed with the following performance considerations:

### Server and Client Components

InvoiceFlow uses the Next.js App Router.

Pages that require browser APIs or interactive state use Client Components, while authentication and authorization checks can run on the server.

For example:

- Customer, invoice, payment and expense interfaces use client-side state because they interact with IndexedDB.
- Server-side authentication helpers use Supabase server clients.
- The application avoids adding unnecessary client-side behavior to pages that do not require it.

### Browser Storage

Business data currently uses IndexedDB rather than repeatedly requesting the same records from a remote API.

This reduces network requests for the current capstone architecture and allows the application to continue working without a separate business-data backend.

### Images

The application avoids unnecessary large images.

Any images added to the application should remain approximately below the capstone target of 150 KB where practical.

### Accessibility

The interface was designed with:

- Semantic headings
- Form labels
- Keyboard-accessible controls
- Visible focus states
- Error messages
- Empty states
- Descriptive button labels

The application should remain usable with keyboard-only navigation.

## Changes Made During Development

| Change | Reason | Expected impact |
|---|---|---|
| Used Next.js App Router | Provides server/client component separation and modern routing | Reduces unnecessary client-side JavaScript |
| Used IndexedDB for current business data | Avoids unnecessary API requests for the capstone | Reduces network dependency |
| Kept interactive pages as Client Components only where needed | Browser storage and form interactions require client-side APIs | Avoids unnecessary server/client complexity |
| Added authentication at the route/server level | Protects private application areas | Prevents unauthorized application access |
| Added role-based server authorization | Protects administrator actions | Prevents unauthorized administrative operations |

## Production Measurement

The final LCP, CLS and INP values must be measured against the deployed production URL rather than the development server.

The final values will be added after production deployment.

### Measurement process

1. Build the application using the production build.
2. Deploy the application.
3. Open the deployed URL in a production browser session.
4. Run a Lighthouse or equivalent performance audit.
5. Record LCP, CLS and INP.
6. Compare the measured values against the targets above.
7. Update this document with the actual measurements before the final submission.

## Final Performance Checklist

- [ ] Production build succeeds
- [ ] LCP below 2.5 seconds
- [ ] CLS below 0.1
- [ ] INP below 200 milliseconds
- [ ] Keyboard-only navigation tested
- [ ] Real phone usability tested
- [ ] Images checked for unnecessary large files
- [ ] No unnecessary secrets included in the client bundle
- [ ] Final measurements recorded from the deployed application