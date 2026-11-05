# Ringkasan pengujian — 31 Oktober 2026

## Hasil yang benar-benar dijalankan

- Build TypeScript dan Vite produksi: lulus.
- 25 pengujian otomatis: 21 integrasi PostgreSQL terisolasi melalui PGlite dan 4 validasi/domain.
- 8 pengujian browser Playwright Chromium: lulus. Browser menggunakan mode contoh yang terpisah dari cloud.
- 8 pemeriksaan langsung API Supabase produksi tanpa autentikasi: lulus. Rincian HTTP tersedia dalam `hasil-api-produksi.json`.
- Screenshot desktop 1440px, tablet 820px, HP 390px, login, dan dark mode di folder `screenshots`.
- Audit Axe WCAG 2 AA/2.1 AA/2.2 AA pada dashboard terang dan gelap: tidak ada pelanggaran otomatis yang terdeteksi dalam cakupan tersebut.
- Migrasi diterapkan ke dokbylt, bucket privat dan publication Realtime dikonfigurasi, job pengingat setiap 15 menit dijadwalkan.

## Bukti database terisolasi

Pengujian membuat data fixture tanpa kredensial login di database lokal sementara. Data fixture tidak dimasukkan ke organisasi operasional. Pemeriksaan mencakup:

1. Nomor/author/history server dan idempotensi pembuatan.
2. Pembacaan pekerjaan bersama oleh anggota aktif.
3. Penolakan UPDATE langsung dan edit oleh anggota yang tidak terlibat.
4. Pencegahan eskalasi peran dan perubahan riwayat.
5. Edit oleh pendukung; optimistic concurrency dengan versi stale ditolak.
6. Syarat status Menunggu, hasil aktual Selesai, progres 100%, waktu selesai, dan alasan membuka kembali.
7. Penolakan PIC/pendukung dari organisasi lain.
8. Snapshot final tidak berubah, serta finalisasi atas pratinjau kedaluwarsa ditolak.
9. Arsip/pemulihan, komentar/mention tanpa duplikasi.
10. Pemantau hanya baca; akun luar tidak dapat membaca tugas/laporan atau ekspor organisasi.
11. Anggota nonaktif langsung kehilangan akses pada pemeriksaan DB.
12. Admin terakhir tidak dapat dinonaktifkan/didemotasi.
13. Izin Storage berdasarkan organisasi dan keterlibatan tugas.
14. Impor berulang dilewati, kesalahan baris dilaporkan.
15. Pengingat backend memakai dedupe key.

## Bukti browser

Pencatatan cepat → membuka detail → checklist → komentar → hasil aktual → selesai → arsip → Undo; pencarian/filter/Kanban/kalender; pratinjau dan finalisasi laporan; penambahan tim; preferensi gelap; draft saat offline; fokus dialog/Escape; layout tanpa overflow pada 390/820/1440px; audit Axe light/dark.

## Yang belum terbukti di produksi

**Sinkronisasi cloud dua akun belum dinyatakan selesai.** Belum ada dua sesi login nyata Rama dan Nadia yang dioperasikan bersamaan. Tidak ada kata sandi pengguna yang diminta atau disimpan oleh pembuat aplikasi. Pemeriksaan SQL dan mode contoh tidak menggantikan uji tersebut.

Checklist penerimaan bersama setelah kedua pengguna masuk:

- Rama mencatat tugas berlabel UJI PENERIMAAN dengan Nadia sebagai PIC. Nadia melihatnya di perangkat lain.
- Nadia memperbarui progres; Rama melihat pembaruan tanpa reload dan tanpa kehilangan draft.
- Keduanya membuka tugas versi sama, lalu menyimpan berurutan. Penyimpanan kedua harus meminta peninjauan konflik.
- Logout/login ulang pada kedua akun; data tetap tersedia. Uji jendela privat/perangkat lain.
- Unggah PDF/foto kecil; unduh dari akun anggota; coba tautan tanpa login, lewat URL bucket public, dan setelah akses dinonaktifkan.
- Admin nonaktifkan Nadia sementara setelah persetujuan internal; API harus menolak akses, kemudian aktifkan kembali.
- Finalisasi laporan, perbarui tugas, lalu buka final lama untuk membandingkan snapshot.
- Periksa email undangan/pemulihan benar-benar diterima, redirect tepat, dan sesi aman.
- Arsipkan tugas uji setelah verifikasi; jangan mencampurnya dengan laporan operasional.

## Batas implementasi yang perlu diketahui

- Tidak ada offline penuh, background sync, PWA offline, pengingat email/push, atau ekspor XLSX native. CSV dapat dibuka Excel; PDF melalui dialog cetak browser.
- Tabel melakukan pagination 10 baris di frontend setelah mengambil data berizin secara bertahap dari server. Untuk puluhan ribu tugas, pindahkan pencarian/pagination/agregasi ke query server terindeks. Belum ada uji beban skala besar.
- Pengingat terjadwal tersedia di backend; pengiriman nyata kepada pengguna bertenggat belum diuji end-to-end. Preferensi memengaruhi reminder tenggat.
- Sesi browser menggunakan sessionStorage, sehingga menutup sesi tab dapat mengharuskan login ulang. Draft akun dibersihkan saat logout. Jangan logout sebelum menyalin draft yang belum terkirim.
- Realtime fallback polling 30 detik; pencabutan hak DB segera, cache UI dibersihkan pada refresh/fokus/poll. Tautan Storage yang sudah ditandatangani berumur maksimum 60 detik.
- Riwayat lama dari impor adalah provenance, bukan bukti status historis terverifikasi. Laporan historis hanya memakai riwayat server setelah aplikasi dipakai.
- Impor ulang byte-identik tidak menggandakan data. File yang direvisi memiliki hash baru dan perlu ditinjau agar tidak menggandakan entri sumber.
- Kanban mendukung pembaruan melalui detail, tanpa drag-and-drop. Pemilih anggota native belum memiliki pencarian fuzzy.
- Audit aksesibilitas belum mencakup semua halaman, pembaca layar, semua browser, dan semua tingkat pembesaran; tidak ada klaim sertifikasi WCAG menyeluruh.
- Restore database + isi Storage penuh belum dilatih. Panduan tersedia di BACKUP-PEMULIHAN.md.

