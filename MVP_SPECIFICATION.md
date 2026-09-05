# DOKUMEN SPESIFIKASI MVP (MINIMUM VIABLE PRODUCT)
## Project: Internal OCR Document Analyzer (Text Overlay System)
**Kategori:** Financial & Accounting Audit Tool  
**Dokumen:** Panduan Spesifikasi Implementasi Tahap 1 (MVP)  
**Target Lingkungan:** Localhost / Server Internal (100% Offline / Air-Gapped)  
**Versi:** 1.0.0 (MVP)  

---

## 1. PROJECT GOAL (TUJUAN MVP)

### 1.1 Fokus Tunggal MVP
Tujuan dari versi MVP (*Minimum Viable Product*) adalah membuktikan satu hipotesis teknis utama secara realistis:

> **"Apakah sistem dapat membaca teks dan angka dari foto dokumen hardcopy secara lokal (tanpa cloud AI) dan menampilkan hasil pembacaan tersebut tepat di atas posisi tulisan fisik aslinya sebagai layer interaktif yang dapat disalin?"**

### 1.2 Konsep Kunci
- **Image Asli (Base Layer):** Menampilkan citra dokumen yang diunggah (JPG/PNG) secara utuh tanpa modifikasi visual.
- **Text Overlay Layer (Interactive Layer):** Lapisan transparan/semi-transparan yang memetakan setiap kata dan angka hasil OCR tepat pada posisi koordinat aslinya, mirip konsep **Google Lens** atau **PDF Text Layer**.
- **Solusi Masalah Akuntansi:** Menghilangkan keharusan mengetik ulang angka faktur/nota secara manual ke Excel, sekaligus menjamin kerahasiaan data finansial perusahaan karena seluruh proses berjalan secara lokal.

---

## 2. MVP SCOPE (BATASAN RUANG LINGKUP)

### 2.1 Fitur yang Masuk Scope (WAJIB ADA di MVP)
1. **Upload Dokumen Tunggal:** Pengguna dapat mengunggah satu file gambar dokumen bisnis (format JPG atau PNG).
2. **Preprocessing Citra Dasar:** Pembersihan dasar menggunakan OpenCV (resize proporsional, konversi grayscale, dan peningkatan kontras).
3. **Ekstraksi OCR Lokal:** Inferensi lokal menggunakan PaddleOCR untuk membaca teks, angka, confidence score, dan koordinat bounding box.
4. **Interactive Text Overlay Viewer:**
   - Menampilkan gambar asli dokumen.
   - Menempatkan kotak teks hasil OCR tepat di atas tulisan aslinya.
   - Sinkronisasi skala koordinat saat gambar diperbesar/diperkecil (*responsive coordinate scaling*).
   - Fitur navigasi *Zoom* sederhana (Zoom In, Zoom Out, Reset Zoom).
   - Fitur *Click-to-Copy* untuk menyalin nilai teks langsung ke clipboard sistem.
5. **Panel Ringkasan Hasil OCR:** Menampilkan daftar seluruh teks yang terbaca beserta nilai tingkat keyakinan (*confidence score*).
6. **Penyimpanan Lokal Sederhana:** Menyimpan metadata dan hasil teks ke dalam database SQLite lokal.

### 2.2 Fitur yang TIDAK Masuk Scope (DITUNDA untuk Fase Berikutnya)
Untuk menjaga agar implementasi tahap pertama tetap cepat, terukur, dan tidak *over-engineered*, fitur berikut **DILARANG** dibuat pada tahap MVP:
- ❌ Sistem Autentikasi / Login / Registrasi / Multi-User
- ❌ Role-Based Access Control (RBAC)
- ❌ Database Enterprise (PostgreSQL / MySQL)
- ❌ Message Broker / Background Queue kompleks (Redis / Celery / RabbitMQ)
- ❌ Export otomatis ke file Microsoft Excel (`.xlsx`)
- ❌ Fitur koreksi teks tingkat lanjut (*inline text editor with change history*)
- ❌ Model AI lanjutan / Deep Learning khusus (LayoutLM, Donut, Vision LLM)
- ❌ Template builder untuk faktur
- ❌ Dashboard analitik atau reporting
- ❌ Pemrosesan multi-dokumen sekaligus (*batch upload*) atau file multi-halaman PDF

---

## 3. FUNCTIONAL REQUIREMENTS (KEBUTUHAN FUNGSIONAL)

