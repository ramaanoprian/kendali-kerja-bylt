# Design system Kendali Kerja BYLT

## Arah desain dan referensi

Versi ini mengikuti arahan pemilik untuk UI/UX yang terinspirasi Stripe. Referensi Figma yang dibaca melalui konektor resmi: https://www.figma.com/design/D8BQjTo3kpz495YjzJkMQG/Untitled?node-id=1-3080. Halaman 0:1 memuat frame situs Stripe 1:3002; hero 1:3080 ditinjau melalui screenshot. Referensi langsung: https://stripe.com/, https://stripe.com/payments, dan https://docs.stripe.com/dashboard.

Tipografi besar, bidang warna diagonal, grid, teks navy, aksi ungu, garis halus, dan permukaan data yang terstruktur diadaptasi untuk pekerjaan BYLT. Identitas, bahasa, data, serta alur kerja tetap BYLT. Logo, ilustrasi komersial, font berlisensi, dan angka bisnis Stripe tidak dipakai.

## Struktur style

- `src/styles.css`: fondasi layout dan komponen aplikasi.
- `src/styles/tokens.css`: sumber token tema yang berlaku, diimpor sesudah fondasi.
- `src/styles/stripe.css`: tampilan komponen dan layout desktop/tablet/HP, diimpor terakhir.

| Kelompok | Token / nilai terang |
|---|---|
| Latar | `--bg: #f6f8fb`, `--surface: #ffffff`, `--surface-alt: #f7f9fc` |
| Teks | `--text: #182b49`, `--muted: #56657d`, `--faint: #64738a` |
| Aksi | `--blue: #5840d8`, `--blue-hover: #4830c0`, `--blue-soft: #eeeafb` |
| Semantik | hijau sukses, amber peringatan, merah bahaya, masing-masing dengan latar soft |
| Identitas | ungu utama; titik oranye kecil pada simbol BYLT |
| Font | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Ukuran | judul 27–30 px; login 36–66 px; bagian 16–18 px; isi 13–16 px; metadata lebih kecil sesuai ruang |
| Spacing | 4, 8, 12, 16, 20, 24, 32 px; margin desktop 36–48 px; HP 18 px |
| Radius | `--radius-sm: 6px`, `--radius: 10px`, `--radius-lg: 14px` |
| Border | `--line: #e3e8f0`, `--line-strong: #c9d2df` |
| Elevasi | `--shadow` permukaan, `--shadow-float` dialog; shadow halus |
| Motion | 180 ms; reduced-motion menghentikan animasi; rail tidak beranimasi saat viewport berubah |
| Layer | sidebar 30; tab HP 35; menu 45; toast 100; native dialog top layer |

Tema gelap mengganti semua token semantik dan permukaan. Tombol ungu pada gelap memakai warna yang memenuhi kontras teks putih. Ikon menggunakan Lucide. Angka grafik, progres, timestamp, dan tabel memakai tabular numerals.

## Alur dan komponen

`Button`: primary, secondary, ghost, danger. Kondisi hover, focus-visible, pressed, disabled, dan busy. Ikon tanpa teks memiliki aria-label. Kontrol sentuh utama minimal 44 px.

`Field`: label permanen, input/textarea/select native, pesan error dekat input, aria-invalid dan aria-describedby. Date/time, checkbox, dan range tetap memakai kontrol native. Pemilih anggota memakai select/checklist native.

`Badge`, `PriorityBadge`, `Avatar`, `Progress`: status memakai teks dan penanda selain warna. Progress menyediakan nilai untuk screen reader.

`WorkloadChart`: distribusi lima status dari tugas sesuai filter. Setiap kolom adalah tombol berlabel status dan jumlah, dapat digunakan dengan keyboard, serta membuka daftar yang sesuai. Grafik bukan tren historis. Tidak ada data grafik simulasi di luar mode contoh.

`Modal`: native dialog, fokus terkurung, Escape, dan pengembalian fokus. Center, wide, side panel; detail tugas penuh pada HP; filter memakai sheet. Draft dan penanganan konflik tetap menggunakan alur data yang sama.

`Filters`: preset dengan aria-pressed, pencarian, advanced filter, dan chip yang dapat dihapus. Preset memakai garis bawah aktif. Tabel/Kanban memiliki aria-pressed. Sidebar menyatakan halaman aktif lewat aria-current. Pencarian global mendukung Ctrl/Cmd+K.

