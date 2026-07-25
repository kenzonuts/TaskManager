# Backend setup

## Prasyarat

- .NET 8 SDK
- Akun [Supabase](https://supabase.com)

## 1. Buat project Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create project (mis. `taskmanager`)
3. Simpan di password manager:
   - Database password
   - Project URL
   - `anon` key
   - `service_role` key (**jangan pernah** masuk ke frontend)

Connection string: **Project Settings → Database → Connection string** (URI / ADO.NET).  
Untuk .NET/Npgsql biasanya mirip:

```text
Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
```

## 2. User Secrets (wajib untuk local run)

```bash
cd backend/src/TaskManager.Api
dotnet user-secrets init   # sudah ada UserSecretsId di csproj
```

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.<ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true"
dotnet user-secrets set "Jwt:Key" "ganti-dengan-secret-panjang-minimal-32-karakter"
dotnet user-secrets set "Jwt:Issuer" "TaskManager"
dotnet user-secrets set "Jwt:Audience" "TaskManager"
```

SMTP opsional — **rotate** dulu password yang pernah ter-commit. Referensi: `backend/secrets.example.json`.

## 3. Apply schema ke Supabase (Fase 2)

Setelah User Secrets berisi connection string Postgres:

```bash
cd backend/src
dotnet ef database update \
  --project TaskManager.Infrastructure/TaskManager.Infrastructure.csproj \
  --startup-project TaskManager.Api/TaskManager.Api.csproj
```

Cek di Supabase **Table Editor**: `Users`, `Categories`, `Tasks`, `Reminders`.

## 4. Run API

```bash
cd backend/src
dotnet run --project TaskManager.Api --launch-profile http
```

Swagger (Development): `http://localhost:5091`

## 5. Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Keamanan

- [ ] Rotate App Password Gmail yang pernah bocor di repo
- [ ] JWT key baru (≥ 32 karakter)
- [ ] Jangan commit secrets / `.env`
