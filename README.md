# DSC Photobox API (Bun + Express + Drizzle)

Repositori backend untuk aplikasi DSC Photobox menggunakan Bun runtime, Express, dan Drizzle ORM.

## Persyaratan Awal
Sebelum menjalankan proyek, pastikan komputer Anda telah terinstal:
1. **Git**
2. **Docker Desktop**

---

## Panduan Menjalankan Proyek dengan Docker Compose

Teman Anda atau anggota tim baru cukup mengikuti langkah-langkah di bawah ini untuk menjalankan backend di komputer mereka:

### Langkah 1: Clone Repositori
Clone proyek ini dari GitHub ke komputer lokal:
```bash
git clone https://github.com/Ibrhm1/api-dsc-photobox.git
cd api-dsc-photobox/api-backend-bun
```

### Langkah 2: Konfigurasi Environment (`.env`)
Salin file contoh konfigurasi `.env.example` menjadi `.env`:
* **Windows (Command Prompt / Git Bash):**
  ```bash
  cp .env.example .env
  ```
* Buka file `.env` yang baru dibuat dan isi variabel kredensial Anda (koneksi database Supabase, API Key, dll).
* *Catatan:* Nilai `REDIS_URL` di `.env` bisa dibiarkan kosong karena Docker Compose akan otomatis menggunakan Redis lokal (`redis://redis:6379`).

### Langkah 3: Jalankan Docker Compose
Jalankan perintah berikut untuk mengunduh, membuat image, dan menghidupkan seluruh kontainer di background:
```bash
docker compose up --build -d
```

### Langkah 4: Akses Aplikasi
* **API Endpoint:** `http://localhost:3000`
* **Dokumentasi Swagger (API Docs):** `http://localhost:3000/api-docs`

---

## Perintah Docker Compose yang Sering Digunakan

* **Melihat Log Aplikasi secara Real-time:**
  ```bash
  docker compose logs -f app
  ```
* **Mematikan Seluruh Kontainer:**
  ```bash
  docker compose down
  ```
* **Merestart Kontainer:**
  ```bash
  docker compose restart
  ```

---

## Troubleshooting (Penyelesaian Masalah)

### Error `failed to copy: ... EOF` saat Pulling Image
Jika teman Anda di Indonesia mengalami error koneksi putus saat Docker mengunduh image base dari Docker Hub, gunakan Google Container Registry Mirror dengan langkah berikut:
1. Buka **Docker Desktop** -> Klik **Settings (Ikon Gear)** -> Pilih **Docker Engine**.
2. Tambahkan properti `"registry-mirrors": ["https://mirror.gcr.io"]` ke dalam JSON.
3. Klik **Apply & restart**, lalu jalankan ulang `docker compose up --build -d`.

