# Kendali Kerja BYLT

Ruang koordinasi Tim Kerja UPT Balai Yasa Lahat. React + TypeScript + Supabase Auth, Postgres, Realtime, Storage privat, dan Edge Functions. UI berbahasa Indonesia, waktu Asia/Jakarta, timestamp database `timestamptz` dari server.

## Menjalankan sumber kode

```sh
npm ci
cp .env.example .env.local
# Isi URL Supabase dan publishable key (bukan service-role key).
npm run dev
npm run build
npm test
# Jalankan server lokal pada terminal terpisah, kemudian:
npx playwright install chromium
npm run test:e2e
```

Konfigurasi publik proyek dokbylt disertakan sebagai fallback pada `src/lib/config.ts`. Environment dapat menggantikannya. Tidak ada secret/service-role key dalam frontend atau Git. Sesi Auth berada di sessionStorage; preferensi tema di localStorage; draft dipisah per akun, organisasi, dan tugas. Data operasional bersumber dari database, bukan localStorage.

## Struktur

- `src/components`: kontrol reusable, filter, detail tugas dan kolaborasi.
- `src/pages`: login, ringkasan, tugas/Kanban, agenda, laporan, kontak, pengaturan.
- `src/lib`: tipe domain, validasi, Supabase, akses data, orkestrasi sesi dan Realtime.
- `supabase/migrations`: seluruh skema, RLS, RPC, Storage, scheduler, bootstrap aman.
- `supabase/functions/bylt-admin`: undangan oleh admin, dengan verifikasi JWT via `auth.getUser()` dan pemeriksaan keanggotaan database.
- `supabase/functions/bylt-bootstrap`: penerimaan tiket bootstrap acak sekali pakai, terbatas waktu dan target. Tidak ada endpoint untuk mendaftar sendiri sebagai admin.
- `tests`: pengujian SQL menggunakan PostgreSQL terisolasi (PGlite), domain, dan browser Playwright.
- `screenshots`: screenshot aplikasi nyata dengan **data contoh**, bukan data operasional.
- `docs`: panduan, design system, keamanan, backup, hasil pengujian.

## Deployment

Frontend dibangun statis di `dist`, disajikan melalui HTTPS oleh Sites. `.openai/hosting.json` menyimpan identitas proyek deployment. Produksi menggunakan publishable key. Edge Functions memakai `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `SUPABASE_ANON_KEY` bawaan runtime Supabase; tidak dikirim ke browser.

Jalankan migrasi secara berurutan dengan Supabase CLI untuk proyek baru. Migrasi scheduler mengasumsikan `pg_cron` tersedia. Pada proyek dokbylt ekstensi ini sudah tersedia. Migrasi bootstrap menyediakan mekanisme tiket, **tidak otomatis membuat admin**. Penetapan admin pertama dilakukan operator lewat SQL administratif dengan email nyata yang telah diverifikasi.

Tambahkan origin frontend beserta `/**` pada Authentication → URL Configuration → Redirect URLs. Jangan mengganti Site URL aplikasi lain dalam proyek yang sama. Origin yang diizinkan untuk undangan pada Edge Function harus diperbarui bila domain deployment berubah.

## Batas pengujian

Lihat `docs/PENGUJIAN.md`. Pengujian antarmuka menggunakan data contoh di memori, bukan bukti sinkronisasi produksi. Uji dua akun cloud membutuhkan login nyata Rama dan Nadia. Tidak ada kata sandi pengguna yang diminta atau dibuat. Aplikasi tidak menjanjikan operasi offline penuh.

## Referensi resmi

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Auth redirects](https://supabase.com/docs/guides/auth/redirect-urls)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