Ringkasan: metrik dapat diklik; peta status; tugas perlu perhatian; tugas berjalan; aktivitas; komposisi hasil; distribusi anggota/tim; pintasan laporan. Pada HP, panel perlu perhatian didahulukan. Semua nilai berasal dari data ruang kerja dan mengikuti filter yang relevan.

Navigasi desktop menggunakan sidebar yang bisa diciutkan. Tablet memulai dengan rail ringkas saat dibuka langsung dan dapat diperluas; HP memakai lima tab berlabel serta menu tambahan. Pergantian tema tersedia pada toolbar dan Pengaturan, termasuk mengikuti sistem.

Login mengutamakan formulir, akses email/password, tautan email, pemulihan, dan penjelasan undangan. Ilustrasi alur pada desktop bersifat dekoratif, tidak menampilkan angka atau identitas operasional palsu. Versi HP menyederhanakan ilustrasi.

Loading, empty, error, offline, konflik, dan akses ditolak memakai komponen feedback yang sama. Sukses penyimpanan tetap memerlukan konfirmasi server; desain tidak mengubah autentikasi, izin, atau sinkronisasi.

## Verifikasi dan screenshot

Playwright menguji alur tugas, koordinasi, laporan, filter, kalender, navigasi, tema, fokus dialog, draft offline, dan URL Auth. Axe dijalankan pada ringkasan, pekerjaan, agenda, laporan, kontak untuk light/dark, serta login. Audit otomatis bukan jaminan kepatuhan WCAG menyeluruh atau pengganti uji pembaca layar manual.

Screenshot ada di `screenshots/`: login desktop/HP; ringkasan desktop/HP; tugas HP/tablet; tema gelap. Screenshot ruang kerja menggunakan mode contoh yang berlabel dan tidak menulis data ke database operasional.

## Revisi komposisi sesuai referensi

Komposisi final menggunakan `src/styles/reference.css` sebagai lapisan terakhir: halaman depan penuh dengan tipografi besar, grid putih bersekat, navigasi horizontal, serta formulir pada bagian akses. Gradasi, ilustrasi kartu, dan panel promosi gelap dihapus. Ruang kerja memakai metrik tanpa kartu, teks lebih besar, dan garis pemisah; panel perhatian mendahului grafik. Salinan slogan diganti dengan informasi pekerjaan yang konkret. Screenshot diperbarui dan 16 tes browser lulus setelah revisi.

## Motion & polish (November 2026)

Lapisan `src/styles/motion.css` diimpor paling akhir dan memuat seluruh gerak serta penyempurnaan visual. Logika gerak ada di `src/lib/motion.ts` (tanpa dependensi tambahan).

| Token | Nilai | Pemakaian |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | masuk halaman, daftar, progres |
| `--ease-spring` | `cubic-bezier(.22,1.25,.36,1)` | dialog, toast, ikon aktif |
| `--dur-1…4` | 140 / 240 / 420 / 720 ms | hover → masuk halaman |
| `--shadow-sm/md/lg` | bayangan berlapis | tombol, kartu terangkat, dialog |

- **Halaman masuk:** gradien bergerak bergaya Stripe (tiga lapisan blur yang digeser dengan `transform`), judul dengan teks gradien, dan pratinjau ruang kerja dekoratif (`aria-hidden`, tanpa angka atau identitas operasional). Bagian alur kerja dan formulir muncul saat di-scroll (`data-reveal`); tanpa JS, konten tetap terlihat.
- **Ruang kerja:** transisi antar-halaman (fade + naik 12px), daftar masuk bertahap, angka KPI dan persentase count-up (pembaca layar menerima nilai akhir), progress dan grafik mengisi, topbar kaca menempel di atas dengan bilah tipis saat menyimpan, status cloud berdenyut saat menyimpan dan "pop" saat tersimpan, toast dengan penanda sisa waktu, skeleton berkilau, dialog spring, panel samping meluncur, dan pergantian tema cross-fade melalui View Transitions API bila tersedia.
- **Micro-interaction:** tombol naik 1px saat hover dan mengecil saat ditekan; panah di tautan/tombol bergeser; kartu yang bisa dibuka terangkat.
- **Reduced motion:** `prefers-reduced-motion: reduce` menampilkan keadaan akhir tanpa gerak (termasuk count-up dan reveal).
- **Ukuran:** teks minimal 12px; target sentuh di HP minimal 44px; kalender HP memakai titik tenggat dan label jumlah pada tombol tanggal.
- **Pengujian:** audit axe dijalankan setelah animasi berhingga selesai (`tests/browser/settle.ts`), karena warna di tengah fade bukan kontras akhir yang dilihat pengguna.

