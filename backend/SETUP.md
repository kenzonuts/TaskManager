# Backend setup (Fase 0+)

## Prasyarat

- .NET 8 SDK
- Akun [Supabase](https://supabase.com) (project akan dipakai penuh di Fase 2)

## 1. Buat project Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create project (mis. `taskmanager`)
3. Simpan di password manager:
   - Database password
   - Project URL
   - `anon` key
   - `service_role` key (**jangan pernah** masuk ke frontend)

Connection string: **Project Settings → Database → Connection string → URI / .NET**

## 2. User Secrets (wajib untuk local run)

Dari folder API project:

```bash
cd backend/src/TaskManager.Api
dotnet user-secrets init   # sudah ada UserSecretsId di csproj; aman dijalankan ulang
```

Set nilai (ganti placeholder):

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Port=5432;Database=postgres;Username=postgres;Password=...;SSL Mode=Require;Trust Server Certificate=true"
dotnet user-secrets set "Jwt:Key" "ganti-dengan-secret-panjang-minimal-32-karakter"
dotnet user-secrets set "Jwt:Issuer" "TaskManager"
dotnet user-secrets set "Jwt:Audience" "TaskManager"
```

SMTP (opsional; **rotate** dulu password yang pernah ter-commit):

```bash
dotnet user-secrets set "SmtpSettings:Host" "smtp.gmail.com"
dotnet user-secrets set "SmtpSettings:Port" "587"
dotnet user-secrets set "SmtpSettings:EnableSsl" "true"
dotnet user-secrets set "SmtpSettings:UserName" "email@gmail.com"
dotnet user-secrets set "SmtpSettings:Password" "app-password-baru"
```

Referensi bentuk nilai: `backend/secrets.example.json`.

## 3. Keamanan — action manual

- [ ] **Rotate** App Password Gmail yang pernah ada di `appsettings.json` (anggap sudah bocor)
- [ ] Buat JWT key baru (random, ≥ 32 karakter); jangan pakai key lama yang pernah di-commit
- [ ] Jangan commit `secrets.json`, `.env`, atau User Secrets store

## 4. Run API

```bash
cd backend/src/TaskManager.Api
dotnet run --launch-profile http
```

Atau dari solution:

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

> Catatan: sampai Fase 2 selesai, connection string masih boleh mengarah ke SQL Server lokal **atau** langsung ke Supabase Postgres setelah Npgsql dipasang.
