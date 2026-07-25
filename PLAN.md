# TaskManager — Cleanup & Migration Plan

Plan bertahap untuk merapikan project, rebrand ke **TaskManager**, dan memindahkan database ke **Supabase (PostgreSQL)**.

**Keputusan yang sudah ditetapkan:**

| Item | Keputusan |
|------|-----------|
| Nama produk | `TaskManager` |
| Database | Supabase (PostgreSQL) via EF Core + Npgsql |
| Auth (fase awal) | Custom JWT di API (BCrypt) — tetap di Postgres Supabase |
| Auth Supabase | Opsional, fase belakangan |
| Frontend | Tetap panggil .NET API (bukan langsung ke Supabase) |

---

## Target struktur folder

```text
TaskManager/
├── PLAN.md
├── README.md
├── backend/
│   └── src/
│       ├── TaskManager.Api/
│       ├── TaskManager.Application/
│       ├── TaskManager.Domain/
│       └── TaskManager.Infrastructure/
└── frontend/
    ├── package.json
    ├── src/
    └── ...
```

Hilangkan naming lama: `NebulaCore`, `Kenzo`, `Bagelen Bakery`, `Kenzonuts`, typo `frondend`.

---

## Fase 0 — Stabilisasi & keamanan

**Tujuan:** project aman, bisa di-build, siap diubah tanpa bocor secret.

### Checklist

- [ ] Buat project Supabase bernama `taskmanager` (atau setara) — **manual: kamu**
- [ ] Catat kredensial (simpan di password manager / User Secrets, **jangan commit**) — **manual: kamu**
  - Database connection string (direct + pooler)
  - Project URL
  - `anon` key
  - `service_role` key (server-only)
- [x] Pindahkan secret dari `appsettings.json` ke User Secrets / environment variables:
  - Connection string, JWT key, SMTP dikosongkan di repo
  - Template: `Backend/secrets.example.json`
  - Panduan: `Backend/SETUP.md` + `UserSecretsId` di API csproj
- [ ] **Rotate** password SMTP Gmail yang sudah ter-expose di repo — **manual: kamu** (anggap bocor)
- [x] Samakan Target Framework di semua project → **`net8.0`** (SDK di mesin ini hanya .NET 8)
- [x] Daftarkan DI yang hilang: `IReminderRepository` → `ReminderRepository`
- [x] Pastikan solution masih `dotnet build` sukses
- [x] Root `.gitignore` ditambah; `bin/`, `obj/`, `.vs/` di-untrack dari git index
- [x] `DesignTimeDbContextFactory` tidak lagi hardcode connection string

### Definition of done

- [x] Tidak ada secret sensitif di file source yang di-commit
- [x] Build hijau
- [ ] Kredensial Supabase siap dipakai di Fase 2 — **tunggu akun/project kamu**

---

## Fase 1 — Rebrand & rapikan struktur

**Tujuan:** naming dan folder rapi **tanpa mengubah behavior bisnis**.

### Checklist — struktur

- [x] Rename `frondend` → `frontend`
- [x] Flatten `frontend/TaskManager/` → isi langsung di `frontend/`
- [x] Pindahkan / rename backend ke `backend/src/TaskManager.*`
- [x] Rename solution & project:
  - `NebulaCore` → `TaskManager.Api`
  - `NebulaCore.Application` → `TaskManager.Application`
  - `NebulaCore.Domain` → `TaskManager.Domain`
  - `NebulaCore.Infrastruktur` → `TaskManager.Infrastructure`
- [x] Update semua namespace, project reference, dan `using`

### Checklist — naming & file kotor

- [x] Hapus / rename file dengan **spasi di akhir nama**
- [x] Rename typo / nama membingungkan:
  - `TaskCategory` → `TasksController` (route: `/api/Tasks`)
  - `UserControllers.cs` → `UsersController.cs`
  - `UpdateComplate` → `UpdateCompletion`
  - Migration / DB name `TaskManagger` → tidak dipakai lagi (akan diganti di Fase 2)
