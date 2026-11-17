NAIL ART — TEST SITE V21.72 (EXISTING ADMIN BACKEND, NO GAS CHANGE)

Purpose: full static site package for TEST/DEV upload. Includes public INDEX/Booking and ADMIN/DEV frontend.

BACKEND DECISION (17.11.2026)
- Keep the existing Google Apps Script project “Nail-Art ADMIN Script”.
- Keep the existing deployment “qa” (version 215, 14.11.2026) and its /exec URL.
- This package aligns ADMIN and INDEX to that same existing qa URL.
- No .gs source is included in this website ZIP. No Apps Script code, deployment, trigger, calendar sync, spreadsheet or Drive data is changed by this package.
- The older Booking URL is not used as the default. If that old Booking URL is already stored in localStorage, both frontends migrate it to qa. Both frontends share CRM_TEST_APPS_SCRIPT_URL.

TEST ORDER
1. Upload/replace the website files in TEST/DEV as instructed; do not deploy production.
2. Open ADMIN and confirm it loads using the existing qa backend.
3. Confirm INDEX uses the same /exec endpoint.
4. Run CRM Test Light first (read-only/UI-focused).
5. Run CRM Test Full only after Light passes. Full creates CRM_E2E_* test records/bookings and exercises CRM calendar operations; it has a finally cleanup and checks for zero leftovers. It does not import/synchronize the wife’s source calendar. Do not enable wife-calendar synchronization during this test stage.
6. Test one INDEX booking manually with a clearly marked test identity only after CRM Test Full passes. Verify it appears in ADMIN/TEST DB; remove only the marked test booking through the approved test cleanup process.

CAUTION
- Full test is not read-only: it writes marked TEST records and creates/removes test calendar events in the salon CRM calendar. Do not run it against production.
- The existing qa deployment’s target TEST spreadsheet and permissions must remain the ones already configured.
- ZIP upload is not a deployment of Google Apps Script.
