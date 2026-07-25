# Manual QA checklist

Run before merge/release. Check each item after API + frontend are running against Supabase.

## Setup

- [ ] User Secrets configured (`ConnectionStrings:DefaultConnection`, `Jwt:Key`)
- [ ] `dotnet ef database update` applied; tables visible in Supabase (`Users`, `Categories`, `Tasks`, `Reminders`, `Notes`)
- [ ] API runs on http://localhost:5091
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:5091`
- [ ] Frontend runs on http://localhost:5173

## Auth

- [ ] Register new user → redirected/logged in with token
- [ ] Logout clears session
- [ ] Login with same credentials works
- [ ] Login with wrong password fails gracefully

## Shell / navigation

- [ ] Dark sidebar + light content on Dashboard / Tasks / Categories
- [ ] Mobile hamburger opens sidebar drawer
- [ ] Global Search opens with `Ctrl+K` / `Cmd+K`; Esc closes; Tab stays in dialog

## Dashboard

- [ ] Skeleton shows while loading
- [ ] Summary cards (Total / Completed / Pending / Overdue) match tasks
- [ ] Weekly progress ring uses `weeklyGoal` (default 20)
- [ ] Today's Focus picks unfinished high-priority / due-today task
- [ ] Upcoming deadlines list unfinished tasks with due dates
- [ ] Productivity chart reflects completions this week (Mon–Sun)
- [ ] Mini calendar highlights today; dots on due dates
- [ ] Recent tasks sort by last update; toggle complete works
- [ ] Streak updates after completing a task
- [ ] Quick Actions: New Task opens create modal; New Note focuses notes input
- [ ] Load error banner + Retry if API fails

## Quick Notes

- [ ] Add note from dashboard widget
- [ ] Note appears in list for current user only
- [ ] Delete note
- [ ] Empty content rejected (validation)

## Categories

- [ ] Create category
- [ ] Rename category
- [ ] Delete empty / all-completed category succeeds
- [ ] Delete category with unfinished tasks is rejected with clear message

## Tasks

- [ ] Create task (with and without category)
- [ ] Edit task fields
- [ ] Toggle complete / incomplete (sets / clears `CompletedAt`)
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