### FR-1: Upload Citra Dokumen
- **FR-1.1:** Pengguna dapat mengunggah file citra melalui tombol *Browse* atau area *Drag-and-Drop*.
- **FR-1.2:** Sistem menerima file dengan ekstensi `.jpg`, `.jpeg`, dan `.png` dengan ukuran maksimal 15MB.
- **FR-1.3:** Sistem menampilkan indikator loading (*spinner/progress bar*) selama proses upload dan inferensi OCR berlangsung.

### FR-2: Preprocessing Citra Sederhana (OpenCV)
- **FR-2.1:** Sistem membaca citra asli yang diunggah dan menyimpannya di folder penyimpanan lokal.
- **FR-2.2:** Jika resolusi citra terlalu besar (lebar > 2000 piksel), sistem melakukan *resizing* proporsional untuk mengoptimalkan kecepatan inferensi OCR tanpa merusak keterbacaan teks.
- **FR-2.3:** Sistem mengonversi citra ke *grayscale* dan menerapkan penyesuaian kontras sederhana (CLAHE / Contrast Stretching) untuk memperjelas cetakan angka yang pudar.
- **FR-2.4:** Citra asli tetap dipertahankan untuk ditampilkan di frontend; citra hasil prapemrosesan hanya digunakan sebagai input untuk engine OCR.

### FR-3: Pemrosesan OCR (PaddleOCR Engine)
- **FR-3.1:** Sistem menjalankan model deteksi dan pengenalan teks PaddleOCR secara lokal.
- **FR-3.2:** Untuk setiap kata/baris teks yang ditemukan, sistem mengekstrak:
  - Teks string (`text`).
  - Nilai keyakinan (`confidence`, skala 0.00 hingga 1.00).
  - Koordinat posisi bounding box 4 titik: `[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]` atau format bounding box persegi `[x, y, width, height]`.
- **FR-3.3:** Sistem menghitung koordinat ternormalisasi (*normalized coordinates* 0.0 - 1.0) terhadap dimensi gambar asli agar posisi overlay selalu presisi pada berbagai resolusi layar.

### FR-4: Interactive Text Overlay Viewer
- **FR-4.1:** Frontend menampilkan gambar asli sebagai layer dasar (*background*).
- **FR-4.2:** Frontend merender layer transparan di atas gambar, di mana setiap token teks diposisikan pada koordinat piksel yang sesuai dengan gambar yang sedang ditampilkan.
- **FR-4.3:** Setiap kotak overlay memiliki efek visual:
  - Garis batas halus (*bounding box border*) semi-transparan.
  - Efek saat kursor diarahkan (*hover effect*): kotak berubah warna menjadi sedikit lebih tebal dan menampilkan tooltip berisi teks serta nilai confidence score.
- **FR-4.4 (Click-to-Copy):** Saat pengguna mengklik salah satu kotak teks di overlay, sistem menyalin teks tersebut ke clipboard dan memunculkan notifikasi kecil (*toast message*: "Teks berhasil disalin!").
- **FR-4.5 (Zoom Controls):** Tersedia tombol kontrol:
  - *Zoom In* (+25%)
  - *Zoom Out* (-25%)
  - *Reset Zoom* (Kembali ke ukuran Fit-to-Screen)
  - Posisi overlay teks harus tetap sinkron 100% dan tidak bergeser dari gambar saat di-zoom.

### FR-5: Panel Hasil OCR (Sidebar Result)
- **FR-5.1:** Menampilkan daftar semua baris teks yang terdeteksi dalam urutan baca (dari atas ke bawah).
- **FR-5.2:** Setiap item daftar menampilkan teks, confidence score, dan tombol salin cepat.
- **FR-5.3:** Ketika item pada daftar diklik, kotak overlay terkait pada gambar akan berkedip/tersorot (*highlight*) untuk mempermudah pengecekan silang.

---

## 4. NON-FUNCTIONAL REQUIREMENTS (KEBUTUHAN NON-FUNGSIONAL)

- **NFR-1 (Keamanan & Privasi Data):** Seluruh pemrosesan berjalan 100% pada mesin lokal (*localhost*). Tidak ada data, gambar, atau token teks yang dikirim ke server pihak ketiga atau internet publik.
- **NFR-2 (Kecepatan Pemrosesan):** Waktu respon dari saat upload hingga hasil overlay muncul di layar maksimal 4–7 detik untuk satu lembar dokumen pada prosesor CPU modern.
- **NFR-3 (Presisi Tampilan Overlay):** Posisi teks overlay tidak boleh bergeser lebih dari 3 piksel dari tulisan aslinya saat ditampilkan pada rasio zoom 100%.
- **NFR-4 (Kemudahan Menjalankan Project):** Backend dan frontend dapat dijalankan secara lokal menggunakan perintah standar (`uvicorn` untuk Python, `npm run dev` untuk React).

