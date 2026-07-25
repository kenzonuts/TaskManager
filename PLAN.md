# TaskManager — UI Rebuild Plan

Plan aktif untuk **membangun ulang frontend** menjadi dashboard produktivitas monochrome.
Backend, auth JWT, Supabase, dan API client **tidak di-rebuild** — dipakai ulang.

**Prinsip rebuild**

| Pertahankan | Bangun ulang |
|-------------|--------------|
| Backend .NET + EF + Supabase | App shell (sidebar + layout) |
| JWT auth + `AuthContext` | Dashboard & widget produktivitas |
| `src/api/*`, types, CRUD task/category/reminder | Navigasi & halaman Tasks/Categories (skin baru) |
| Login / Register (logic) | Visual Login / Register agar selaras shell |

---

## Keputusan produk

| Item | Keputusan |
|------|-----------|
| Nama produk | `TaskManager` |
| Database | Supabase (PostgreSQL) via EF Core + Npgsql |
| Auth | Custom JWT di API (BCrypt) — Supabase Auth opsional belakangan |
| Frontend ↔ data | FE memanggil .NET API (bukan langsung ke Supabase) |
| Arah UI | Sidebar gelap + konten terang, grayscale, productivity hub |
| Categories vs Projects | Tetap **Categories**; Projects ditunda |
| Notes | Entitas terpisah dari Task |
| Analytics | Butuh `CompletedAt` (+ `UpdatedAt`) sebelum chart / streak / weekly progress |

---

## Must-have dashboard

| # | Fitur | Keterangan |
|---|--------|------------|
| 1 | Dashboard Summary | Total / Completed / Pending / Overdue |
| 2 | Weekly Progress | Ring % = completed minggu ini ÷ weekly goal |
| 3 | Today's Focus | Satu task prioritas utama hari itu |
| 4 | Upcoming Deadlines | Task terdekat by `DueDate` |
| 5 | Productivity Chart | Completed per hari (Mon–Sun) |
| 6 | Recent Tasks | Terakhir dibuat / diubah |
| 7 | Mini Calendar | Bulan berjalan + dot indicator deadline |
| 8 | Quick Notes | Catatan ringan (bukan task) |
| 9 | Productivity Streak | Hari berturut ≥1 task completed |
| 10 | Global Search | `Ctrl+K` / `Cmd+K` command palette |
| 11 | Quick Actions | Shortcut create (Task, Note, …) |

**Ditunda (Phase 7):** Focus Mode, Pomodoro, time tracking, estimated time, monthly completion, Projects, Upgrade Pro, dark mode palsu.

**Layout target**

```text
[ Header: greeting | Global Search (Ctrl+K) | profile ]
[ KPI: Total | Completed | Pending | Overdue | Weekly Progress ring ]
[ Today's Focus | Upcoming Deadlines | Productivity Chart ]
[ Recent Tasks  | Mini Calendar      | Quick Notes ]
[ Streak (tipis) | Quick Actions ]
```

---

## Prasyarat (sisa fondasi)

Selesaikan sebelum mengandalkan data production di Phase 3–4:

- [ ] User Secrets / env: connection string Supabase + JWT key
- [ ] Verifikasi tabel di Supabase: `Users`, `Categories`, `Tasks`, `Reminders`
- [ ] Smoke test: register → login → CRUD category/task
- [ ] (Disarankan) rotate password SMTP lama yang pernah ter-expose

Shell UI (Phase 1) boleh dimulai lebih dulu dengan empty state.

Panduan teknis: `backend/SETUP.md`, `README.md`.

---

## Phase 1 — App Shell

**Tujuan:** ganti look-and-feel ke layout mockup; nav hanya yang sudah hidup.

**Rebuild scope:** `Navigation` → shell baru (`AppShell` / `Sidebar` + header); bungkus route authenticated.

### Checklist

- [x] App shell: fixed dark sidebar + light main content
- [x] Sidebar branding: logo **TaskManager** + tagline (mis. “Keep it simple.”)
- [x] Nav aktif: Dashboard, Tasks, Categories
- [x] Nav belum siap: hide atau “Coming soon” — jangan dead link
- [x] Header: konteks halaman + profile dari user auth (tanpa branding lama)
- [x] Tanpa kartu “Upgrade to Pro”
- [x] Tanpa Dark Mode toggle sampai theme system nyata ada
- [x] Skin Login / Register selaras shell baru (logic auth tetap)
- [x] Responsive: sidebar collapse di mobile
- [x] Tasks & Categories memakai shell yang sama (konten boleh di-skin belakangan)

### Definition of done

- [x] Shell terasa selaras mockup monochrome
- [x] Route existing tetap berfungsi lewat API yang sama
- [x] Tidak ada menu yang mengaku ready padahal belum ada

---

## Phase 2 — Dashboard Batch A

**Tujuan:** widget dari model Task existing (`IsCompleted`, `DueDate`, `CreatedAt`, `Priority`).

### Checklist

