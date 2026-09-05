# ATURAN PENGEMBANGAN & STANDAR KODE (CODING RULES)
## Project: Internal OCR Document Analyzer (Text Overlay System)
**Kategori:** Financial & Accounting Audit Tool  
**Dokumen:** Developer Coding Standards & Behavioral Guidelines  
**Target Lingkungan:** 100% On-Premise / Localhost (Air-Gapped Ready)  
**Versi:** 1.0.0 (Mandatory Compliance)  

---

## DAFTAR ISI
1. [Project Principle (Prinsip Dasar Proyek)](#1-project-principle)
2. [Development Approach (Pendekatan Pengembangan)](#2-development-approach)
3. [Technology Rules (Batasan & Larangan Teknologi)](#3-technology-rules)
4. [Code Structure Rules (Standar Struktur & Organisasi Kode)](#4-code-structure-rules)
5. [OCR Implementation Rules (Aturan Implementasi OCR)](#5-ocr-implementation-rules)
6. [Frontend Overlay Rules (Aturan Lapisan Overlay)](#6-frontend-overlay-rules)
7. [Security & Data Privacy Rules (Aturan Keamanan Data)](#7-security--data-privacy-rules)
8. [Testing & Quality Assurance Rules (Aturan Pengujian)](#8-testing--quality-assurance-rules)
9. [AI Assistant Working Rules (Aturan Kerja AI Assistant)](#9-ai-assistant-working-rules)
10. [Definition of Done MVP (Kriteria Penyelesaian)](#10-definition-of-done-mvp)

---

## 1. PROJECT PRINCIPLE

Seluruh aktivitas pengembangan harus berlandaskan pada 4 prinsip utama berikut:

1. **Fokus Tunggal pada OCR Text Overlay System:**
   - Tujuan utama aplikasi adalah menampilkan hasil pembacaan teks dan angka secara presisi tepat di atas gambar asli (*Image Asli + Text Overlay Layer*).
2. **Prioritas Akurasi dan Presisi Koordinat:**
   - Prioritas nomor satu adalah **akurasi pembacaan angka finansial** dan **ketepatan posisi bounding box**. Tampilan visual yang indah tidak ada artinya jika angka salah dibaca atau posisi kotak overlay meleset.
3. **Anti-Scope Creep (No Premature Enterprise Features):**
   - Dilarang mengimplementasikan fitur enterprise (otentikasi user, role management, microservices, container cluster, message broker eksternal, atau LLM) sebelum versi MVP selesai dan terverifikasi.
4. **100% Pemrosesan Lokal (Zero Cloud Dependency):**
   - Sistem harus dapat dioperasikan penuh pada komputer tanpa koneksi internet. Kerahasiaan data keuangan perusahaan adalah batasan non-negosiasi.

---

## 2. DEVELOPMENT APPROACH

1. **Pengembangan Berbasis Milestone:**
   - Pengerjaan kode harus mengikuti urutan tahapan pada `DEVELOPMENT_CHECKLIST.md` (Milestone 0 hingga Milestone 6).
   - **Selesaikan satu milestone secara penuh** dan verifikasi kriteria penerimaannya (*acceptance criteria*) sebelum memulai milestone berikutnya.
2. **Setiap Fitur Harus Memiliki Tujuan Jelas:**
   - Jangan menulis kode spekulatif (*speculative coding* / "siapa tahu nanti butuh"). Tulis kode hanya untuk memenuhi kebutuhan spesifikasi saat ini (*YAGNI: You Aren't Gonna Need It*).
3. **Patuhi Batasan MVP:**
   - Jangan menambahkan fungsionalitas di luar yang tertera pada `MVP_SPECIFICATION.md` tanpa persetujuan eksplisit.
4. **Perubahan Terukur (Incremental Progress):**
   - Lakukan commit kode secara bertahap untuk setiap unit pekerjaan yang selesai dan berfungsi.

---

## 3. TECHNOLOGY RULES

### 3.1 Stack yang Ditetapkan (Mandatory Stack)
Developer dan AI Assistant wajib menggunakan stack resmi berikut:

- **Frontend Client:** React.js (v18+) di-build menggunakan **Vite**.
- **Backend API:** Python (v3.10+) menggunakan framework **FastAPI**.
- **OCR Engine:** **PaddleOCR** (PP-OCRv4).
- **Image Processing:** **OpenCV** (`opencv-python-headless`) dan **NumPy**.
- **Database:** **SQLite 3** (melalui SQLAlchemy ORM).
- **Komunikasi:** REST API standar (JSON & Multipart/form-data).

### 3.2 Larangan Keras (Strictly Prohibited)
Untuk menjaga integritas keamanan dan privasi data akuntansi internal:
- ❌ **Dilarang menggunakan Cloud OCR API:** Google Cloud Vision, AWS Textract, Azure Cognitive Services, Baidu Cloud API, dll.
- ❌ **Dilarang menggunakan Layanan AI Publik:** OpenAI API (ChatGPT), Anthropic API (Claude), Google Gemini API, dll.
- ❌ **Dilarang menggunakan tool konversi online atau library yang mengirim telemetry:** Semua library harus berjalan secara *offline-first*.
- ❌ **Dilarang mengganti stack dasar** (misal mengganti FastAPI ke Flask/Django, atau mengganti PaddleOCR ke Tesseract) tanpa analisis risiko dan persetujuan tertulis.

---

## 4. CODE STRUCTURE RULES

### 4.1 Pemisahan Frontend dan Backend (Strict Decoupling)
- Direktori `frontend/` dan `backend/` harus berdiri sendiri secara independen.
- Backend tidak boleh merender template HTML (tidak menggunakan Jinja2). Backend murni bertindak sebagai REST API provider.

### 4.2 Pemisahan Tanggung Jawab Kode (Separation of Concerns)
Dilarang menumpuk seluruh logika ke dalam satu file besar (*anti-pattern spaghetti code*). Struktur file backend harus mengikuti konvensi:
- **`routers/`**: Hanya menangani validasi request HTTP, status code, dan routing endpoint.
- **`services/preprocessor.py`**: Khusus menangani manipulasi citra via OpenCV (resize, grayscale, contrast).
- **`services/ocr_engine.py`**: Khusus mengisolasi pemanggilan PaddleOCR dan kalkulasi koordinat.
- **`models.py` & `database.py`**: Khusus menangani skema tabel SQLite dan sesi koneksi database.
- **`schemas.py`**: Khusus validasi data request/response Pydantic.

### 4.3 Standar Komponen Frontend
- Setiap komponen React harus diletakkan pada filenya sendiri di dalam `frontend/src/components/` (misal: `OverlayViewer.jsx`, `Uploader.jsx`, `ZoomControls.jsx`, `ResultsSidebar.jsx`).
- State global atau state lifting dikelola secara terpusat di `App.jsx` atau custom hooks.
- Hindari pembuatan file komponen yang melebihi 250 baris kode. Jika komponen terlalu kompleks, pecah menjadi sub-komponen yang lebih kecil.

---

## 5. OCR IMPLEMENTATION RULES

### 5.1 Integritas Citra Dokumen Asli
- **GAMBAR ASLI ADALAH SUMBER KEBENARAN (SOURCE OF TRUTH):**
  - Citra asli yang diunggah pengguna **TIDAK BOLEH DITIMPA, DI-CROP, ATAU DIKOMPRESI HINGGA BURAM**.
  - Citra asli harus selalu menjadi gambar yang dirender di layar pengguna sebagai layer dasar.
  - Hasil prapemrosesan OpenCV (grayscale, kontras) disimpan sebagai berkas kerja terpisah di `/storage/preprocessed/` dan hanya digunakan sebagai input mesin OCR.

### 5.2 Standar Payload Output OCR
Engine OCR backend wajib menghasilkan dan mengembalikan minimal 3 atribut data untuk setiap token kata/angka:
1. `text` *(string)*: Karakter atau deretan angka yang terbaca.
2. `confidence` *(float)*: Skor keyakinan pembacaan dengan rentang 0.00 s.d 1.00.
3. `box` *(object/array)*: Koordinat posisi spasial yang mempertahankan:
   - Posisi piksel asli pada dimensi gambar sebenarnya (`x`, `y`, `width`, `height`).
   - **Koordinat Ternormalisasi (`normalized_box`):** Rasio desimal terhadap dimensi asli (`x_min`, `y_min`, `x_max`, `y_max` antara 0.0 s.d 1.0) untuk memudahkan perhitungan skala responsif di frontend.

### 5.3 Pengelolaan Instance Model
- Model PaddleOCR harus diinisialisasi sebagai **Singleton** saat aplikasi backend startup.
- Dilarang menginisialisasi ulang objek `PaddleOCR()` pada setiap request upload, karena memakan waktu booting model dan memboroskan memori CPU/RAM.

---

## 6. FRONTEND OVERLAY RULES

### 6.1 Sinkronisasi Skala & Matematika Koordinat
- Posisi setiap kotak teks overlay dihitung secara dinamis menggunakan rumus:
  $$\text{Rendered Top} = \text{norm\_y\_min} \times \text{Current Image Height}$$
  $$\text{Rendered Left} = \text{norm\_x\_min} \times \text{Current Image Width}$$
  $$\text{Rendered Width} = (\text{norm\_x\_max} - \text{norm\_x\_min}) \times \text{Current Image Width}$$
  $$\text{Rendered Height} = (\text{norm\_y\_max} - \text{norm\_y\_min}) \times \text{Current Image Height}$$
- **Zero Desynchronization saat Zoom:** Ketika pengguna melakukan Zoom In/Out, transformasi skala harus diterapkan pada kontainer induk atau dihitung ulang secara sinkron sehingga kotak overlay tidak bergeser dari tulisan aslinya.

### 6.2 Interaktivitas Pengguna
- Setiap kotak teks pada layer overlay wajib dapat:
  - **Diklik satu kali (*single click*):** Otomatis menyalin teks ke clipboard pengguna menggunakan browser Clipboard API (`navigator.clipboard.writeText`).
  - **Diberi feedback visual:** Muncul toast/indikator bahwa teks telah tersalin.
  - **Menampilkan tooltip saat kursor diarahkan (*hover*):** Memperlihatkan teks asli dan skor persentase keyakinan.
- **Akurasi Posisi Mengalahkan Estetika:** Kotak overlay harus menempel sedekat mungkin dengan batas fisik karakter.

---

## 7. SECURITY & DATA PRIVACY RULES

Mengingat aplikasi ini digunakan untuk audit laporan keuangan internal:

1. **Jaminan Lingkungan Terisolasi (Air-Gapped Guarantee):**
   - Tidak boleh ada modul, pustaka, font eksternal, atau script CDN yang di-fetch secara runtime dari internet (semua aset dan CSS harus dibundel lokal di dalam project).
2. **Penyimpanan File Aman (Local Storage Sanitization):**
   - File yang diunggah disimpan di folder lokal aplikasi menggunakan penamaan acak yang aman (UUID atau timestamp) guna mencegah kerentanan *path traversal*.
   - Batasi tipe MIME yang dapat diunggah hanya pada `image/jpeg` dan `image/png`.
3. **Pembersihan Data Sementara:**
   - Sediakan mekanisme penghapusan file sementara jika proses prapemrosesan gagal di tengah jalan.
4. **Batas Akses Jaringan:**
   - Binding server backend hanya diperbolehkan pada interface lokal (`127.0.0.1` atau `localhost`) selama fase pengembangan.

---

## 8. TESTING & QUALITY ASSURANCE RULES

Setiap milestone dan perubahan kode wajib melalui pengujian fungsional sebelum dianggap valid:

1. **Pengujian Mandiri di Setiap Milestone:**
   - Dilarang menandai milestone selesai hanya berdasarkan asumsi "kode sudah ditulis". Kode harus dijalankan dan diverifikasi terhadap *Acceptance Criteria*.
2. **Kategori Dokumen Uji Wajib:**
   Pengujian minimal harus mencakup 5 jenis kondisi dokumen fisik nyata:
   - Dokumen cetak bersih resolusi tinggi (300 DPI).
   - Dokumen nota/struk thermal dengan cetakan pudar atau titik dot matrix.
   - Dokumen tabel finansial dengan deretan angka dan pemisah ribuan (titik/koma).
   - Foto dokumen menggunakan kamera smartphone dengan sudut sedikit miring atau bayangan ringan.
   - Dokumen dengan tulisan kecil (fine print).
3. **Verifikasi Angka Akuntansi:**
   - Uji secara teliti apakah karakter kritis akuntansi tidak tertukar (misal: angka `0` dengan huruf `O`, angka `1` dengan huruf `l`, atau angka `8` dengan angka `3`).

---

## 9. AI ASSISTANT WORKING RULES

Jika pengembangan dibantu oleh asisten AI (seperti Antigravity AI), asisten AI **WAJIB** mematuhi protokol kerja berikut:

1. **Penjelasan Sebelum Eksekusi:**
   - AI wajib menjelaskan logika, alasan teknis, dan file yang akan diubah sebelum menulis atau mengedit kode.
2. **Perubahan Kecil, Terarah, dan Terkontrol:**
   - Jangan melakukan *refactoring* massal yang tidak diminta.
   - Edit hanya bagian kode yang relevan dengan task milestone yang sedang aktif.
3. **Dilarang Menambah Fitur Tanpa Diminta (No Unsolicited Features):**
   - AI dilarang menambahkan library baru, animasi berlebihan, sistem login, atau fitur di luar cakupan milestone saat itu.
4. **Dilarang Mengganti Stack Tanpa Izin:**
   - AI dilarang mengganti framework atau library inti (misal: beralih dari PaddleOCR ke Tesseract, atau mengganti SQLite ke PostgreSQL) tanpa persetujuan eksplisit dari pengguna.
5. **Transparansi Saat Menghadapi Masalah:**
   - Jika terjadi kendala teknis (misal: error instalasi dependensi atau bentrok versi), AI wajib:
     1. Menjelaskan akar masalah secara jujur dan transparan.
     2. Memberikan 2–3 alternatif solusi beserta konsekuensi masing-masing.
     3. Menunggu konfirmasi pengguna sebelum melakukan perubahan arsitektur besar.

---

## 10. DEFINITION OF DONE (DoD) MVP

Pengembangan versi MVP dinyatakan **SELESAI 100% dan BERHASIL** apabila seluruh checklist berikut terpenuhi:

- [ ] **1. Upload Mandiri Berjalan:** Pengguna dapat mengunggah file gambar (JPG/PNG) melalui browser tanpa kegagalan sistem.
- [ ] **2. Eksekusi OCR Lokal Berhasil:** PaddleOCR memproses citra secara lokal di mesin internal dan menghasilkan array data teks, confidence score, dan koordinat.
- [ ] **3. Presisi Text Overlay:** Lapisan teks hasil OCR tampil menempel tepat di atas tulisan fisik dokumen asli (deviasi posisi $\le 3$ piksel).
- [ ] **4. Sinkronisasi Zoom Sempurna:** Perbesaran dan pengecilan tampilan (Zoom In/Out/Reset) tidak menyebabkan pergeseran posisi antara gambar asli dan teks overlay.
- [ ] **5. Click-to-Copy Berfungsi:** Pengguna dapat mengklik kotak teks mana pun pada gambar dan teks tersebut otomatis tersalin ke clipboard komputer.
- [ ] **6. Zero Internet Connection:** Seluruh alur aplikasi (dari frontend, API, OpenCV, hingga PaddleOCR) dapat dieksekusi saat koneksi internet dimatikan.
- [ ] **7. Kode Bersih & Terpisah:** Struktur direktori memisahkan modul backend, frontend, dan storage sesuai standar yang ditetapkan.