- [x] Samakan namespace controller (`TaskManager.Api.Controllers`)
- [x] Samakan namespace repository (`TaskManager.Domain.Repositories`)
- [x] Hapus file sampah:
  - `Dashboard_backup.tsx`
  - TODO yang sudah selesai
  - Dummy data yang tidak dipakai
- [x] Update copy UI / Swagger: title, description, branding → **TaskManager**
- [x] Update semua `fetch` frontend agar mengikuti route baru (`/api/Tasks`, dll.)
- [x] JWT scheme diganti ke `Bearer` (bonus, dari checklist Fase 3)

### Definition of done

- [x] Folder & naming konsisten `TaskManager`
- [x] `dotnet build` sukses
- [x] `npm run build` sukses
- [ ] Login + CRUD category/task smoke test (butuh User Secrets + DB)

---

## Fase 2 — Migrasi database ke Supabase

**Tujuan:** SQL Server diganti PostgreSQL (Supabase); schema baru bersih.

### Checklist — package & config

- [x] Di Infrastructure: hapus `Microsoft.EntityFrameworkCore.SqlServer`
- [x] Pasang `Npgsql.EntityFrameworkCore.PostgreSQL` (8.0.11)
- [x] `UseSqlServer(...)` → `UseNpgsql(...)` di `Program.cs` dan `DesignTimeDbContextFactory`
- [x] Connection string dari env / User Secrets (bukan hardcoded)

### Checklist — migration

- [x] Hapus folder `Migrations` SQL Server lama
- [x] Buat migration baru: `InitialCreate` (Postgres: `uuid`, `text`, `timestamptz`)
- [ ] Apply ke Supabase: `dotnet ef database update` — **nanti setelah User Secrets diisi**
- [ ] Verifikasi tabel di Supabase Table Editor:
  - `Users`
  - `Categories`
  - `Tasks`
  - `Reminders`
- [x] Model config: PK, FK, unique email/username, default timestamp (siap Postgres)

### Checklist — smoke test

- [ ] Register user baru
- [ ] Login → dapat JWT
- [ ] Create / list / update / delete category
- [ ] Create / list / update / complete / delete task
- [ ] (Jika endpoint ready) Reminder CRUD dasar

### Definition of done

- [ ] App berjalan full terhadap Supabase Postgres — **menunggu setup kredensial**
- [x] Tidak ada dependency SQL Server tersisa
- [ ] Data baru terlihat di Supabase dashboard — **menunggu `database update`**

---

## Fase 3 — Frontend hygiene & kontrak API

**Tujuan:** FE bersih, terpusat, mudah di-maintain.

### Checklist

- [x] Tambah `VITE_API_BASE_URL` (env) — hilangkan hardcode `http://localhost:5091`
- [x] Buat `src/api/` (atau `services/`) + helper auth header terpusat
- [x] Login response FE selaras dengan API (`token`, `userId`, `username`, `email`) — kurangi decode JWT manual jika API sudah mengembalikan profil
- [x] Auth scheme JWT standar `Bearer` di backend + Swagger (buang skema `Kenzo`) — sudah di Fase 1
- [x] Hapus dependency tidak terpakai (`@supabase/supabase-js` jika belum dipakai)
- [x] Bersihkan `console.log` debug
- [x] Login/Register masuk React Router (bukan toggle state di luar `Router`)
- [x] `[Authorize]` konsisten di endpoint sensitif (GetById / Delete category, dll.)
- [x] CORS dibatasi ke origin frontend (bukan `AllowAnyOrigin` di production)
- [x] Branding UI: logo/text → TaskManager

### Definition of done

- [x] Satu cara panggil API dari FE
- [x] Tidak ada URL/port hardcoded di komponen
- [x] Auth flow rapi (register + login konsisten soal token)

---

## Fase 4 — Fitur sisa & hardening

**Tujuan:** fitur yang setengah jalan diselesaikan; error handling lebih baik.

### Checklist

