NAIL ART — LOCAL TEST CANDIDATE (NOT DEPLOYED)

Basis: NAIL_ART_GITHUB_CANDIDATE_V21_72_LOCAL_ONLY(1).zip
Scope: complete web frontend (INDEX/Booking + ADMIN/DEV) and separate Google Apps Script TEST source.

CHANGES IN THIS CANDIDATE
1. ADMIN/Booking API configuration aligned:
   - both use CRM_TEST_API_STORAGE_KEY = CRM_TEST_APPS_SCRIPT_URL;
   - both use the same default URL already present in Booking source;
   - both migrate the known legacy URL to that default;
   - ?api=... override is persisted to the same key;
   - crmSetTestApiUrl(url) remains available in ADMIN.
2. Booking source is preserved byte-for-byte from the V21.72 candidate.
3. ADMIN calendar synchronization backend is supplied as Google Apps Script V4.7.51, alongside V4.7.50 baseline.

IMPORTANT BACKEND NOTES
- V4.7.51 is a prepared TEST patch based on V4.7.50, not a deployment.
- It adds a daily WIFE_CALENDAR import trigger for NEW SourceId entries only.
- The wife's source calendar remains READ_ONLY.
- This patch does NOT reconcile already-imported event changes or cancellations; this remains an open backend task.
- Do not install the trigger until the actual TEST project, Spreadsheet ID and schedule folder IDs are confirmed in Apps Script.
- The endpoint copied from Booking is the existing configured default, but its current deployment/active version was NOT verified in this build.

ARCHITECTURE
- ADMIN owns schedule/calendar synchronization and CRM management.
- INDEX/Booking reads availability/settings and submits reservations through the same backend/database.
- Booksy Worker remains a separate project; it is not merged into the main ADMIN Google Apps Script.

SAFETY
- Local candidate only. No Google Drive write, Apps Script save/deployment, trigger installation, GitHub commit/push, branch update, hosting or production change was performed.
- Original uploaded archives and baseline files were not modified.

NEXT REQUIRED VALIDATION
1. Confirm the actual deployed TEST Web App URL and version in Apps Script Deployments.
2. Confirm Spreadsheet ID and schedule folder ID match the intended TEST resources.
3. Deploy V4.7.51 only after the above confirmation; install exactly one daily trigger only with explicit approval.
4. Run CRM Test Full and Booking reservation smoke tests against the same endpoint.
5. Add safe upsert/reconciliation for existing WIFE events and cancellations before treating calendar sync as complete.