### Putaran 2: navigasi dan tab

- **Pencarian cepat (⌘K / Ctrl+K):** palette ala Spotlight (`src/components/CommandPalette.tsx`) untuk membuka tugas (judul atau nomor BYLT), berpindah halaman, mencatat tugas, mengganti tema, dan membuka panduan. Dapat dioperasikan dengan ↑/↓, Enter, dan Esc. Di HP tersedia tombol cari pada topbar.
- **Tab dan baris yang bisa digeser:** preset pekerjaan, tab detail tugas, dan Kanban memberi bayangan di tepi yang masih menyimpan konten (`useScrollHint`), dan tab aktif digeser ke tengah. Garis bawah tab aktif tumbuh dari tengah.
- **Kanban:** lima kolom muat pada layar laptop 1366px; di layar sempit kolom menempel (scroll-snap) saat digeser.
- **Tabel pekerjaan:** nama Bagian hanya tampil bila sudah ditetapkan.
- **Mode contoh:** memuat bagian, kontak, dan notifikasi contoh agar seluruh halaman dapat ditinjau.

### Putaran 3: halaman masuk layar penuh

- Layar pertama mengisi seluruh viewport laptop (diuji 1280×720, 1366×768, 1440×900): panel ilustrasi malam di kiri dan formulir tanpa bingkai di kanan, sehingga formulir terlihat tanpa scroll.
- Ilustrasi `src/components/Locomotive.tsx`: siluet vektor orisinal lokomotif diesel kelas CC 205 mengikuti bentuk umumnya (kabin lebar dengan kaca depan miring dan lampu ganda di atap, hood panjang dengan pintu panel, kisi radiator belakang, peredam di belakang kabin, rangka bawah dalam, tangki BBM, dua bogie tiga gandar), tanpa logo atau livery operator, `aria-hidden`. Animasi di `src/styles/login.css`: lokomotif masuk dan mengerem dengan roda berputar, lalu idle dengan lampu depan berpendar dan asap. Reduced motion menampilkan posisi akhir tanpa gerak.
- Jam WIB langsung, poin fitur, dan bagian informasi di bawah layar pertama: delapan fitur, pratinjau ruang kerja, tiga langkah alur kerja dengan garis progres, dan jaminan data.
- Layar "Menyiapkan ruang kerja" memakai lokomotif yang sama.

### Putaran 4: ruang kerja setelah masuk

- **Header halaman ringkas** (`src/styles/workspace.css`): eyebrow disembunyikan (konteks sudah ada di breadcrumb), H1 30px. Konten mulai sekitar 85px lebih tinggi pada layar 1366×768, dan "Perlu perhatian" terlihat di layar pertama.
- **Ringkasan:** sapaan sesuai jam WIB dan kalimat ringkasan (perlu perhatian, terlambat, tenggat 7 hari). Kartu KPI kini berikon dengan konteks: komposisi EVP/rutin, tenggat berikutnya, persentase selesai; kartu "Perlu tindak lanjut" ditandai merah bila ada yang terlambat. Ada strip **Tenggat 7 hari ke depan** dan panel **Fokus Anda** (pekerjaan aktif Anda sebagai PIC/pendukung, urut tenggat).
- **Tenggat relatif** (`relativeDue`, `DueLabel`): "Hari ini, 16.00", "Besok", "3 hari lagi", "Terlambat 2 hari", dengan warna sesuai urgensi, di tabel, kartu HP, Kanban, Agenda, dan Ringkasan.
- **Sidebar:** tanda merek berupa siluet lokomotif mini, nama organisasi tidak lagi dobel, dan menu Agenda menampilkan lencana merah jumlah pekerjaan terlambat.
- **Agenda:** chip kalender berwarna sesuai status (berjalan, menunggu, belum mulai, terlambat), dengan judul lengkap di tooltip.
