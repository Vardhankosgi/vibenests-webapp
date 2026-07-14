# Implementation Plan - Premium Invoice Generation

This plan outlines the enhancements to `pdfGenerator.ts` and `UserDashboardPage.tsx` to generate highly readable, well-formatted, and premium-looking PDF invoices and transaction receipts.

## Key Goals
1. **Design Excellence**: Style invoices using a professional gold-theme brand system matching VibeNests, including the logo header and copyright footer.
2. **Details Richness**: Incorporate all customer details (name, email, phone, creation date), suite details (suite name, location, guest count), and booking details (stay dates, check-in time).
3. **Smart Payments Split**: Properly analyze booking payment mode, advance paid, full payment status, and show:
   - Full grand total if fully paid.
   - Advance paid, remaining balance, and total if advance payment mode is active.
4. **Resiliency**: Provide asynchronous asset loading for the VibeNests logo with safe fallbacks.

---

## Proposed Changes

### VibeNests Frontend (webapp)

#### [MODIFY] [pdfGenerator.ts](file:///c:/Users/veera/Desktop/vibenest/vibe-frontend/vibenests-webapp/src/lib/pdfGenerator.ts)
- Implement `getLogoImage()` helper to safely load the `/logo.png` image with a 1-second timeout fallback.
- Revamp `generateBookingInvoicePDF` to:
  - Render VibeNests brand header: logo image, gold text, subtitle.
  - Draw customer details card and reservation details card side-by-side using rounded rectangle containers.
  - Render an items table containing the base suite reservation and a list of all selected addons.
  - Display a clean summary card of payments showing: Subtotal, Savings/Discounts, Taxes, Grand Total, Amount Paid, and Remaining Balance if not fully paid.
  - Render a brand copyright footer at the bottom of the page.
- Revamp `generateTransactionInvoicePDF` to:
  - Use the identical premium logo header.
  - Display customer details and transaction info (method, category, date).
  - Fetch and show booking details (suite name, check-in, guests) if the transaction is associated with a booking.
  - Render transaction breakdown (paid amount, total booking cost, remaining balance if applicable).
  - Add copyright footer.

#### [MODIFY] [UserDashboardPage.tsx](file:///c:/Users/veera/Desktop/vibenest/vibe-frontend/vibenests-webapp/src/pages/UserDashboardPage.tsx)
- Expose the user auth state inside `BookingDetailsDrawer` and `TransactionModal`.
- Bind `booking` to each transaction item in the list mapping.
- Update invoice generation trigger functions to pass the authenticated user and detail objects:
  - In `BookingDetailsDrawer`: Pass `details || booking`, `user`, and addon list.
  - In `TransactionModal`: Pass `txn` (with `txn.booking`) and `user`.

---

## Verification Plan

### Manual Verification
1. Open the user dashboard.
2. Go to **My Bookings** -> Select a booking.
3. Click **Download Invoice PDF** and verify:
   - Header shows logo, "VIBENESTS", and "PRIVATE LUXURY SUITES".
   - Billed to shows name, email, phone.
   - Booking details show suite, location, booked dates, check-in time, and guest count.
   - Items table lists suite and addons cleanly.
   - Payment summary accurately reflects if fully paid or if an advance was paid (showing the remaining balance).
   - Footer contains VibeNests thank you and copyright.
4. Go to **Payments** -> Select a transaction.
5. Click **Download Invoice** and verify the receipt PDF includes the same premium design, customer details, transaction details, and related booking summaries.
