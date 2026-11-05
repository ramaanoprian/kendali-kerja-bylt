# Deployment dan penyerahan

Alamat domain utama: https://kendalibylt.my.id/

Alamat hosting sebelumnya: https://kendali-kerja-bylt.ramanoprian73.chatgpt.site/

Domain `https://kendalibylt.my.id/` memiliki DNS yang sesuai, status domain dan SSL active, serta Auth Redirect URL yang diterima Supabase per 2 November 2026. Ikuti [panduan domain](DOMAIN.md).

Frontend dipublikasikan melalui HTTPS. Halaman login dapat dibuka publik sesuai pilihan pemilik; data BYLT tetap memerlukan Supabase Auth dan keanggotaan aktif.

Proyek Supabase: dokbylt (`mvxceyvbiehxeolfxslw`). Tabel aplikasi BYLT memakai awalan `bylt_`; tabel aplikasi lama tidak diubah. Admin awal Rama Noprian (75054@kai.id) menggunakan akun yang sudah ada. Supabase Auth menerima permintaan undangan untuk Nadia Carolina (77466@kai.id); penerimaan di kotak email dan konfirmasi pengguna belum diverifikasi.

Pemilik telah mengonfirmasi penambahan URL frontend ke Auth Redirect URLs. Site URL aplikasi lama tidak perlu diganti. Jangan memasukkan service-role key pada frontend.

Pemeriksaan HTTP produksi menghasilkan 200, tidak ada error JavaScript, dan tidak ada overflow horizontal pada viewport HP 390 px. Screenshot produksi menggunakan mode contoh yang berlabel jelas. Tidak ada pekerjaan contoh yang dimasukkan ke database operasional.

Pengujian sinkronisasi dua akun nyata masih membutuhkan login Rama dan Nadia, mengikuti checklist di PENGUJIAN.md. Status pengujian ini tidak dapat disimpulkan dari screenshot, build berhasil, atau mode contoh.