---

## 5. TECHNOLOGY STACK

```
+-------------------------------------------------------------+
| LAYER           | TEKNOLOGI              | FUNGSI           |
+-------------------------------------------------------------+
| Frontend Client | React.js 18 + Vite     | UI & Overlay     |
| Backend API     | Python 3.10+ & FastAPI | REST API & Core  |
| Image Processing| OpenCV (cv2) + NumPy   | Preprocessing    |
| OCR Engine      | PaddleOCR (PP-OCRv4)   | Local Inference  |
| Database        | SQLite 3               | Local Persistence|
| Communication   | HTTP / JSON REST API   | Client-Server    |
+-------------------------------------------------------------+
```

### Justifikasi Pemilihan Stack MVP:
1. **React + Vite:** Pilihan tercepat untuk rendering interaktif DOM/SVG, sangat responsif untuk sinkronisasi koordinat posisi overlay teks saat zoom/pan.
2. **FastAPI (Python):** Framework REST API modern dengan performa tinggi, async bawaan, dan integrasi mulus dengan pustaka AI/Computer Vision berbasis Python.
3. **PaddleOCR:** Engine OCR lokal terbaik untuk mengenali angka finansial, tabel rapat, dan dokumen bisnis tanpa memerlukan konfigurasi GPU khusus.
4. **OpenCV:** Standar industri untuk manipulasi citra cepat dan efisien.
5. **SQLite:** Database serverless bawaan Python yang tidak membutuhkan instalasi service tambahan, sangat ideal untuk prototipe lokal.

---

## 6. MVP ARCHITECTURE

### 6.1 Diagram Alur Sederhana

```
+-----------------------------------------------------------------------------+
| FRONTEND CLIENT (React + Vite)                                              |
|                                                                             |
|  [Upload Form]                                                              |
|         | (Kirim File Gambar multipart/form-data)                           |
|         v                                                                   |
|  [REST API Request] ---------------------------------------------+          |
|                                                                  |          |
|  [Interactive Overlay Canvas] <-------------------------------+  |          |
|  (Render Gambar + Layer Teks Bounding Box)                    |  |          |
|                                                               |  |          |
|  [Sidebar List]                                               |  |          |
|  (Tampilkan Teks & Nilai Confidence)                          |  |          |
+---------------------------------------------------------------|--|----------+
                                                                |  |
                                             JSON Hasil OCR     |  | HTTP POST
                                             (Text, Box, Conf)  |  |
                                                                v  v
+-----------------------------------------------------------------------------+
| BACKEND API (FastAPI)                                                       |
|                                                                             |
|  1. Ingestion: Terima file gambar -> Simpan ke folder /storage/uploads/     |
|                                                                             |
|  2. Preprocessing (OpenCV):                                                 |
|     - Buka gambar via cv2                                                   |
|     - Resize proporsional jika lebar > 2000px                               |
|     - Grayscale & Contrast Enhancement (CLAHE)                              |
|     - Simpan versi proses ke /storage/preprocessed/                         |
|                                                                             |
|  3. OCR Extraction (PaddleOCR):                                             |
|     - Jalankan inferensi pada citra hasil proses                            |
|     - Ekstrak: text, confidence, [x1, y1, x2, y2, x3, y4]                   |
|     - Konversi koordinat ke format rasio ternormalisasi (0.0 - 1.0)         |
|                                                                             |
|  4. Persistence (SQLite):                                                   |
|     - Catat data dokumen ke tabel `documents`                               |
|     - Catat daftar token ke tabel `ocr_results`                             |
|                                                                             |
|  5. Response Builder:                                                       |
|     - Kembalikan payload JSON lengkap ke Frontend                           |
+-----------------------------------------------------------------------------+
```

### 6.2 Kontrak API MVP (REST API Specification)

