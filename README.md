# Kuis Backend Programming 1 - Sistem Undian Gacha

**Kuis Backend Semester II**

## Identitas Mahasiswa

- **Nama:** Elfrandt Goldjer
- **NIM:** 535250092
- **Fakultas:** Teknologi Informasi (FTI)
- **Universitas:** Universitas Tarumanagara (UNTAR)

---

### Aturan Gacha (Penjudi)

1. **Limit Harian:** Setiap user hanya diperbolehkan melakukan gacha maksimal **5 kali dalam 1 hari**. Jika melebihi kuota ini, sistem akan menolak request dan mengembalikan error.
2. **Kuota Hadiah:** Setiap hadiah memiliki kuota maksimal pemenang dalam 1 periode undian. Program secara _atomic_ memastikan jumlah pemenang tidak akan pernah melebihi kuota yang tersedia.
3. **Pencatatan Histori:** Sistem mencatat semua request gacha ke dalam database untuk keperluan pelacakan dan validasi limit harian.

---

## Daftar Hadiah & Kuota

Berikut adalah daftar hadiah yang diatur dalam database beserta kuota maksimalnya:

| No  | Hadiah            | Kuota Total |
| --- | ----------------- | ----------- |
| 1   | Emas 10 gram      | 1           |
| 2   | Smartphone X      | 5           |
| 3   | Smartwatch Y      | 10          |
| 4   | Voucher Rp100.000 | 100         |
| 5   | Pulsa Rp50.000    | 500         |

---

## Dokumentasi API

### 1. Fitur Utama (Gacha)

#### **Play Gacha**

Endpoint untuk melakukan satu kali penarikan undian gacha.

- **Method:** `POST`
- **Endpoint:** `/gacha/play`
- **Body Request (JSON):**

  ```json
  {
    "user_id": "65f1a2b3c4d5e6f7a8b9c0d1" // ObjectId dari user yang sedang login
  }

  Response Success (200 OK):JSON{
  "message": "Congratulations!",
  "prize": "Smartphone X"
  }
  (Jika tidak menang / zonk, nilai prize akan null dan message akan menyesuaikan).Response Error (422 Unprocessable Entity): Terjadi jika user telah melakukan gacha 5 kali pada hari yang sama.JSON{
  "error": "Gacha limit reached (Max 5 per day)"
  }
  ```

### 2. Fitur Bonus (Bonus Points)

#### **A. Gacha History**

Menampilkan riwayat seluruh gacha yang pernah dilakukan oleh seorang user tertentu beserta informasi hadiah yang dimenangkannya (jika ada).

- **Method:** `GET`
- **Endpoint:** `/gacha/history/:userId`
- **URL Parameter:** `userId` (ObjectId dari user yang ingin dilihat historinya).
- **Body Request:** Tidak ada.
- **Response (200 OK):** Array of objects berisi tanggal gacha dan nama hadiah.

---

#### **B. Prize List & Remaining Quota**

Menampilkan daftar seluruh hadiah yang tersedia dalam sistem beserta sisa kuota (_remaining quota_) untuk setiap hadiah.

- **Method:** `GET`
- **Endpoint:** `/gacha/prizes`
- **URL Parameter:** Tidak ada.
- **Body Request:** Tidak ada.
- **Response (200 OK):** Array of objects berisi `name`, `quota`, dan `remainingQuota`.

---

#### **C. Winner List (Masked Names)**

Menampilkan daftar semua user yang berhasil memenangkan hadiah. Nama user disamarkan secara acak demi privasi (misalnya `John Doe` menjadi `J*h* *o*`).

- **Method:** `GET`
- **Endpoint:** `/gacha/winners`
- **URL Parameter:** Tidak ada.
- **Body Request:** Tidak ada.
- **Response (200 OK):**
  ```json
  [
    {
      "prize": "Smartwatch Y",
      "winnerName": "E*f*a*d* G*l*j*r",
      "wonAt": "2026-04-17T10:30:00.000Z"
    }
  ]
  ```

### 3.Manajemen User

Selain fitur utama sistem undian gacha, API ini juga mewarisi fitur manajemen pengguna (User Management) dari template proyek bawaan. Fitur ini berfungsi untuk mengelola data pengguna secara penuh melalui operasi CRUD (Create, Read, Update, Delete), termasuk fitur keamanan dasar seperti penggantian kata sandi. Berikut adalah daftar endpoint yang dapat diakses untuk mengelola data user:

- **Mendapatkan Daftar Semua User**
  - **Endpoint:** `GET /users`
  - **Deskripsi:** Mengembalikan daftar seluruh pengguna yang terdaftar di dalam database.
- **Registrasi User Baru**
  - **Endpoint:** `POST /users`
  - **Deskripsi:** Mendaftarkan pengguna baru ke dalam sistem.
  - **Body (JSON):** Membutuhkan `email`, `password`, `full_name`, dan `confirm_password`. (Catatan: Password minimal 8 karakter).
- **Melihat Detail User**

  - **Endpoint:** `GET /users/:id`
  - **Deskripsi:** Menampilkan informasi detail dari satu pengguna spesifik.
  - **Parameter:** `id` (ObjectId pengguna yang terdaftar di database).

- **Memperbarui Profil User**
  - **Endpoint:** `PUT /users/:id`
  - **Deskripsi:** Memperbarui data nama lengkap atau email pengguna.
  - **Parameter:** `id` (ObjectId pengguna).
  - **Body (JSON):** Membutuhkan `email` dan `full_name` yang baru.
- **Mengganti Kata Sandi (Change Password)**
  - **Endpoint:** `PUT /users/:id/change-password`
  - **Deskripsi:** Memperbarui kata sandi pengguna dengan memvalidasi kata sandi lama terlebih dahulu.
  - **Parameter:** `id` (ObjectId pengguna).
  - **Body (JSON):** Membutuhkan `old_password`, `new_password`, dan `confirm_new_password`.
- **Menghapus User**
  - **Endpoint:** `DELETE /users/:id`
  - **Deskripsi:** Menghapus data pengguna dari database secara permanen.
  - **Parameter:** `id` (ObjectId pengguna).
