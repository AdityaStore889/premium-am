# AM Generator Premium

Website aktivasi Alight Motion Premium menggunakan API DapjiSync.

---

## 📁 Struktur File

```
am-generator/
├── index.html      → Struktur halaman
├── style.css       → Tampilan / desain
├── script.js       → Logika & koneksi API
├── vercel.json     → Konfigurasi deploy Vercel
├── netlify.toml    → Konfigurasi deploy Netlify
└── README.md       → Panduan ini
```

---

## 🚀 Deploy ke Vercel (Gratis)

1. Daftar / login di [vercel.com](https://vercel.com)
2. Klik **Add New → Project**
3. Pilih **"Deploy from Git"** atau klik **"Import Third-Party Git"**
   - Kalau belum pakai Git: pilih **"Upload"** lalu upload folder ini
4. Biarkan semua setting default → klik **Deploy**
5. Selesai! Kamu dapat domain `namaproject.vercel.app`

> File `vercel.json` sudah terkonfigurasi otomatis, tidak perlu setting tambahan.

---

## 🚀 Deploy ke Netlify (Gratis)

### Cara 1 — Drag & Drop (Paling Mudah)
1. Buka [app.netlify.com](https://app.netlify.com)
2. Login / daftar
3. Di halaman utama, scroll ke bawah → ada kotak **"Drag and drop your site folder here"**
4. Drag folder `am-generator` ke kotak tersebut
5. Selesai! Kamu dapat domain `random-name.netlify.app`

### Cara 2 — Via Git
1. Push folder ini ke GitHub/GitLab
2. Di Netlify: **Add new site → Import an existing project**
3. Hubungkan repo kamu → klik **Deploy**

> File `netlify.toml` sudah terkonfigurasi otomatis.

---

## ✏️ Cara Rename / Kustomisasi

### Ganti Nama Website
Buka `index.html`, cari dan ganti:

| Teks Lama | Ganti Jadi |
|---|---|
| `AM Generator Premium` | Nama websitemu |
| `Aktivasi Alight Motion Premium · Langsung Pakai` | Tagline kamu |
| `© 2026 <span>AM Generator Premium</span>` | Nama & tahunmu |

> Pakai Ctrl+H (Find & Replace) di teks editor agar lebih cepat.

### Ganti Nomor WhatsApp
Buka `index.html`, cari:
```html
href="https://wa.me/6285134750953?text=..."
```
Ganti `6285134750953` dengan nomormu (format internasional, tanpa +).
Contoh: `08123456789` → `628123456789`

### Ganti API / API Key
Buka `script.js`, edit bagian paling atas:
```js
const API_BASE = "https://am.dapjisync.my.id";
const API_KEY  = "FREE";
```

### Ganti Warna Tema
Buka `style.css`, edit di bagian `:root`:
```css
--accent: #0a0a0a;        /* warna tombol utama */
--success: #059669;       /* warna hijau sukses */
```

---

## ⚙️ Cara Kerja Sistem

User hanya perlu **2 hal**: Email + Magic Link (URL dari email).

**JobId diambil otomatis dari Magic Link** — user tidak perlu input manual.

| Step | Endpoint | Fungsi |
|---|---|---|
| 1 | `POST /api/send` | Kirim magic link ke email target |
| 2 | `POST /api/verif` | Verifikasi → aktifkan premium 1 tahun |

Base URL: `https://am.dapjisync.my.id`

---

## ❓ Ada Masalah?

Hubungi owner lewat tombol WhatsApp di website.