- [x] Dashboard Summary: Total / Completed / Pending / Overdue
- [x] Upcoming Deadlines: top N unfinished, sort `DueDate` ascending
- [x] Recent Tasks: last N by `CreatedAt` (sementara; pindah ke `UpdatedAt` di Phase 4)
- [x] Mini Calendar: bulan berjalan, highlight hari ini
- [x] Dot indicator pada tanggal yang punya `DueDate`
- [x] Global Search (`Ctrl+K` / `Cmd+K`) — filter title task
- [x] Quick Actions: `+ New Task` → create modal (reuse existing)
- [x] Empty state jelas saat belum ada task

### Aturan bisnis

| Metrik | Aturan |
|--------|--------|
| Pending | `!IsCompleted` |
| Overdue | `!IsCompleted && DueDate < now` |
| Upcoming | unfinished, `DueDate != null`, sort asc, limit 5–8 |
| Recent (sementara) | sort `CreatedAt` desc, limit 5–8 |

### Definition of done

- [x] Angka & list dari API real (bukan hardcode)
- [x] Shortcut search berfungsi
- [x] Create task dari Quick Action berfungsi

---

## Phase 3 — Data foundation (analytics)

**Tujuan:** schema cukup untuk weekly progress, chart, streak, dan recent “last changed”.

**Blokir:** jangan mulai Phase 4 (chart / streak / weekly ring akurat) sebelum ini selesai.

### Checklist — Task model & API

- [x] Tambah `CompletedAt` (`DateTime?`) di `TaskItem`
- [x] Tambah `UpdatedAt` (`DateTime`) di `TaskItem`
- [x] Create: set `CreatedAt` + `UpdatedAt`
- [x] Update field: set `UpdatedAt`
- [x] Mark complete: `CompletedAt = UtcNow`; uncomplete: `CompletedAt = null`
- [x] EF migration Postgres (`AddTaskAnalyticsFields`) — **applied ke Supabase**
- [x] DTO / response FE mengekspos field baru (`createdAt`, `updatedAt`, `completedAt`)
- [ ] (Opsional) endpoint summary dashboard

### Checklist — preferensi

- [x] `WeeklyGoal` (default **20**) — kolom di `Users`
- [x] Boleh hardcode default dulu + TODO Settings UI, asal satu sumber kebenaran — exposed via login/register `weeklyGoal`

### Definition of done

- [x] Complete / uncomplete mengisi `CompletedAt` benar (unit tests)
- [x] Migration diterapkan di Supabase
- [x] FE membaca field baru tanpa error

---

## Phase 4 — Dashboard Batch B

**Tujuan:** widget yang bergantung `CompletedAt` + weekly goal.

### Checklist

- [x] **Weekly Progress ring:** completed minggu ini / `WeeklyGoal` → %
- [x] **Today's Focus** (satu task):
  - Aturan v1: unfinished → prefer `DueDate` hari ini (atau tanpa due) → `Priority` tertinggi
  - Tampilkan title + priority; **jangan** time slot palsu sebelum ada field start/end
- [x] **Productivity Chart:** completed per hari (Senin–Minggu minggu berjalan)
- [x] **Productivity Streak:** hari berturut ≥1 completion; putus jika 1 hari kosong
- [x] **Recent Tasks:** sort `UpdatedAt` desc
- [x] Greeting dinamis (pagi / siang / malam) + sisa task hari ini

### Definition of done

- [x] Ring, chart, streak konsisten dengan data completion
- [x] Today's Focus mengikuti aturan di plan
- [x] Tidak ada angka dummy di UI production

---

## Phase 5 — Quick Notes

**Tujuan:** catatan cepat tanpa memaksa segala sesuatu menjadi Task.

### Checklist — backend

- [x] Entity `Note`: `NoteId`, `UserId`, `Content`, `CreatedAt`, `UpdatedAt`
- [x] CRUD API Notes + authorize per user
- [x] FluentValidation: content required, max length wajar
- [x] Migration + apply ke Supabase (`AddNotes`)

### Checklist — frontend

- [x] Widget Quick Notes di dashboard (list + add / hapus dasar)
- [x] Quick Action `+ New Note`
- [ ] (Opsional) halaman Notes penuh — belakangan

### Definition of done

- [x] Notes end-to-end tanpa mencemari model Task
- [x] Isolasi per user

---

## Phase 6 — Polish & quality

**Tujuan:** dashboard terasa produk jadi, bukan demo widget.

### Checklist

- [x] Loading / skeleton dashboard
- [x] Empty state per widget
- [x] Error handling API di permukaan dashboard
- [x] A11y dasar: focus trap search modal, keyboard nav
- [x] Skin ulang Tasks / Categories agar selaras shell (jika belum di Phase 1)
- [x] Update `README.md` / `QA.md` untuk alur dashboard baru
- [x] Unit test: complete task mengisi `CompletedAt`; helper streak / weekly jika diekstrak
- [x] Hapus file sampah FE (`Dashboard_backup.tsx`, dummy data tidak terpakai) — sudah tidak ada

### Definition of done

- [x] Smoke test dashboard penuh lulus (checklist di `QA.md`)
- [x] `dotnet build` + `npm run build` hijau

