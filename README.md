# 📰 Portal Berita

**Portal Berita** adalah aplikasi web fullstack yang memungkinkan pengguna untuk membaca dan mengelola berita. Aplikasi ini dibangun menggunakan **React** di sisi frontend dan **Express.js** di sisi backend, serta menggunakan **MySQL** sebagai database dan **JWT** untuk autentikasi.

---

## 📁 Struktur Proyek

portal-berita/
├── FrontEnd/ # Proyek frontend (React + Vite)
├── BackEnd/ # Proyek backend (Express.js + MySQL)
└── README.md # Dokumentasi proyek

---

## 🚀 Teknologi yang Digunakan

### Frontend

- [React](https://reactjs.org/) 
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React-Icons](https://react-icons.github.io/react-icons/)
- [React-router-dom](https://www.npmjs.com/package/react-router-dom)
- [ChartJs](https://www.chartjs.org/)
- [Date-nfs](https://date-fns.org/)
- [Axios](https://axios-http.com/)
- [News-API](https://newsapi.org/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT (JSON Web Token)](https://jwt.io/)
- [BycriptJs](https://www.npmjs.com/package/bcryptjs)
- [Multer](https://www.npmjs.com/package/multer)
- [Cors](https://www.npmjs.com/package/cors)
- [Body-parser](https://www.npmjs.com/package/body-parser)
- [Dote-env](https://www.npmjs.com/package/dotenv)

### Database

- [MySQL](https://www.mysql.com/)
---

---

## 🗃️ Struktur Database

Berikut adalah tabel-tabel utama dalam database `portal_berita` beserta kolom-kolomnya:

---

### 🔐 `admin`

| Kolom      | Tipe Data        | Keterangan             |
|------------|------------------|------------------------|
| id_admin   | int (PK, AI)     | ID unik admin          |
| username   | varchar(10)      | Username admin         |
| password   | varchar(255)     | Password hash          |

---

### 📁 `category`

| Kolom      | Tipe Data        | Keterangan               |
|------------|------------------|--------------------------|
| id_category| int (PK, AI)     | ID kategori              |
| name       | varchar(100)     | Nama kategori berita     |

---

### 🗞️ `news`

| Kolom      | Tipe Data        | Keterangan                   |
|------------|------------------|------------------------------|
| id_news    | int (PK, AI)     | ID berita                    |
| title      | varchar(255)     | Judul berita                 |
| description| text             | Isi berita                   |
| category   | varchar(20)      | Kategori berita              |
| create_by  | varchar(30)      | Nama pembuat/admin           |
| url_photo  | text             | URL gambar berita            |
| create_at  | date             | Tanggal pembuatan            |

---

### 💬 `comments`

| Kolom      | Tipe Data        | Keterangan                           |
|------------|------------------|--------------------------------------|
| id_comment | int (PK, AI)     | ID komentar                          |
| id_user    | int (FK)         | ID user yang memberi komentar        |
| content    | text             | Isi komentar                         |
| news_url   | text             | URL berita yang dikomentari          |
| create_at  | timestamp        | Waktu dibuat                         |

---

### 👍 `likes`

| Kolom      | Tipe Data        | Keterangan                           |
|------------|------------------|--------------------------------------|
| id         | int (PK, AI)     | ID like/dislike                      |
| id_users   | int (FK)         | ID user                              |
| id_news    | varchar(512)     | ID/URL berita                        |
| value      | tinyint(1)       | 1 untuk like, 0 untuk dislike        |
| created_at | timestamp        | Waktu dibuat                         |
| updated_at | timestamp        | Waktu diperbarui                     |

---

### 🧑‍🤝‍🧑 `users`

| Kolom      | Tipe Data        | Keterangan                           |
|------------|------------------|--------------------------------------|
| id_users   | int (PK, AI)     | ID pengguna                          |
| username   | varchar(100)     | Username                             |
| password   | varchar(255)     | Password hash                        |
| create_at  | date             | Tanggal registrasi                   |

---

### 📝 `ulasan`

| Kolom      | Tipe Data        | Keterangan                           |
|------------|------------------|--------------------------------------|
| id_ulasan  | int (PK, AI)     | ID ulasan                            |
| id_user    | int (FK)         | ID pengguna yang memberi ulasan      |
| username   | varchar(50)      | Nama pengguna                        |
| email      | varchar(100)     | Email pengguna                       |
| subject    | text             | Subjek ulasan                        |
| message    | text             | Isi ulasan                           |
| create_at  | timestamp        | Tanggal/waktu ulasan                 |

---

**Keterangan:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `AI` = Auto Increment

---

## 🔧 Cara Menjalankan Proyek

### 🛢️ Database (MySQL)
1. Buka aplikasi XAMPP
2. Pilih start pada `Apache` dan `MySQL`

---

### 📦 Backend (Express.js)

1. Masuk ke folder `BackEnd`
2. Buat file `.env` dan isi dengan konfigurasi seperti:
   ```env
   PORT=portlocal
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=portal_berita
   JWT_SECRET=your_jwt_secret
   API_KEY=yout_api_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan server:
   ```bash
   node server.js
   ```
   Backend akan berjalan di `http://localhost:5000`

---

### 🌐 Frontend (React)

1. Masuk ke folder `FrontEnd`
2. Buat file `.env` dan isi dengan:
   ```env
   VITE_NEWS_API_KEY=your_api_key
   ```
3. Lalu buka folder src dan buat file `config.js` dan isi dengan:

   ```config.js
   export const API_BASE_URL=`localport samakan dengan backend`

   ```

4. Install dependencies:
   ```bash
   npm install
   ```
5. Jalankan server React:
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:5173`

---

## 📌 Fitur

- 🔒 Autentikasi pengguna menggunakan JWT (login, logout, proteksi route)
- 🗞️ Menampilkan berita berdasarkan kategori dari API eksternal maupun lokal
- 💬 Pengguna dapat menulis komentar pada artikel berita
- 👍👎 Fitur like dan dislike untuk berita
- 🧑‍💼 Panel admin untuk mengelola berita lokal (CRUD)
- 🔄 Pengguna dapat mengubah username mereka
- 🎨 Tampilan modern dan responsif menggunakan Tailwind CSS
- 🌐 Komunikasi antara frontend dan backend menggunakan Axios

---

[User Login] → [Frontend: Kirim username & password ke /login]
→ [Backend: Verifikasi user → Buat JWT token]
→ [Kirim token ke frontend → Simpan di localStorage]
→ [Setiap request API berikutnya pakai Authorization: Bearer <token>]