- [ ] Wire Reminder di UI (backend sudah ada handler/controller)
- [ ] Test logika hapus kategori (tolak jika masih ada task belum selesai)
- [ ] Global exception middleware di API (kurangi try/catch berulang di controller)
- [ ] Lengkapi FluentValidation untuk Category / Task / Reminder
- [x] Pastikan register juga menyimpan token / auto-login selaras dengan login — sudah di Fase 3
- [ ] Pindahkan DTO yang salah tempat (`TaskItem/Command/Dtos` → `TaskItem/Dtos`)
- [ ] Hapus SMTP dari config jika tidak dipakai; atau implement reminder email dengan benar

### Definition of done

- Reminder usable end-to-end (atau secara sadar di-scope-out dengan catatan)
- Delete category teruji
- Error response konsisten

---

## Fase 5 — Docs, test & quality gate

**Tujuan:** project bisa di-onboard orang lain dan tidak mudah rusak.

### Checklist

- [ ] Tulis `README.md` root:
  - Prasyarat (.NET, Node, akun Supabase)
  - Cara set User Secrets / `.env`
  - Cara run backend + frontend
  - Cara migrate DB
- [ ] Pastikan `.gitignore` menutupi: `bin/`, `obj/`, `.vs/`, `.env`, secrets, `node_modules/`
- [ ] Unit test minimal untuk handler penting:
  - Login (password valid/invalid)
  - Delete category (ada unfinished task vs aman dihapus)
  - Create task
- [ ] (Opsional) `docker-compose` untuk local Postgres mirror — atau dokumentasikan hanya pakai Supabase
- [ ] Checklist manual QA sebelum merge/release

### Definition of done

- README cukup untuk run dari nol
- Test minimal hijau
- Repo bersih dari artifact build & secret

---

## Fase 6 (opsional) — Supabase Auth

**Tujuan:** auth native Supabase; API validate JWT Supabase.

Kerjakan **hanya setelah** Fase 0–5 stabil.

### Checklist

- [ ] FE: register/login via `supabase.auth`
- [ ] BE: validate JWT dengan Supabase JWT secret (`iss`, `aud`)
- [ ] Sinkron `auth.users` ↔ profil `Users` (atau `UserId` = `auth.uid`)
- [ ] Pertimbangkan RLS jika FE akan akses table langsung
- [ ] Migrasi user lama (jika ada data production)

### Definition of done

- Login/register lewat Supabase Auth
- Endpoint protected menerima token Supabase

---

## Urutan kerja yang disarankan

| Urutan | Fase | Estimasi kasar |
|--------|------|----------------|
| 1 | Fase 0 | 0.5–1 hari |
| 2 | Fase 1 | 1–2 hari |
| 3 | Fase 2 | 0.5–1 hari |
| 4 | Fase 3 | 1–2 hari |
| 5 | Fase 4 | 1–2 hari |
| 6 | Fase 5 | 1 hari |
| 7 | Fase 6 | opsional |

**Aturan main:** jangan loncat terlalu jauh. Setiap fase harus hijau (build + smoke test) sebelum lanjut.

---

## Catatan teknis singkat (Fase 2)

Connection string contoh (isi dari dashboard Supabase):

```text
Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
```

Untuk traffic tinggi / serverless, pertimbangkan **pooler** (biasanya port `6543`) sesuai dokumentasi Supabase.

---

## Progress tracker

| Fase | Status | Catatan |
|------|--------|---------|
| 0 — Stabilisasi & keamanan | Mostly done | Sisa: buat project Supabase + set User Secrets + rotate SMTP |
| 1 — Rebrand & struktur | Done | Build BE+FE hijau; smoke test CRUD menunggu secrets/DB |
| 2 — Migrasi Supabase | Code done | Npgsql + InitialCreate siap; `database update` menunggu User Secrets |
| 3 — Frontend hygiene | Done | API client, Router auth, CORS, Authorize |
| 4 — Fitur sisa | Not started | |
| 5 — Docs & test | Not started | |
| 6 — Supabase Auth | Optional | |

Update kolom Status: `Not started` → `In progress` → `Done`.
