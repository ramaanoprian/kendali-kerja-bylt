# Domain Kendali Kerja BYLT

Alamat yang dipilih pemilik: `https://kendalibylt.my.id/`.

Pada 2 November 2026 domain kendalibylt.my.id berhasil diverifikasi. Kedua record A dan kedua record TXT sesuai. Status domain, provider, dan SSL pada hosting adalah **active**. Supabase menerima redirect root baru: probe dengan token sengaja tidak valid mengembalikan 303 ke https://kendalibylt.my.id/. Ini memverifikasi allowlist, bukan login anggota sebenarnya.

## DNS Domainesia

Buka pengelolaan domain **kendalibylt.my.id**, lalu DNS Management. Tambahkan record berikut. Nama di tabel relatif terhadap zona kendalibylt.my.id. TTL gunakan default dan Priority kosong. Simpan setiap record melalui Save Changes.

| Tipe | Host Name | Address |
|---|---|---|
| A | `@` | `162.159.143.30` |
| A | `@` | `172.66.3.26` |
| TXT | `_openai-site-verification` | `openai-site-verification=xc2LUXHAWIerBB1xRcanKLYaijbg55bRmA5_UsLHI8c` |
| TXT | `_cf-custom-hostname` | `e7f8a5f5-c1eb-4b56-86c0-8faf85ee7e7d` |

Gunakan kedua record A untuk domain utama. Record CNAME untuk root tidak diperlukan. Jika domain baru berisi record A/AAAA bawaan parkir pada @, sesuaikan agar hanya target hosting di atas yang dipakai untuk web; pertahankan record email seperti MX. Jangan menerapkan tabel ini pada domain dokumenbylt.my.id.

ID domain Sites: `appgdom_6ae7f8fe866c8191b9617a8b0737c897`. Setelah DNS menyebar, refresh status domain. Jika penerbit sertifikat memberi record validasi tambahan, pasang persis seperti hasil layanan. Tunggu domain dan SSL aktif, lalu uji HTTPS tanpa mengabaikan kesalahan sertifikat. Domain www tidak didaftarkan pada langkah ini.

## Supabase

Proyek dokbylt → Authentication → URL Configuration → Redirect URLs: tambahkan root persis `https://kendalibylt.my.id/`, termasuk slash terakhir. Pertahankan entri BYLT lama selama transisi. Site URL dokumenbylt.my.id tetap digunakan oleh aplikasi dokumen.

Frontend menggunakan origin halaman untuk tautan masuk, pemulihan, dan undangan. Edge Function bylt-admin menerima root kendalibylt.my.id dan root BYLT sebelumnya secara eksplisit, menolak tujuan lain, serta memastikan slash terakhir. Bootstrap admin awal sudah selesai; default bootstrap masih memakai URL BYLT lama yang aktif.

## Verifikasi sesudah pengaturan

1. Pastikan registrasi domain Active, DNS benar, status domain Sites dan SSL aktif.
2. Uji Auth verify dengan token sengaja tidak valid dan redirect_to=https://kendalibylt.my.id/. Tujuan error harus kembali ke domain baru; tes ini bukan bukti login nyata.
3. Buka halaman login pada laptop dan HP. Pastikan permintaan tautan masuk/pemulihan memakai root baru.
4. Minta tautan email baru dan verifikasi login akun anggota sebenarnya.
5. Uji undangan oleh admin dari domain baru. Sesi browser terpisah antar-origin; masuk kembali diperlukan.

Perubahan domain menggunakan database, Storage, dan keanggotaan yang sama. URL lama tetap menjadi akses sementara sampai domain baru terverifikasi. Subdomain kerja.dokumenbylt.my.id yang sebelumnya disiapkan tidak menjadi tujuan migrasi; konfigurasi DNS lama itu tidak perlu dilanjutkan.

## Pemeriksaan implementasi

20 tes terkait URL Auth dan batas tujuan undangan lulus. Tes ini mencakup root lama/baru yang diizinkan serta penolakan URL HTTP, domain peniru, userinfo, path, dan query redirect. Pengujian domain baru secara penuh masih menunggu DNS dan konfigurasi Auth.

Koreksi nama domain: konfigurasi kendalibylt.id yang sebelumnya disiapkan tidak digunakan. Gunakan hanya record pada panduan ini untuk kendalibylt.my.id.
