# Patients Management System

## Overview

A full-stack Patients Management System built for a technical interview take-home assignment. The app demonstrates role-aware authentication, RBAC, a protected patients workspace, CRUD operations, optimistic updates, responsive UI states, and a clean NestJS backend with PostgreSQL.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT, bcrypt
- Data fetching: TanStack Query
- Forms: React Hook Form, Zod
- Testing: Jest, Supertest, Vitest
- Infrastructure: Docker Compose

## Features

- Email/password login
- JWT persistence and expiry handling
- Admin/user role-aware UI
- Backend RBAC guards
- Patients list with search, sort, and pagination
- Patient details dialog
- Admin create/edit/delete
- User view-only access
- Optimistic updates with rollback
- Loading, empty, and error states
- Responsive desktop/mobile layouts
- Mock latency and failure simulation
- Light/dark theme toggle

## Demo Accounts

```txt
Admin:
admin@example.com / password123

User:
user@example.com / password123
```

## Project Structure

```txt
patients-management/
  apps/
    api/
      prisma/
      src/
    web/
      src/
  docker-compose.yml
  README.md
```

## Prerequisites

- Node.js 22 recommended
- npm
- Docker
- Docker Compose

## Local Development

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Backend:

```bash
cd apps/api
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run start:dev
```

Frontend:

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

URLs:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:4000/api
Health:   http://localhost:4000/api/health
```

## Running With Docker

The app includes Dockerfiles for the API and web app plus a root Compose file for PostgreSQL, API, and web.

For a fresh local Docker database, run migrations and seed data first:

```bash
docker compose up -d postgres

cd apps/api
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed

cd ../..
docker compose up --build
```

Then open:

```txt
http://localhost:3000
```

Production deployments must replace `JWT_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, and `FRONTEND_URL`. Do not commit real secrets.

## API Contract

```txt
POST   /api/auth/login
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

Access rules:

- `GET` routes: admin and user
- Mutation routes: admin only

Patients list query example:

```txt
/api/patients?page=1&limit=10&search=smith&sortBy=lastName&sortOrder=asc
```

## Testing

Backend:

```bash
cd apps/api
npm run lint
npm run build
npm run test
npm run test:e2e
```

Frontend:

```bash
cd apps/web
npm run lint
npm run build
npm run test
```

## Manual QA Checklist

- Startup: PostgreSQL starts, backend starts, frontend starts, and `/api/health` returns `200`.
- Auth: unauthenticated root redirects to `/login`, admin login works, user login works, invalid login shows a friendly error, logout works, and expired tokens are cleared.
- User role: list/search/sort/pagination/details work; create/edit/delete actions are not visible.
- Admin role: list/search/sort/pagination/details work; create/edit/delete work; duplicate email returns a friendly conflict message; validation catches invalid form values.
- Error states: mock failure mode shows retryable list errors and mutation rollback keeps UI data consistent.
- Responsive: mobile cards, desktop table, dialogs, toolbar, and header fit at 375px, 768px, and 1280px widths.
- Keyboard: tab order is logical, visible focus rings are present, dialogs close with Escape, forms submit with Enter, and delete requires an explicit button press.

## Design And UX Notes

- The UI uses explicit semantic tokens for background, card, primary, success, warning, error, muted, border, and focus ring colors.
- The app shell, login page, patient table, mobile cards, dialogs, and toasts use consistent spacing, borders, radius, and shadows.
- Dialogs include `role="dialog"`, `aria-modal`, labels/descriptions, Escape close, backdrop click close, initial focus, and body scroll locking.
- Toasts expose status/alert roles and a dismiss button with an accessible label.
- Admin users see create/edit/delete actions; standard users get a view-only workspace.

## Architecture Notes

- The backend keeps auth, users, patients, Prisma, and common guards/filters/interceptors separated by module.
- RBAC is enforced in the API with JWT auth and a roles guard, not only in the frontend.
- TanStack Query manages server state, cache invalidation, optimistic updates, and rollback.
- URL query state is the source of truth for patients pagination, search, and sorting.
- The frontend and backend remain independently runnable; no monorepo framework is required.

## Security Notes

- Passwords are hashed with bcrypt.
- JWTs are validated by the backend and checked for expiry in the frontend session layer.
- Protected backend routes require bearer tokens.
- Admin-only mutations are guarded server-side.
- Helmet and CORS are configured in the NestJS bootstrap.
- Local `.env.example` files contain placeholders only.

## Performance And Reliability Notes

- Patients are paginated on the backend; no frontend virtualization is needed for this scope.
- React Query defaults use `staleTime: 30_000`, `retry: 1`, and `refetchOnWindowFocus: false`.
- Mutations invalidate relevant patient queries instead of globally refetching all data.
- Mock latency and failure controls can demonstrate loading, error, retry, and rollback behavior.

## Interview Talking Points

- Auth and RBAC are enforced on the backend and reflected in the frontend for usability.
- Optimistic mutations update cached patient lists immediately and rollback on failure.
- Query string state makes patient list filters shareable and resilient to reloads.
- The UI intentionally focuses on CRUD clarity, accessible dialogs, and responsive patient records rather than adding extra domain features.
- Docker support is included, while migrations remain explicit so database setup is visible and debuggable during review.

## Trade-offs

Given the 3-4 hour timebox, I prioritized:

- End-to-end auth and RBAC
- Clean backend architecture
- Reliable patients CRUD
- Responsive and accessible frontend states
- Optimistic mutation UX
- Clear local setup and verification commands

I intentionally kept the following limited:

- No refresh-token flow
- No audit logging
- No complex patient domain relations
- No full E2E browser suite
- No production-grade secret management
- No automatic Docker migration entrypoint

## Future Improvements

- Refresh tokens or secure cookie-based auth
- Audit trail for patient mutations
- Advanced accessibility focus trap
- More complete frontend component tests
- E2E tests with Playwright
- Production deployment pipeline
- Rate limiting and structured logging
