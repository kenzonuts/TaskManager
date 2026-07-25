# Manual QA checklist

Run before merge/release. Check each item after API + frontend are running against Supabase.

## Setup

- [ ] User Secrets configured (`ConnectionStrings:DefaultConnection`, `Jwt:Key`)
- [ ] `dotnet ef database update` applied; tables visible in Supabase
- [ ] API runs on http://localhost:5091
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:5091`
- [ ] Frontend runs on http://localhost:5173

## Auth

- [ ] Register new user → redirected/logged in with token
- [ ] Logout clears session
- [ ] Login with same credentials works
- [ ] Login with wrong password fails gracefully

## Categories

- [ ] Create category
- [ ] Rename category
- [ ] Delete empty / all-completed category succeeds
- [ ] Delete category with unfinished tasks is rejected with clear message

## Tasks

- [ ] Create task (with and without category)
- [ ] Edit task fields
- [ ] Toggle complete / incomplete
- [ ] Filters (completed / pending / overdue / category) behave correctly

## Reminders

- [ ] Open Edit Task → add reminder in the future
- [ ] Reminder appears in list
- [ ] Delete reminder
- [ ] Reminder in the past is rejected

## Regression / quality

- [ ] `dotnet test` green
- [ ] `dotnet build` green
- [ ] `npm run build` / `npm run typecheck` green
- [ ] No secrets committed (`.env`, User Secrets, app passwords)
- [ ] CORS allows only configured frontend origins
