# School ERP — Mother Teresa Foundation School

A full-stack ERP management system for schools, built with **Express + Prisma** (backend) and **React + Vite** (frontend).

## Features

- **Multi-role access**: Admin, Faculty, Student
- **Academic management**: Academic years, classes, divisions, subjects
- **Student management**: Enrollment, attendance, marks, report cards
- **Faculty tools**: Homework, timetables, marks entry, attendance
- **Administration**: Notices, analytics, audit logs, certificates
- **PDF report cards** with QR code verification

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, React Query, Zustand |
| Backend | Express 4, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |

## Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose** (for production deployment)
- **PostgreSQL** 16 (for local development without Docker)

---

## Quick Start (Development)

```bash
# 1. Clone the repository
git clone <repo-url> && cd school-erp

# 2. Start PostgreSQL (via Docker)
docker-compose up postgres -d

# 3. Install dependencies, run migrations, and seed
npm run setup

# 4. Start dev servers (backend + frontend concurrently)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

---

## Production Deployment (Docker Compose)

### 1. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set strong secrets:
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)
# - POSTGRES_PASSWORD
# - SMTP credentials (if email is needed)
```

### 2. Build and Start

```bash
# Build all containers
npm run docker:build

# Start all services
npm run docker:up

# View logs
npm run docker:logs
```

The app will be available at **http://localhost** (port 80).

### 3. Seed the Database (first time only)

```bash
docker exec school_erp_backend npx prisma db seed
```

### 4. Stop

```bash
npm run docker:down
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mtfschool.edu | Admin@123 |
| Faculty | teacher1@mtfschool.edu | Faculty@123 |
| Student | aditi.sharma@school.com | Student@123 |

> ⚠️ **Change these immediately in production!**

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret (required in prod) | — |
| `JWT_REFRESH_SECRET` | Refresh token secret (required in prod) | — |
| `JWT_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `POSTGRES_USER` | PostgreSQL username | `school_erp_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `school_erp_pass_2024` |
| `POSTGRES_DB` | PostgreSQL database name | `school_erp` |

See [`.env.example`](.env.example) for the full list.

---

## Project Structure

```
school-erp/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, JWT configuration
│   │   ├── middleware/    # Auth, error handling, validation
│   │   ├── routes/        # All API route handlers
│   │   ├── utils/         # Helper functions
│   │   └── server.ts      # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # API client & service modules
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (admin/faculty/student)
│   │   ├── stores/        # Zustand state stores
│   │   └── App.tsx        # Root app with routing
│   ├── nginx.conf         # Production Nginx config
│   └── Dockerfile
├── docker-compose.yml     # Full stack deployment
├── .env.example           # Environment template
└── README.md
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend

# Database
npm run db:migrate       # Run migrations (dev)
npm run db:migrate:prod  # Run migrations (production)
npm run db:seed          # Seed database
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:build     # Build all containers
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View logs

# Build
npm run build            # Build both frontend & backend
```

---

## License

Private — All rights reserved.