---

## Phase 7 (opsional) — Premium

Kerjakan **hanya setelah** Phase 6 selesai.

- [x] Focus Mode (sidebar mengecil, noise disembunyikan, fokus ke Today's Focus)
- [x] Pomodoro timer
- [x] Estimated time / remaining pada Focus
- [x] Time Tracking (start / stop + elapsed)
- [x] Start–end time slot pada task
- [x] Monthly Completion
- [x] Pin manual Today's Focus
- [x] Dark mode theme system (toggle nyata)
- [x] In-app notifications dari Reminder
- [ ] Projects (hanya jika Categories tidak cukup) — **dilewati** (Categories cukup)

---

## Phase 8 (opsional) — Supabase Auth

Tidak memblokir UI rebuild. Kerjakan kapan saja setelah fondasi API stabil.

- [x] FE: register/login via `supabase.auth` (aktif jika `VITE_AUTH_PROVIDER=supabase`)
- [x] BE: validate JWT Supabase (`iss`, `aud`) via `Auth:Provider=Supabase`
- [x] Sinkron `auth.users` ↔ profil `Users` (auto-create on first validated token)
- [ ] Pertimbangkan RLS jika FE akses table langsung — **opsional**; FE tetap lewat API
- [x] Migrasi user lama (jika ada) — custom JWT tetap default; Supabase mode membuat baris `Users` baru dari `sub`

---

## Urutan kerja

| Urutan | Phase | Estimasi |
|--------|-------|----------|
| 1 | Phase 1 — App Shell | 1–2 hari |
| 2 | Phase 2 — Dashboard Batch A | 1–2 hari |
| 3 | Phase 3 — Data foundation | 0.5–1 hari |
| 4 | Phase 4 — Dashboard Batch B | 1–2 hari |
| 5 | Phase 5 — Quick Notes | 1 hari |
| 6 | Phase 6 — Polish | 0.5–1 hari |
| — | Phase 7 — Premium | opsional |
| — | Phase 8 — Supabase Auth | opsional |

**Aturan**

- Setiap phase hijau (build + smoke) sebelum lanjut.
- Jangan kerjakan chart / streak / weekly ring akurat sebelum **Phase 3**.
- Jangan kerjakan Notes sebelum **Phase 2** hidup.
- Jangan rebuild backend / `src/api` dari nol — extend saja.

---

## Struktur folder (target)

```text
TaskManager/
├── PLAN.md
├── README.md
├── QA.md
├── backend/
│   └── src/
│       ├── TaskManager.Api/
│       ├── TaskManager.Application/
│       ├── TaskManager.Domain/
│       └── TaskManager.Infrastructure/
└── frontend/
    ├── package.json
    └── src/
        ├── api/          ← pertahankan
        ├── components/   ← shell + widget baru
        ├── context/      ← pertahankan AuthContext
        ├── pages/        ← rebuild visual
        └── ...
```

---

## Catatan teknis (Supabase)

```text
Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
```

Untuk traffic tinggi / serverless, pertimbangkan **pooler** (biasanya port `6543`).

---

## Progress tracker

| Phase | Status | Catatan |
|-------|--------|---------|
| Prasyarat (secrets + smoke CRUD) | Open | Lihat section Prasyarat |
| 1 — App Shell | Done | `AppShell` sidebar gelap + konten terang; Login/Register diselaraskan |
| 2 — Dashboard Batch A | Done | Summary, upcoming, recent, calendar+dots, Ctrl+K, +Task |
| 3 — Data foundation | Done | `CompletedAt`/`UpdatedAt`/`WeeklyGoal` + migration applied |
| 4 — Dashboard Batch B | Done | Focus, weekly ring, chart, streak, greeting |
| 5 — Quick Notes | Done | Entity Notes + API + dashboard widget |
| 6 — Polish | Done | Skeleton, errors, a11y search, QA/README |
| 7 — Premium | Optional | Focus Mode, time tracking, dll. |
| 8 — Supabase Auth | Optional | Tidak memblokir Phase 1–6 |

Update status: `Not started` → `In progress` → `Done`.

---

## Appendix — Foundation (archived)

Pekerjaan cleanup / migrasi sebelumnya dianggap **selesai di level kode**. Tidak diulang.

| Lama | Ringkasan | Status |
|------|-----------|--------|
| F0 Stabilisasi | Secrets keluar repo, .NET 8, DI, `.gitignore` | Mostly done (sisa secrets manual + rotate SMTP) |
| F1 Rebrand | Folder `TaskManager.*`, naming, JWT Bearer | Done |
| F2 Supabase | Npgsql + `InitialCreate` | Code done (smoke/verifikasi tabel masih open) |
| F3 FE hygiene | `VITE_API_BASE_URL`, `src/api/`, Router auth, CORS | Done |
| F4 Hardening | Reminder UI, middleware, validators | Done |
| F5 Docs & test | README, QA.md, unit tests | Done |

Detail historis checklist lama tidak lagi menjadi jalur kerja aktif; rujuk git history / commit message jika perlu audit.