## Catatan advisor Supabase

Seluruh tabel BYLT yang diekspos memiliki RLS. RPC `SECURITY DEFINER` sengaja dapat dipanggil pengguna authenticated dengan pemeriksaan role/keanggotaan di dalam fungsi dan `search_path=''`; anonymous tidak mendapat execute. Tiket bootstrap privat menggunakan deny-by-default tanpa policy dan hanya dikonsumsi RPC service-role.

Advisor proyek juga mencatat temuan **aplikasi yang sudah ada**, antara lain search_path pada current_user_name/record_label, pg_net di public, dan log_record_change dapat dipanggil anon. Tidak diubah karena di luar tabel BYLT. Proteksi kata sandi bocor tingkat proyek belum aktif. Admin dapat meninjaunya pada [Supabase database advisor](https://supabase.com/docs/guides/database/database-linter) dan [password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Perbaikan pengalihan Auth — 1 November 2026

Pengujian endpoint `/auth/v1/verify` dengan token sengaja tidak valid dan tanpa mengikuti redirect menemukan:

- Origin BYLT tanpa slash terakhir diarahkan ke Site URL lama `https://dokumenbylt.my.id/`.
- Root BYLT dengan slash terakhir diterima dan diarahkan ke `https://kendali-kerja-bylt.ramanoprian73.chatgpt.site/`.
- Root dengan query `?recovery=1` tidak cocok dengan konfigurasi aktif dan kembali ke Site URL lama.

Seluruh undangan, magic link dan pemulihan kini memakai root BYLT persis dengan slash terakhir, tanpa query tambahan. Maksud pemulihan dibaca dari callback Auth/PASSWORD_RECOVERY, bukan query redirect. Tautan kedaluwarsa menampilkan petunjuk meminta tautan baru. Site URL aplikasi dokumen tidak diubah. Pengujian ini memastikan pemilihan alamat tujuan, bukan verifikasi login pengguna dari inbox.

## Verifikasi domain kendalibylt.my.id — 2 November 2026

- DNS: kedua alamat IPv4 hosting sesuai; tidak ada AAAA yang mengarah ke tempat lain; kedua TXT verifikasi sesuai.
- Hosting: status domain, provider, dan SSL active setelah refresh dan publikasi versi 4.
- HTTP HTTPS root: 200, judul Kendali Kerja BYLT, aset versi yang diharapkan.
- Supabase Auth verify dengan token sengaja tidak valid dan redirect root baru: 303 kembali ke https://kendalibylt.my.id/. Tidak ada email atau akun uji yang dibuat untuk probe ini.
- Pengujian login anggota sebenarnya pada domain baru masih perlu dilakukan oleh pemilik akun. Keberhasilan allowlist dan HTTP bukan bukti login anggota atau sinkronisasi dua akun.

## Perubahan UI/UX dengan referensi Stripe — 2 November 2026

Referensi Figma pemilik ditinjau melalui metadata dan screenshot hero. Situs stripe.com, stripe.com/payments, dan docs.stripe.com/dashboard dibaca langsung sebagai referensi tambahan. UI mencakup login baru, tema terpusat, navigasi ungu/navy, ringkasan terstruktur, grafik kategori dari data aktual, shortcut laporan, tema toolbar, filter underline, tabel dan dialog yang konsisten.

- Build TypeScript/Vite berhasil.
- 16 pengujian Playwright lulus: alur tugas, checklist, komentar, penyelesaian, arsip/pulih, filter/Kanban, kalender, snapshot laporan, pengaturan, draft offline, keyboard dialog, responsivitas, URL Auth, grafik status, dan pintasan laporan.
- Axe WCAG A/AA: ringkasan, pekerjaan, agenda, laporan, kontak pada light/dark; halaman login. Temuan kontras tombol dark diperbaiki, demikian juga overflow dekorasi login HP.
- Screenshot diperbarui untuk desktop, tablet, HP, dan tema gelap. Data screenshot berlabel mode contoh.
- Kalender diuji terhadap jumlah hari bulan berjalan di Asia/Jakarta, menggantikan asumsi tetap 31 hari.
- Sidebar tidak bergeser saat pergantian viewport. HP mendahulukan panel perlu perhatian; tablet dapat memperluas/menciutkan sidebar.
- Backend Auth, RLS, Storage, Realtime, dan struktur data tidak diubah dalam pekerjaan desain ini. Pengujian UI mode contoh bukan bukti sinkronisasi dua akun nyata.

Audit otomatis tidak menggantikan uji manual pembaca layar atau menjamin seluruh WCAG 2.2 AA.
