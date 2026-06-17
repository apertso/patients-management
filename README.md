# Patients Management System

A full-stack Patients Management System built with Next.js, NestJS, TypeScript, and PostgreSQL.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma, planned for the backend data layer

## Project Structure

```txt
apps/
  api/
  web/
docker-compose.yml
```

## Prerequisites

- Node.js
- npm
- Docker
- Docker Compose

## Local Development

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Start Backend

```bash
cd apps/api
npm install
cp .env.example .env
npm run start:dev
```

Backend runs on:

```txt
http://localhost:4000/api
```

Health check:

```txt
GET http://localhost:4000/api/health
```

### 3. Start Frontend

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

## Current Stage

Stage 1 sets up the project foundation:

- NestJS backend
- Next.js frontend
- PostgreSQL through Docker Compose
- Strict TypeScript
- ESLint and Prettier
- Basic health endpoint
- Initial README

Authentication, database schema, patients CRUD, RBAC, and UI flows will be implemented in later stages.
