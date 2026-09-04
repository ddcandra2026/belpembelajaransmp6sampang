# Arah Desain Aplikasi Bel Pembelajaran

## Tiga Arah Awal

### Pendekatan 1 — Editorial Control Room
**Very Brief Intro:** Dashboard operator sekolah yang terasa seperti ruang kendali editorial: presisi, tenang, kontras, dan mudah dipindai dari jarak jauh. Data jadwal diberi hirarki visual yang jelas dengan aksen teal dan amber.

**Probability:** 0.07

### Pendekatan 2 — Cerah Akademik
**Very Brief Intro:** Antarmuka terang seperti stationery sekolah modern, memakai bidang kertas hangat, garis biru, dan modul jadwal yang terasa ramah namun tetap profesional. Fokus pada keterbacaan dan rasa familiar.

**Probability:** 0.04

### Pendekatan 3 — Neon Signal Desk
**Very Brief Intro:** Konsol waktu yang lebih teatrikal dengan latar gelap, sorotan neon, dan gelombang suara sebagai motif utama. Cocok untuk ruang operator yang redup dan mode layar penuh.

**Probability:** 0.02

## Pendekatan Terpilih: Editorial Control Room

### Design Movement
Neo-editorial utility: kedisiplinan layout dashboard operasional dipadukan dengan kualitas visual majalah dan stationery sekolah. Aplikasi harus terasa seperti alat kerja yang dibuat khusus, bukan template admin generik.

### Core Principles
1. **Scan before read:** Waktu sekarang, agenda berikutnya, dan status sistem selalu terbaca lebih dulu daripada detail lain.
2. **Quiet precision:** Permukaan terang, border tipis, dan bayangan lembut dipakai untuk memisahkan konteks tanpa membuat antarmuka ramai.
3. **Signal by color:** Navy untuk struktur dan kepercayaan, teal untuk aksi aktif, amber untuk momen yang akan datang atau membutuhkan perhatian.
4. **Operator confidence:** Setiap aksi penting memberi umpan balik yang ringkas, jelas, dan dapat dipulihkan melalui penyimpanan lokal.

### Color Philosophy
Navy tinta #102A56 menjadi fondasi karena selaras dengan identitas institusi dan tetap kuat pada layar operator. Teal #0C8292 menjadi warna sinyal tindakan dan status aktif, bukan dekorasi berlebihan. Amber #F2B544 dipakai untuk menandai waktu yang dekat, istirahat, dan agenda khusus. Latar ivory #F6F4EF memberi rasa kertas jadwal yang akrab, sementara panel putih menjaga kontrol tetap fokus.

### Layout Paradigm
Asymmetric operator desk: rail navigasi tipis di kiri, header status memanjang di atas, lalu hero waktu besar di sisi kiri dan “next event” di sisi kanan. Konten lanjutan memakai kolom utama untuk timeline dan kolom samping untuk health/status. Tidak semua elemen dipusatkan; ruang kosong menjadi jeda visual untuk pembacaan cepat.

### Signature Elements
- Garis timeline vertikal dengan node teal/amber yang menghubungkan jadwal.
- Numeral waktu besar dengan label kecil bergaya overline seperti lembar kerja editorial.
- Motif gelombang suara dan titik grid halus di permukaan latar.

### Interaction Philosophy
Interaksi terasa langsung dan dapat dipercaya. Tombol aksi utama selalu memiliki label yang menjelaskan hasil, bukan hanya ikon. Hover hanya mengangkat elemen sedikit; klik memberi kompresi singkat. Form jadwal dan suara menyimpan ke localStorage sehingga perubahan tidak hilang ketika tab ditutup.

### Animation
Entrance menggunakan opacity dan translate kecil dengan stagger singkat; tidak ada animasi dekoratif yang mengganggu jam. Status bel berikutnya memperbarui progress secara halus setiap detik. Modal/form muncul dari titik pemicunya dengan durasi di bawah 260ms. Semua motion non-esensial dimatikan pada prefers-reduced-motion.

### Typography System
Display: Space Grotesk 600/700 untuk angka waktu, heading, dan label utama. Body: IBM Plex Sans 400/500 untuk deskripsi, tabel, dan kontrol. Overline: IBM Plex Sans 600 dengan letter-spacing 0.14em dan huruf kapital. Hindari Inter agar identitas terasa lebih editorial dan teknis.

### Brand Essence
**Posisi:** Bel Pembelajaran untuk operator SMP Negeri 6 Sampang yang membutuhkan ritme sekolah terdengar tepat waktu, mudah diubah, dan mudah dipercaya. **Kepribadian:** presisi, hangat, sigap.

### Brand Voice
Headline singkat, tegas, dan membumi. CTA menyebutkan aksi nyata. Microcopy menjelaskan konsekuensi tanpa bahasa teknis yang berlebihan.

Contoh:
- “Ritme sekolah, siap dipantau.”
- “Simpan perubahan jadwal”

### Wordmark & Logo
Ikon utama berupa siluet bel geometris yang bertumpu pada bentuk buku terbuka, dengan satu aksen gelombang suara. Wordmark “BEL PEMBELAJARAN” ditampilkan dengan Space Grotesk bold dan detail garis bawah teal, bukan font default tanpa karakter.

### Signature Brand Color
**Signal Teal — #0C8292**, warna yang menandai bahwa sistem aktif, siap dipakai, dan sedang mengirim sinyal ke seluruh ruang sekolah.

## Style Decisions
- Gunakan permukaan ivory dan putih; jangan kembali ke gradien ungu atau kartu seragam dengan radius besar.
- Pertahankan layout asymmetric operator desk dengan rail kiri dan fokus waktu di area utama.
- Gunakan navy/teal/amber secara semantik: struktur, aksi, dan perhatian.
- Logo ikon transparan hanya untuk brand mark; jangan gunakan sebagai dekorasi berulang.
