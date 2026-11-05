# Backup dan pemulihan

## Cakupan yang berbeda

Backup Postgres memuat tabel, riwayat, akun/keanggotaan (sesuai metode backup), dan metadata objek Storage. **Isi berkas Storage tidak ikut hanya dengan backup database.** Cadangkan bucket `bylt-evidence` secara terpisah. Jangan menganggap paket menyediakan PITR atau retensi tertentu: periksa paket dan pengaturan proyek dokbylt di dashboard Supabase.

## Prosedur admin

1. Aktifkan backup database sesuai paket, jadwalkan verifikasi keberhasilan, dan catat retensi. Bila PITR tersedia/diaktifkan, catat rentang pemulihannya.
2. Ambil ekspor JSON organisasi secara berkala dari aplikasi sebagai salinan yang mudah ditinjau. Simpan terenkripsi dengan akses terbatas.
3. Untuk dump logis gunakan Supabase CLI resmi/pg_dump dengan koneksi database dari secret manager. Jangan menaruh connection string/password dalam Git, shell history, atau frontend. Sertakan seluruh dependensi skema `public.bylt_*` dan `bylt_private`, fungsi, sequence, trigger, RLS, Auth, serta konfigurasi yang diperlukan. Ikuti panduan CLI bila menyalin seluruh proyek; pemulihan Auth/Storage lintas proyek memerlukan perhatian khusus.
4. Salin objek bucket privat menggunakan API Storage atau S3 endpoint resmi jika tersedia pada konfigurasi proyek. Pertahankan path `organization/task/object/filename`; simpan manifest ukuran, hash, waktu dan metadata. Secret hanya pada proses server/admin.
5. Simpan migrasi, source commit, Edge Functions dan dokumentasi domain/redirect/scheduler bersama manifest backup.

## Latihan pemulihan

- Gunakan proyek pemulihan terisolasi yang biayanya telah disetujui. Jangan menimpa produksi untuk latihan.
- Pulihkan skema/data mengikuti panduan Supabase untuk metode backup yang dipakai.
- Pulihkan objek bucket dan cocokkan seluruh `bylt_attachments.path`, ukuran dan hash manifest.
- Pastikan bucket tetap privat, RLS aktif, privileges RPC benar, publication Realtime dan job `bylt-deadline-reminders` tersedia.
- Sesuaikan origin di Edge Function, Auth Redirect URLs, URL/key publik frontend.
- Verifikasi admin dapat masuk, anggota biasa/pemantau/akun tidak berizin mendapat hak yang sesuai, file privat dapat diunduh, snapshot final tetap utuh, sequence nomor tidak bertabrakan.
- Jalankan uji dua akun di proyek pemulihan, lalu catat RPO/RTO aktual. Latihan restore penuh belum dilakukan dalam penyerahan awal ini.

## Retensi dan penghapusan

Arsip aplikasi merupakan soft delete, bukan backup. Tidak ada pembersihan permanen otomatis. Kegagalan setelah upload sebelum pendaftaran metadata dapat meninggalkan objek orphan; pemeriksaan operator harus mencocokkan objek dengan metadata sebelum tindakan pembersihan. Jangan hapus berkas yang menjadi bukti laporan final.

Referensi: https://supabase.com/docs/guides/platform/backups dan https://supabase.com/docs/guides/storage.
