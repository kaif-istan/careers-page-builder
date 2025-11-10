# AGENT_LOG.md

- Used ChatGPT to generate `supabase.ts` client pattern → accepted as-is
- Asked for API route test → modified error handling
- Requested seed script → added `tsx` and logging
- Login page → rewrote UI with Tailwind, added company fetch

- Noticed mismatch between initial schema and Google Sheet
- Asked AI to update `jobs` table → accepted new fields: work_policy, job_slug, etc.
- Requested seed script → manually adjusted `job_slug` and `posted_days_ago`
- Overruled AI on `is_active` → replaced with `posted_days_ago` for realism

- Searched "Supabase Failed to delete selected users: Database error loading user" → Found AnswerOverflow threads: Orphaned users missing auth.identities row.
- AI suggested SQL cleanup → Added identities delete + empty string tokens for confirmation.
- Overruled Dashboard delete → Direct SQL bypasses the UI bug.
- Confirmed via docs: Identities table required for email provider linking. 

- Used AI to generate full edit page with dnd-kit → accepted 90%
- Overruled AI on form sync → used setValue() after load
- Added debounce for all inputs → smooth UX
- Used ShadCN components → accessible + fast
- Added Grip icon → clear drag affordance

- Error: "params is a Promise" in client component
- Searched Next.js docs → Found: https://nextjs.org/docs/messages/sync-dynamic-apis
- AI suggested `await params` → WRONG in client
- Overruled → Used `use(params)` from React
- Confirmed: Only needed in client components with dynamic routes

- Preview was live — violated "preview before publish"
- Fixed: Local state in edit → preview via localStorage + /api/preview
- /careers only reads from DB
- True preview: changes not live until "Publish"
- Used iframe, server API, localStorage

Fixed infinite loop issues
Removed circular dependencies:
Removed previewCompany, publishedCompany, and debouncedUpdatePreview from the form values effect dependencies
Removed updatePreviewStorage from the sections effect dependencies
Added a change check before updating state
Used refs for stable callbacks:
updatePreviewStorage now only depends on slug (stable)
Uses refs to access the latest values without recreating the callback
Added change detection:
Form values effect only updates if values actually changed
Sections effect uses serialization to detect real changes
Added safety checks:
Early returns if data isn't loaded
Timeouts to ensure state has settled before updating
The infinite loop should be resolved. The preview will still update when you change values, but without causing re-render loops.
Try updating the logo URL again; it should work without the error.