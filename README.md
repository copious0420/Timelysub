# Substitution Ally

Build an intuitive, single-page web application for a school automated substitution scheduling system called 'Neev Substitution App'.

Core Features:

Teacher Roster Tab: A table where I can view, add, edit, or remove teachers, their subject, and their weekly timetable (Free/Busy slots per period, Periods 1 through 8). Include pre-populated demo data for 10 teachers.

Daily Absentee Tracker: A quick panel where I select today's date, tick off which teachers are absent, and select which specific periods they will miss.

Smart Substitution Generator: A main dashboard that takes the absent list and automatically generates a substitution schedule.

Logic: Match absent classes with teachers who are free in that period. Prioritize teachers in the same department/subject first, followed by whoever has the lowest total substitution count today.

Export Options: A clear view of the final daily substitution table with a button to print or download as a PDF/CSV.

UI/UX: Modern, clean, dashboard layout with a sidebar for navigation. Use neutral gray/blue accents

This project was built with [Lovable](https://lovable.dev).

## Using the existing backend with a Lovable frontend

This repository uses the existing Supabase project as its backend. The frontend expects these environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

When moving UI code from another Lovable project, keep the files under `src/integrations/supabase/`, `src/lib/cloud.ts`, `src/lib/substitution.ts`, and the `supabase/migrations/` directory from this repository. Those files preserve the current authentication flow, database types, row-level security assumptions, teacher roster, saved schedules, and substitution records. Adapt the new screens to those helpers instead of creating a second Supabase project or changing the existing database schema.

The student noticeboard uses the `supabase/functions/student-substitutions` Edge Function. Deploy it with the Supabase CLI and ensure the platform provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the function. The service-role key must never be exposed to the browser. Also enable **Authentication → Password Security → Leaked Password Protection** in the Supabase Dashboard.

Google sign-in uses Supabase's native OAuth flow. In the Supabase Dashboard, enable Google under **Authentication → Sign In / Providers**, then add the deployed app URL followed by `/auth` to **Authentication → URL Configuration → Redirect URLs**. For local development, add `http://localhost:3000/auth` as well if that is the URL shown by Vite.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/18c2a928-59d2-4fce-8ae2-590ab7a5224c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
