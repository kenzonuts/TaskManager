# TaskManager

Full-stack task manager — ASP.NET Core 8 API + React (Vite) frontend, PostgreSQL via Supabase.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (npm)
- A [Supabase](https://supabase.com) project (PostgreSQL)

## Repository layout

```text
TaskManager/
├── PLAN.md
├── QA.md
├── backend/
│   ├── SETUP.md
│   ├── secrets.example.json
│   └── src/
│       ├── TaskManager.sln
│       ├── TaskManager.Api/
│       ├── TaskManager.Application/
│       ├── TaskManager.Application.Tests/
│       ├── TaskManager.Domain/
│       └── TaskManager.Infrastructure/
└── frontend/
```

## 1. Configure secrets (API)

```bash
cd backend/src/TaskManager.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.<ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true"
dotnet user-secrets set "Jwt:Key" "<random-secret-at-least-32-chars>"
dotnet user-secrets set "Jwt:Issuer" "TaskManager"
dotnet user-secrets set "Jwt:Audience" "TaskManager"
```

See [backend/SETUP.md](backend/SETUP.md) and [backend/secrets.example.json](backend/secrets.example.json).

## 2. Apply database migrations

```bash
cd backend/src
dotnet ef database update \
  --project TaskManager.Infrastructure/TaskManager.Infrastructure.csproj \
  --startup-project TaskManager.Api/TaskManager.Api.csproj
```

Confirm tables in Supabase Table Editor: `Users`, `Categories`, `Tasks`, `Reminders`.

## 3. Run API

```bash
cd backend/src
dotnet run --project TaskManager.Api --launch-profile http
```

Swagger (Development): http://localhost:5091

## 4. Run frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5091
npm install
npm run dev
```

App: http://localhost:5173

## Tests

```bash
cd backend/src
dotnet test TaskManager.sln
```

## Manual QA

See [QA.md](QA.md) before release.

## Roadmap

Cleanup / migration progress: [PLAN.md](PLAN.md).

Database hosting: **Supabase only** (no local docker-compose required).