#### Endpoint 1: Upload & Process Dokumen
- **Method:** `POST`
- **URL:** `/api/documents/process`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file`: File gambar (`image/jpeg`, `image/png`)
- **Response Format (JSON):**
```json
{
  "document_id": "doc_1718239401",
  "file_name": "faktur_pembelian.jpg",
  "image_url": "/api/documents/doc_1718239401/image",
  "image_width": 1200,
  "image_height": 1600,
  "total_tokens": 4,
  "processing_time_sec": 2.45,
  "ocr_results": [
    {
      "id": 1,
      "text": "PT ABC INDONESIA",
      "confidence": 0.985,
      "box": {
        "x": 150,
        "y": 120,
        "width": 320,
        "height": 40
      },
      "normalized_box": {
        "x_min": 0.125,
        "y_min": 0.075,
        "x_max": 0.391,
        "y_max": 0.100
      }
    },
    {
      "id": 2,
      "text": "No Faktur: 742",
      "confidence": 0.992,
      "box": {
        "x": 150,
        "y": 180,
        "width": 190,
        "height": 30
      },
      "normalized_box": {
        "x_min": 0.125,
        "y_min": 0.112,
        "x_max": 0.283,
        "y_max": 0.131
      }
    },
    {
      "id": 3,
      "text": "Tanggal: 16 Juni 2007",
      "confidence": 0.978,
      "box": {
        "x": 150,
        "y": 230,
        "width": 240,
        "height": 30
      },
      "normalized_box": {
        "x_min": 0.125,
        "y_min": 0.143,
        "x_max": 0.325,
        "y_max": 0.162
      }
    },
    {
      "id": 4,
      "text": "Total: 19.020.000",
      "confidence": 0.994,
      "box": {
        "x": 150,
        "y": 300,
        "width": 280,
        "height": 45
      },
      "normalized_box": {
        "x_min": 0.125,
        "y_min": 0.187,
        "x_max": 0.358,
        "y_max": 0.215
      }
    }
  ]
}
```

#### Endpoint 2: Get Gambar Asli
- **Method:** `GET`
- **URL:** `/api/documents/{document_id}/image`
- **Response:** File gambar murni (`image/jpeg` atau `image/png`) untuk dirender di tag `<img>` frontend.

---

## 7. FOLDER STRUCTURE (STRUKTUR DIREKTORI PROJECT)

Rancangan struktur folder rapi, modular, dan memisahkan tugas frontend dan backend:

```
d:/OCR/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point FastAPI & konfigurasi CORS
│   │   ├── config.py            # Konfigurasi path storage & parameter OCR
│   │   ├── database.py          # Setup engine SQLite & session SQLAlchemy
│   │   ├── models.py            # Definisi model ORM tabel SQLite
│   │   ├── schemas.py           # Skema Pydantic untuk validasi request & response
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── preprocessor.py  # OpenCV: resize, grayscale, contrast enhancement
│   │   │   └── ocr_engine.py    # Inisialisasi & pemanggilan PaddleOCR
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── documents.py     # Endpoint upload, proses OCR, dan serve file gambar
│   ├── storage/
│   │   ├── uploads/             # Tempat penyimpanan citra asli dokumen
│   │   └── preprocessed/        # Tempat penyimpanan citra hasil filter OpenCV
│   ├── requirements.txt         # Daftar pustaka Python backend
│   └── app_database.sqlite      # File database lokal SQLite
│
├── frontend/
│   ├── src/
│   │   ├── assets/              # Ikon dan aset statis
│   │   ├── components/
│   │   │   ├── Uploader.jsx         # Area drag-and-drop & tombol upload
│   │   │   ├── OverlayViewer.jsx    # Komponen utama: Gambar + Layer Teks Overlay
│   │   │   ├── ZoomControls.jsx     # Tombol navigasi Zoom In, Zoom Out, Reset
│   │   │   └── ResultsSidebar.jsx   # Panel samping daftar teks & confidence
│   │   ├── services/
│   │   │   └── api.js               # Fungsi Axios/Fetch untuk memanggil API backend
│   │   ├── App.jsx                  # Komponen induk (pengelola state utama)
│   │   ├── main.jsx                 # Entry point React
│   │   └── index.css                # Styling CSS (layouting, overlay coordinates, hover)
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── TECHNICAL_SPECIFICATION.md    # Dokumen arsitektur lengkap (Fase Enterprise)
└── MVP_SPECIFICATION.md          # Dokumen panduan implementasi tahap pertama (File Ini)
```

### Penjelasan Fungsi Folder Utama:
- **`backend/app/services/`:** Memisahkan logika computer vision (`preprocessor.py`) dan AI OCR (`ocr_engine.py`) agar mudah diganti atau diuji secara independen.
- **`backend/storage/`:** Menyimpan file fisik di disk lokal, memisahkan citra asli yang tidak boleh diubah dengan citra sementara hasil preprocessing.
- **`frontend/src/components/OverlayViewer.jsx`:** Komponen inti frontend tempat perhitungan koordinat absolut dan pemetaan kotak teks di atas gambar berlangsung.

---

## 8. DATA FLOW (ALUR DATA END-TO-END)

```
[1. User Action]
     |
     +--> Membuka aplikasi di browser (http://localhost:5173).
     +--> Memilih/drag file foto faktur (contoh: faktur_742.jpg).
     |
[2. Frontend Ingestion]
     |
     +--> Mengemas file ke FormData.
     +--> Mengirim HTTP POST ke backend http://localhost:8000/api/documents/process.
     |
[3. Backend Storage & Preprocessing]
     |
     +--> FastAPI menerima file, membuat `document_id` unik berbasis timestamp.
     +--> Menyimpan file asli ke `backend/storage/uploads/{doc_id}.jpg`.
     +--> OpenCV membaca gambar:
            1. Mengambil dimensi asli (Width, Height).
            2. Melakukan resize jika lebar > 2000px.
            3. Mengubah ke grayscale & meningkatkan kontras via CLAHE.
            4. Menyimpan ke `backend/storage/preprocessed/{doc_id}.jpg`.
     |
[4. Local OCR Processing]
     |
     +--> PaddleOCR membaca citra dari folder preprocessed.
     +--> Menghasilkan array bounding box, teks string, dan skor confidence.
     +--> Backend menghitung rasio koordinat ternormalisasi `(x / Width, y / Height)`.
     |
[5. Database Persistence]
     |
     +--> Menyimpan record dokumen ke tabel `documents`.
     +--> Menyimpan seluruh daftar token ke tabel `ocr_results`.
     |
[6. Response Delivery]
     |
     +--> Backend merespon frontend dengan payload JSON hasil OCR lengkap.
     |
[7. Frontend Overlay Rendering]
     |
     +--> Frontend menerima JSON.
     +--> Mengatur `src` tag <img> ke URL gambar asli.
     +--> Setelah gambar selesai dimuat (*onLoad*), frontend membaca ukuran elemen gambar aktual di layar.
     +--> Frontend me-looping setiap token dan membuat elemen `<span class="overlay-box">`:
            top    = token.normalized_box.y_min * renderedHeight
            left   = token.normalized_box.x_min * renderedWidth
            width  = (token.normalized_box.x_max - token.normalized_box.x_min) * renderedWidth
            height = (token.normalized_box.y_max - token.normalized_box.y_min) * renderedHeight
     |
[8. User Interaction]
     |
     +--> Auditor melihat teks menempel tepat di atas gambar dokumen.
     +--> Mengklik teks "19.020.000" -> otomatis tersalin ke clipboard.
     +--> Mengklik tombol zoom untuk melihat detail dokumen lebih dekat.
```

---

## 9. DATABASE MVP (RANCANGAN SQLITE SEDERHANA)

Menggunakan 2 tabel sederhana pada SQLite:

```
+--------------------+            +-----------------------------------+
|     documents      |            |            ocr_results            |
+--------------------+            +-----------------------------------+
| id (TEXT PK)       | 1 ------ < | id (INTEGER PK AUTOINCREMENT)     |
| file_name (TEXT)   |            | document_id (TEXT FK)             |
| file_path (TEXT)   |            | token_text (TEXT)                 |
| image_width (INT)  |            | confidence (REAL)                 |
| image_height (INT) |            | box_x (REAL)                      |
| created_at (TEXT)  |            | box_y (REAL)                      |
+--------------------+            | box_width (REAL)                  |
                                  | box_height (REAL)                 |
                                  | norm_x_min (REAL)                 |
                                  | norm_y_min (REAL)                 |
                                  | norm_x_max (REAL)                 |
                                  | norm_y_max (REAL)                 |
                                  +-----------------------------------+
```

### Script DDL SQLite:
```sql
-- Tabel Dokumen
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    image_width INTEGER NOT NULL,
    image_height INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Hasil Token OCR
CREATE TABLE IF NOT EXISTS ocr_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    token_text TEXT NOT NULL,
    confidence REAL NOT NULL,
    box_x REAL NOT NULL,
    box_y REAL NOT NULL,
    box_width REAL NOT NULL,
    box_height REAL NOT NULL,
    norm_x_min REAL NOT NULL,
    norm_y_min REAL NOT NULL,
    norm_x_max REAL NOT NULL,
    norm_y_max REAL NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ocr_doc_id ON ocr_results(document_id);
```

---

## 10. DEVELOPMENT MILESTONES (TAHAPAN PENGERJAAN MVP)

Pengembangan MVP dibagi menjadi 5 milestone terukur:

### Milestone 1: Lingkungan & Core Pipeline Backend (Target: 1-2 Hari)
- Inisialisasi struktur direktori backend dan virtual environment Python.
- Instalasi dependensi (`fastapi`, `uvicorn`, `opencv-python-headless`, `paddlepaddle`, `paddleocr`).
- Pembuatan script verifikasi bahwa PaddleOCR lokal dapat membaca citra dokumen sampel via terminal.

### Milestone 2: API Endpoints & Penyimpanan SQLite (Target: 1 Hari)
- Setup database SQLite dan model ORM SQLAlchemy.
- Implementasi modul `preprocessor.py` (OpenCV CLAHE dan Grayscale).
- Pembuatan endpoint `POST /api/documents/process` dan endpoint serving gambar `GET /api/documents/{id}/image`.

### Milestone 3: Inisialisasi Frontend & Form Upload (Target: 1 Hari)
- Inisialisasi project React menggunakan Vite.
- Pembuatan komponen `Uploader.jsx` dengan drag-and-drop dan loading state.
- Menghubungkan frontend ke endpoint API upload.

### Milestone 4: Implementasi Core Feature: Text Overlay Viewer (Target: 2 Hari)
- Pembuatan komponen `OverlayViewer.jsx`:
  - Tag `<img>` untuk menampilkan gambar asli.
  - Perhitungan konversi koordinat ternormalisasi ke ukuran piksel kontainer aktual.
  - Layer overlay teks interaktif dengan styling border dan hover.
- Implementasi fitur *Click-to-Copy* menggunakan Clipboard API browser.
- Implementasi navigasi *Zoom* (Zoom In, Zoom Out, Reset).

### Milestone 5: Sidebar Hasil & Pengujian Dokumen Sampel (Target: 1 Hari)
- Pembuatan komponen `ResultsSidebar.jsx` yang menampilkan daftar teks dan confidence score.
- Pengujian end-to-end menggunakan beberapa sampel nyata dokumen akuntansi (faktur, kwitansi, nota belanja).
- Validasi bahwa seluruh proses berjalan 100% tanpa internet.

---

## 11. FUTURE IMPROVEMENT (ROADMAP SETELAH MVP)

Setelah MVP berhasil membuktikan fungsionalitas inti, pengembangan dilanjutkan mengikuti roadmap strategis berikut:

- **Phase 1: OCR Overlay Prototype (Fokus MVP Saat Ini)**  
  Membuktikan pembacaan teks lokal dan visualisasi text overlay interaktif dengan fitur copy teks.

- **Phase 2: Peningkatan Akurasi Menggunakan OpenCV Lanjutan**  
  Menambahkan fitur koreksi kemiringan otomatis (*automatic deskewing* via Hough Transform) dan koreksi sudut miring (*perspective warp*) untuk dokumen yang difoto miring.

- **Phase 3: Confidence Visualization & Inline Correction**  
  Memberikan pewarnaan visual dinamis (hijau untuk confidence > 90%, kuning 75-90%, oranye < 75%) dan memungkinkan auditor mengedit teks yang salah dibaca langsung pada kanvas overlay.

- **Phase 4: Document Understanding (Heuristic & Regex Parsing)**  
  Ekstraksi otomatis field kunci akuntansi (Nomor Faktur, Tanggal Transaksi, Nama PT, Total Rupiah) berdasarkan kedekatan koordinat spasial (*proximity clustering*) dan pola format Indonesia.

- **Phase 5: Export Excel & Workflow Audit**  
  Pembuatan generator Microsoft Excel (`.xlsx`) otomatis dengan format angka akuntansi terstruktur, batch processing multi-dokumen, serta migrasi ke database enterprise PostgreSQL.

---

## STATUS SAAT INI
Dokumen spesifikasi ini adalah acuan resmi implementasi tahap pertama. Sesuai instruksi:
- **Belum ada kode aplikasi yang dibuat.**
- **Belum ada gambar atau mockup visual yang digenerate.**
- Sistem siap diimplementasikan developer kapan pun tahap coding disetujui.
