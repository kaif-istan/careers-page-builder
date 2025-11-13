# AGENT_LOG.md

- Asked chatGPT for system design idea.
- Compared and contrasted different approach.
- Requested seed script → added `tsx` and logging
- Asked cursor for login page UI rewrite, then rewrote UI with Tailwind.
- Noticed mismatch between initial schema and Google Sheet
- Asked chatGPT to update `jobs` table -> accepted new fields: work_policy, job_slug, etc.
- Requested seed script based on jobs data given in Google sheet -> manually adjusted `job_slug` and `posted_days_ago`
- Overruled AI on `is_active` -> replaced with `posted_days_ago` for realism
- Searched "Supabase Failed to delete selected users: Database error loading user" → Found AnswerOverflow threads: Orphaned users missing auth.identities row.
- AI suggested SQL cleanup -> Added identities delete + empty string tokens for confirmation.
- Overruled Dashboard delete → Direct SQL bypasses the UI bug.
- Read supabase docs -> Identities table required for email provider linking.
- Used AI to generate full edit page with dnd-kit → accepted 90% of the code. Manually corrected logic error.
- Overruled cursor on form sync -> used setValue() after load.
- Added debounce for all inputs for better user experience.
- Used shadCN components for neat and fast UI.
- Added Grip component for clear drag affordance.

- Error: "params is a Promise" in client component.
- Searched Next.js docs → Found: https://nextjs.org/docs/messages/sync-dynamic-apis
- AI generated code suggested `await params` which was wrong in client.
- Overruled --> Used `use(params)` hook from React.
- Confirmed by chatGPT: Only needed in client components with dynamic routes

- AI generated code resulted in live preview which violated "preview before publish".
- Fixed: Local state in edit -> preview via localStorage.
- Only /careers reads from DB.
- True preview: changes not live until "Publish" is clicked.
- Used iframe, server API, localStorage

- Fixed infinite loop issues
- Removed circular dependencies:
- Overruled AI -> removed previewCompany, publishedCompany, and debouncedUpdatePreview from the form values effect dependencies
- Removed updatePreviewStorage from the sections effect dependencies
- Added a change check before updating state
- Used refs for stable callbacks: updatePreviewStorage now only depends on slug which is stable.
- Uses refs to access the latest values without recreating the callback.
- Added change detection: Form values effect only updates if values actually changed.
- Sections effect uses serialization to detect real changes
- Added safety checks:
- Early returns if data isn't loaded.
- Timeouts to ensure state has settled before updating
- The infinite loop is resolved. The preview will still update when you change values, but without causing re-render loops.
- Fixed iframe scroll reset
- Changes suggested by Grok
- Removed iframe reload: the iframe no longer reloads when preview data changes. It updates via postMessage and event listeners.
- Added scroll position preservation:
- Saves scroll position before updating data
- Restores it after React re-renders
- Uses double requestAnimationFrame to ensure the DOM is updated
- Multiple update mechanisms:
- Custom event (preview-updated) for same-tab updates
postMessage for iframe communication
localStorage polling as a backup
- How it works now
- You make a change in the edit form
- Preview data is saved to localStorage
- A custom event is dispatched
postMessage is sent to the iframe (if it exists)
- The preview page receives the update
- Scroll position is saved before the update
- Data is updated (React re-renders)
- Scroll position is restored after the DOM updates
- The iframe preview should now maintain its scroll position when you make changes. The preview updates without reloading, so the scroll position is preserved.
- Try updating the logo URL again; the preview should update while keeping your scroll position.


### Route protection implemented (through cursor)
1. Middleware (src/middleware.ts)
Server-side route protection
Public routes: /login, /[slug]/careers, static assets
Protected routes: /edit, /preview, /api/preview, /
Redirects unauthenticated users to /login with redirect parameter
2. Login page (src/app/login/page.tsx)
Google OAuth button
Redirects to original URL after login
Checks if already logged in and redirects to home
Loading states during auth check
3. Edit page (src/app/[slug]/edit/page.tsx)
Client-side auth check on mount
Redirects to login if not authenticated
Loads data only after auth is verified
Loading spinner during auth check
4. Preview page (src/app/[slug]/preview/page.tsx)
Client-side auth check on mount
Redirects to login if not authenticated
Loads preview data only after auth is verified
Loading spinner during auth check
5. Preview API (src/app/api/preview/route.ts)
Server-side session verification
Returns 401 Unauthorized if not authenticated
Uses getServerSession helper for session validation
6. Auth helper (src/lib/auth-server.ts)
Server-side session retrieval from cookies
Handles Supabase session cookie parsing
Returns user session or null
Security features
Multi-layer protection: middleware + client checks + API checks
Session validation on both client and server
Redirect preservation: users return to intended page after login
Loading states: clear feedback during auth checks
Error handling: toast notifications for auth failures
Route access summary
Route	Access	Protection
/[slug]/careers	Public	None
/login	Public	None
/[slug]/edit	Logged in only	Middleware + Client check
/[slug]/preview	Logged in only	Middleware + Client check
/api/preview	Logged in only	Middleware + Server check
/	Logged in only	Middleware
All routes are protected. Only the public careers pages and login page are accessible without authentication.

### Route Protection Implementation
- The code was too buggy. Initially the code was not protected.
- The middleware was not working as expected.
- The client-side checks were not working as expected.
- The server-side checks were not working as expected.
- The redirects were not working as expected.
- The loading states were not working as expected.
- The error handling was not working as expected.
- Read supabase docs ['Build a User Management App with Next.js'](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- Fixed middlewares.
- Used the new PUBLISHABLE_KEY for auth implementation.