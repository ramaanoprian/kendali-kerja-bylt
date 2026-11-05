# Keamanan dan model data

Otorisasi bersumber dari `bylt_memberships`: organisasi, user, role, active. Tidak memakai metadata yang dapat diedit pengguna. Semua tabel publik BYLT RLS-enabled. Hak SELECT/INSERT/UPDATE/DELETE terpisah; tidak ada blanket ALL untuk authenticated.

Tugas, pendukung, checklist, komentar, lampiran, riwayat dan laporan memakai RPC untuk operasi yang perlu aturan server. UPDATE tugas langsung dicabut; `bylt_save_task` memeriksa role, keterlibatan, expected version dan same-organization foreign keys, mengisi author/timestamps/nomor, serta menulis history. Anggota melihat semua pekerjaan organisasi; edit hanya pembuat/PIC/pendukung. Viewer hanya SELECT. Admin boleh mengelola semua pekerjaan.

Tabel tim, bagian, kontak dan team membership mempunyai policy tulis khusus admin. Profile hanya boleh update name/reminders milik sendiri. Notifikasi hanya boleh update read_at milik sendiri. Keanggotaan hanya diubah RPC admin; admin terakhir dilindungi row lock organisasi. Riwayat dan snapshot final tidak memiliki izin UPDATE/DELETE untuk anggota/admin aplikasi.

Composite FK `(organization_id,id)` memastikan PIC/tim/bagian/task dan anak task tidak melintasi organisasi. Anggota target diverifikasi aktif pada operasi tugas. Bucket bylt-evidence privat, 20 MB, allowlist MIME; path org/task/uuid/file diperiksa terhadap tabel tugas. INSERT memerlukan hak edit; SELECT memerlukan keanggotaan aktif. Objek tidak dapat di-overwrite/delete melalui UI rutin. Tautan signed 60 detik.

Edge Function bylt-admin memvalidasi bearer token dengan `auth.getUser` secara eksplisit (gateway verify_jwt=false agar publishable key modern didukung), lalu RPC service-role memverifikasi admin dari database. Input email/name/role dan redirect origin divalidasi. Secret hanya di environment Edge. Tiket bootstrap acak minimal 256-bit, hash di schema private, berlaku singkat, sekali pakai, target organisasi/identitas dibatasi. Tidak ada self-registration yang otomatis memberi akses.

Timestamp `timestamptz`, server now(), konversi display Asia/Jakarta. Riwayat mengambil salinan before/after melalui trigger. Laporan historis mengambil state terakhir sampai batas akhir WIB; laporan current diberi label eksplisit. Finalisasi memvalidasi snapshot pratinjau agar tidak memasukkan perubahan baru diam-diam.

Draft terisolasi berdasarkan akun+org+task pada sessionStorage, tema di localStorage; logout membersihkan draft dan state. Tidak ada cache persisten pekerjaan. API mutation tidak diantrekan otomatis saat offline. Request UUID pada tugas/komentar/laporan, hash impor, dan path unggahan tetap untuk retry mengurangi duplikasi.

Aplikasi berbagi Supabase Auth dengan aplikasi dokbylt lama; hardening fungsi lama merupakan pekerjaan terpisah yang perlu audit sebelum organisasi menggunakan proyek bersama secara luas. Untuk isolasi penuh, migrasikan BYLT ke proyek tersendiri setelah biaya/provisioning disetujui.
