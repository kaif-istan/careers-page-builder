# Careers Page Builder (v0.1.0)

🚀 **Live Demo:** [careers-page-builder-blond.vercel.app](careers-page-builder-blond.vercel.app)



Build and publish beautiful, high‑performing careers pages backed by Supabase. This project is the completed Full Stack Developer assignment for WhiteCarrot and demonstrates secure preview/publish workflows, recruiter authentication, and job listing management.

## Description

- Purpose: Provide recruiters with a fast, modern tool to compose branded careers pages and manage job listings.
- Features: Authenticated editing, real preview isolation, publish flow, drag‑and‑drop section ordering, job details, server‑validated API.
- Value: Accelerates employer branding and hiring funnels; showcases a robust Next.js + Supabase stack with production‑ready patterns.

See system internals in `Tech_Spec.md`. Contribution standards are in this document; cross‑reference architecture and API details in `Tech_Spec.md`.

## Installation

- Prerequisites:
  - Node `>=20` (LTS recommended)
  - One of: `pnpm` (recommended), `npm`, `yarn`, or `bun`
  - A Supabase project with Auth enabled

- Setup:
  1. Clone the repo
     ```bash
     git clone https://github.com/whitecarrot/careers-page-builder.git
     cd careers-page-builder
     ```
  2. Install dependencies
     ```bash
     pnpm install
     # or: npm install / yarn / bun install
     ```
  3. Create `.env` (see Configuration) and start dev server
     ```bash
     pnpm dev
     # then open http://localhost:3000
     ```

## Configuration

- Environment variables (create `.env` in project root):
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
  # The publishable/anon key. Some modules use ANON, others use PUBLISHABLE; set both.
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key>

  # Server-side Supabase operations (never expose client-side)
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
  ```

- API keys: Generate in the Supabase dashboard under Project Settings → API.
- Images: Update `next.config.ts` `images.remotePatterns` to include your Supabase storage domain.
- Auth: Middleware at `src/middleware.ts:1` refreshes sessions; server auth helper at `src/lib/auth-server.ts:1` verifies sessions for protected APIs.

## Usage

- Login:
  - Navigate to `/login`.
  - Authenticate via Supabase; redirect preserves intended destination.
- Edit flow:
  - Go to `/[slug]/edit` to manage brand and sections with drag‑and‑drop.
  - Client stores preview in `localStorage`; publishing writes to Supabase tables.
- Preview:
  - Visit `/[slug]/preview` for isolated preview (server reconciles preview cookie/localStorage with published data via `/api/preview`).
- Publish/read‑only:
  - Public careers page: `/[slug]/careers` (reads published data only).
  - Job details: `/[slug]/jobs/[jobSlug]`.

- Testing Supabase connectivity:
  - Call `GET /api/test-supabase` to insert a dummy company and validate server credentials.
  - This will not work due to RLS policy on company table. Disable RLS or provide user_id to continue.

Common workflows:

- Create or select company → arrange sections → preview changes → publish → share `/[slug]/careers`.
- Import jobs data (see `scripts/seed.ts:60`) → verify uniqueness by `job_slug` → view job listings and details.

## Deployment

- Production checklist:
  - Configure all env vars in the hosting provider’s settings.
  - Enable Supabase Row Level Security and policies on `companies`, `company_sections`, `jobs`.
  - Verify `images.remotePatterns` for storage access.
  - Run seed scripts as needed.
  - Enforce HTTPS and secure cookies.

- Server requirements:
  - Node `>=18` runtime; Vercel recommended.
  - Edge‑compatible middleware; standard Next.js server functions.

- CI/CD (GitHub Actions example):
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with:
            version: 9
        - uses: actions/setup-node@v4
          with:
            node-version: 20
            cache: 'pnpm'
        - run: pnpm install --frozen-lockfile
        - run: pnpm run lint
        - run: pnpm run build
  ```

## Contribution

- Code style:
  - ESLint via `eslint.config.mjs:1` using `eslint-config-next` (Core Web Vitals + TypeScript).
  - TypeScript strict mode enabled in `tsconfig.json:1`.

- Pull requests:
  - Fork and branch per feature.
  - Include screenshots or short clips for UI changes.
  - Ensure `pnpm run lint` and `next build` pass.

- Testing requirements:
  - Add minimal repro steps in PR descriptions.
  - Prefer integration checks against Supabase (e.g., run `GET /api/test-supabase`).

## Future Implementations
- Advanced theming options with custom CSS and fonts.
- Integration with popular ATS (Applicant Tracking Systems) platforms.
- Bulk job import/export functionality.
- AI-powered content generation (About Us, Job Description Enhancer, etc.).

## License

MIT License

Copyright (c) WhiteCarrot and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
