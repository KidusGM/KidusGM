# InvoiceFlow Performance

## Performance Goals

InvoiceFlow uses the following performance targets for the production deployment:

| Metric |  Target |                       Measured | Status       |
| ------ | ------: | -----------------------------: | ------------ |
| LCP    |  < 2.5s |                           2.3s | Pass         |
| CLS    |   < 0.1 |                              0 | Pass         |
| INP    | < 200ms | Not reported by Lighthouse run | Not measured |

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

| Change                                                        | Reason                                                         | Expected impact                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| Used Next.js App Router                                       | Provides server/client component separation and modern routing | Reduces unnecessary client-side JavaScript      |
| Used IndexedDB for current business data                      | Avoids unnecessary API requests for the capstone               | Reduces network dependency                      |
| Kept interactive pages as Client Components only where needed | Browser storage and form interactions require client-side APIs | Avoids unnecessary server/client complexity     |
| Added authentication at the route/server level                | Protects private application areas                             | Prevents unauthorized application access        |
| Added role-based server authorization                         | Protects administrator actions                                 | Prevents unauthorized administrative operations |

## Production Measurement

The production application was tested using Chrome Lighthouse 13.4.1 against the deployed InvoiceFlow application.

The clean measurement was performed in a Chrome Incognito session using:

- Mobile emulation: Moto G Power
- Network: Slow 4G throttling
- Browser: Chromium 154
- Lighthouse: 13.4.1
- Test type: Initial page load

### Measured Results

| Metric                    |       Result |  Target | Status       |
| ------------------------- | -----------: | ------: | ------------ |
| First Contentful Paint    |         0.9s |       — | Good         |
| Largest Contentful Paint  |         2.3s |  < 2.5s | Pass         |
| Total Blocking Time       |        390ms |       — | Observation  |
| Cumulative Layout Shift   |            0 |   < 0.1 | Pass         |
| Speed Index               |         1.5s |       — | Good         |
| Interaction to Next Paint | Not reported | < 200ms | Not measured |

The Lighthouse audit also identified several optimization opportunities:

- Approximately 43 KiB of estimated unused JavaScript.
- Approximately 14 KiB of estimated legacy JavaScript savings.
- 7 long main-thread tasks.

These were recorded as optimization opportunities rather than blocking issues for the capstone release.

### Measurement Process

1. Build the application using the production build.
2. Deploy the application to Vercel.
3. Open the deployed URL in a clean browser session.
4. Run a Lighthouse performance audit.
5. Record the production performance measurements.
6. Compare the measured values against the required targets.
7. Record the final results in this document.

## Final Performance Checklist

- [x] Production build succeeds
- [x] LCP below 2.5 seconds
- [x] CLS below 0.1
- [ ] INP below 200 milliseconds
- [ ] Keyboard-only navigation tested
- [ ] Real phone usability tested
- [ ] Images checked for unnecessary large files
- [ ] No unnecessary secrets included in the client bundle
- [x] Final LCP and CLS measurements recorded from the deployed application
