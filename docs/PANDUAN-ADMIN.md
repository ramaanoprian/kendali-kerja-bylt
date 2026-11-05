# Panduan admin

1. Buka aplikasi melalui HTTPS. Masuk memakai akun Supabase yang telah diundang. Admin awal: Rama Noprian, 75054@kai.id. Akun yang sudah ada tidak diganti kata sandinya.
2. Pada Pengaturan → Tim kerja, buat nama kedua tim sesuai penetapan yang berlaku. Pilih Anggota untuk menempatkan beberapa anggota pada masing-masing tim. Anggota boleh berada pada lebih dari satu tim.
3. Pada Pengaturan → Bagian, isi nama bagian resmi. Pada Kontak bagian, isi nama, peran, bagian, telepon, email opsional, dan catatan koordinasi.
4. Pada Pengaturan → Anggota, pilih Undang anggota. Isi nama asli, email dan peran. Anggota baru memperoleh akses setelah mengonfirmasi email. Undangan yang gagal terkirim ditandai gagal dan dapat dicoba kembali. Akun email yang sudah ada memperoleh keanggotaan tanpa mengganti kata sandi.
5. Gunakan peran Anggota tim kerja untuk pelaksana; Pimpinan/pemantau untuk akses baca. Hanya admin mengubah peran/menonaktifkan anggota. Minimal satu admin aktif wajib ada.
6. Penonaktifan langsung memengaruhi pemeriksaan database dan Storage. UI menghapus data yang tidak lagi dapat dibaca saat menerima pembaruan, kembali fokus, atau polling 30 detik. Tautan berkas yang sudah ditandatangani dapat berlaku hingga 60 detik.
7. Arsipkan tugas dari detail. Gunakan Urungkan pada toast atau Arsip pekerjaan → Pulihkan. Tidak tersedia penghapusan permanen rutin.
8. Ekspor JSON organisasi dari Pengaturan → Data & migrasi. Isi lampiran dicadangkan secara terpisah.

## Impor

Berkas maksimal 5 MB, maksimal 500 tugas dan 500 kontak per impor. Struktur menerima `tasks`/`tugas`, `contacts`/`kontak`, `history`/`riwayat` berupa array. Petakan judul, jenis, status, tenggat, progres dan hasil aktual. Tetapkan tim dan PIC tujuan. Validasi → pratinjau → konfirmasi → simpan. Hasil menampilkan jumlah berhasil, duplikat, dan error per baris; unduh laporan hasil bila diperlukan.

Status standar: `todo`, `doing`, `waiting`, `done`, `cancelled` atau label Indonesia. Jenis: `evp`/`routine` atau label Indonesia. Menunggu membutuhkan alasan dan pihak; selesai membutuhkan hasil aktual; dibatalkan membutuhkan alasan. Gunakan ISO 8601 dengan offset +07:00 untuk tanggal lokal.

Dedup berdasarkan SHA-256 berkas dan identitas/baris sumber. Berkas byte-identik yang diimpor ulang dilewati. Berkas yang diubah memperoleh hash baru: tinjau kemungkinan duplikasi sebelum mengimpor revisi berkas lama. Impor bukan alat pemulihan penuh database; owner/pembuat baru mengikuti transaksi impor, riwayat lama disimpan sebagai provenance nonotoritatif.

## Kanal notifikasi

Notifikasi di dalam aplikasi: penugasan/PIC, perubahan tenggat, mention, mendekati tenggat dan terlambat. Scheduler pg_cron berjalan setiap 15 menit meskipun browser ditutup. Dedupe key menghindari pengingat berulang untuk tenggat yang sama. Preferensi menonaktifkan pengingat tenggat, bukan mention/penugasan.

Email digunakan oleh Supabase Auth untuk undangan, tautan masuk dan pemulihan. Pengiriman/deliverability bergantung konfigurasi SMTP dan rate limit proyek. Pengingat pekerjaan melalui email/push belum tersedia. Laporan tidak dikirim otomatis ke EVP.

## Alamat pengalihan email

Allowlist produksi harus memuat URL root persis `https://kendali-kerja-bylt.ramanoprian73.chatgpt.site/` (termasuk slash terakhir). Kode selalu mengirim root ini untuk undangan, tautan masuk, dan pemulihan. Jangan menghapus slash atau menambahkan query redirect; rute kata sandi ditentukan melalui event Auth setelah tautan diverifikasi. Tautan email yang terlanjur dikirim membawa tujuan lama: kirim tautan masuk baru dari aplikasi setelah perbaikan, lalu gunakan email terbaru.

Untuk domain baru, ikuti [pengaturan domain](DOMAIN.md) dan tambahkan `https://kendalibylt.my.id/` ke Redirect URLs. Tautan mengikuti domain tempat pengguna membuka aplikasi; backend undangan menerima root BYLT yang diizinkan dan menolak tujuan lainnya. Domain dan HTTPS terverifikasi active pada 2 November 2026.
