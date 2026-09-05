# DOKUMEN ARSITEKTUR TEKNIS & SPESIFIKASI SISTEM
## Project: Internal OCR Document Analyzer (Text Overlay System)
**Kategori:** Internal Financial / Accounting & Audit Tool  
**Status Dokumen:** Technical Proposal & Architectural Design (Pre-Development)  
**Target Environment:** 100% On-Premise / Internal Isolated Network (Air-Gapped Ready)  
**Versi:** 1.0.0  

---

## DAFTAR ISI
1. [Project Overview](#1-project-overview)
2. [Problem Statement & Business Context](#2-problem-statement--business-context)
3. [Functional Requirements (Kebutuhan Fungsional)](#3-functional-requirements)
4. [Non-Functional Requirements (Kebutuhan Non-Fungsional)](#4-non-functional-requirements)
5. [Technical Architecture (Arsitektur Sistem End-to-End)](#5-technical-architecture)
6. [Technology Evaluation & Recommendations](#6-technology-evaluation--recommendations)
   - 6.1. OCR Engine Comparison (PaddleOCR vs Tesseract vs EasyOCR)
   - 6.2. Image Preprocessing Pipeline (OpenCV)
   - 6.3. Document Understanding Strategy (Rule-Based vs LayoutLM/Donut/VLM)
   - 6.4. Frontend Overlay Layer Architecture (HTML vs Canvas vs Konva vs Fabric.js)
7. [Database Design (Skema Database & Relasi)](#7-database-design)
8. [Security & Data Privacy Design](#8-security--data-privacy-design)
9. [Development Roadmap (Fase 1 hingga Fase 5)](#9-development-roadmap)
10. [Analisis Risiko, Tantangan, dan Mitigasi](#10-analisis-risiko-tantangan-dan-mitigasi)

---

## 1. PROJECT OVERVIEW

### 1.1 Deskripsi Produk
**Internal OCR Document Analyzer** adalah sistem aplikasi web internal berbasis web yang dirancang khusus untuk divisi akuntansi, keuangan, dan audit. Sistem ini mengotomasi proses ekstraksi data teks dan angka dari dokumen hardcopy (faktur pajak, invoice, kwitansi, rekening koran, purchase order, dan kontrak) dengan pendekatan **Interactive Text Overlay**.

### 1.2 Konsep Kunci: Image Asli + Text Overlay Layer
Berbeda dengan aplikasi OCR konvensional yang memisahkan gambar di satu sisi dan teks mentah di panel terpisah, konsep aplikasi ini mempertahankan integritas visual dokumen:
- **Layer Dasar (Base Layer):** Menampilkan citra dokumen asli dalam resolusi tinggi tanpa distorsi atau modifikasi piksel.
- **Layer Overlay (Interactive Layer):** Lapisan transparan yang ditempatkan secara matematis di atas citra asli, di mana setiap kata/angka hasil OCR diposisikan tepat pada koordinat aslinya (*bounding box*).
- **Interaktivitas:** Pengguna dapat menyorot teks (*select*), menyalin (*copy* ke clipboard), membaca teks dengan jelas, melihat skor keyakinan (*confidence score*), serta mengoreksi kesalahan pembacaan secara *inline* tanpa kehilangan konteks visual dokumen.

```
+-------------------------------------------------------------+
| Interactive Text Overlay Viewport                           |
|                                                             |
|   [Layer 2: Transparent / Highlighted Text Overlay Boxes]   |
|   +-----------------------------------------------------+   |
|   |  PT ABC              [No Faktur: 742]               |   |
|   |  Tanggal: 16 Juni 2007                              |   |
|   |  Total: 19.020.000 (Confidence: 99.2%)              |   |
|   +-----------------------------------------------------+   |
|                              ^                              |
|                              | (Diposisikan tepat di atas)  |
|   [Layer 1: Original High-Resolution Scanned Document]      |
|   +-----------------------------------------------------+   |
|   |  [Citra Asli Hardcopy / Scan / Foto Dokumen Bisnis] |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

---

## 2. PROBLEM STATEMENT & BUSINESS CONTEXT

### 2.1 Permasalahan Saat Ini (Current State)
1. **Inefisiensi Waktu & Biaya Operasional:**
   Auditor dan staf akuntansi menghabiskan 30%–45% waktu kerja untuk entri data manual (*re-typing*) dari kertas fisik atau file scan PDF statis ke dalam lembar kerja Microsoft Excel.
2. **Tingginya Risiko Human Error pada Angka Kritis:**
   Data keuangan memiliki toleransi kesalahan nol (*zero tolerance*). Kesalahan pengetikan angka 0 ganda, salah baca angka (misal: angka 8 terbaca 3, atau angka 1 terbaca 7), serta ketidakkonsistenan pemisah ribuan/desimal berisiko menimbulkan salah saji material (*material misstatement*) pada laporan audit.
3. **Kendala Kepatuhan & Kerahasiaan Data (Data Privacy & Compliance):**
   Dokumen finansial internal mencakup nama klien, nomor rekening, margin laba, identitas pajak (NPWP/NIK), dan informasi transaksi rahasia. Mengunggah dokumen ini ke layanan publik berbasis cloud (seperti OpenAI ChatGPT, Google Cloud Vision publik, atau tool konverter online) melanggar regulasi kerahasiaan data perusahaan, UU PDP (Pelindungan Data Pribadi), dan standar kerahasiaan audit (*non-disclosure agreements*).

### 2.2 Nilai Solusi (Value Proposition)
1. **Zero Data Leakage:** Seluruh pemrosesan citra dan komputasi model AI/OCR berjalan 100% di infrastruktur server internal (on-premise / private local network). Tidak ada satu pun byte data atau gambar yang dikirim ke internet publik.
2. **Verifikasi Visual Instan:** Fitur text overlay memangkas waktu verifikasi hingga 70%, karena auditor dapat langsung melihat apakah angka yang dideteksi oleh OCR sesuai dengan wujud fisik di kertas tepat pada titik koordinatnya.
3. **Audit Trail Lengkap:** Setiap koreksi angka disimpan ke dalam riwayat audit (*audit log*), menjaga transparansi dan akuntabilitas untuk kebutuhan peer-review audit.

---

## 3. FUNCTIONAL REQUIREMENTS

### FR-1: Modul Manajemen Dokumen & Upload
- **FR-1.1:** Pengguna dapat mengunggah file citra tunggal atau multi-halaman dalam format: `PNG`, `JPG/JPEG`, `TIFF`, dan `PDF` (vektor maupun scan).
- **FR-1.2:** Pengguna dapat melakukan pengambilan gambar langsung melalui webcam atau kamera dokumen yang terhubung ke workstation.
- **FR-1.3:** Sistem mendukung fitur *drag-and-drop* file dengan validasi ukuran file (maksimal 25MB per file) dan validasi ekstensi MIME-type.
- **FR-1.4:** Sistem mendeteksi duplikasi dokumen menggunakan hashing kriptografis (SHA-256) untuk mencegah audit ganda.

### FR-2: Pipeline Pemrosesan Citra (Preprocessing Engine)
- **FR-2.1:** Sistem secara otomatis mendeteksi dan mengoreksi kemiringan dokumen (*automatic deskewing*) hingga toleransi ±45 derajat.
- **FR-2.2:** Sistem melakukan koreksi perspektif (*perspective transform*) jika dokumen difoto dari sudut miring, meratakan bidang dokumen menjadi tegak lurus (tampilan flat A4).
- **FR-2.3:** Sistem menerapkan reduksi noise (*noise removal*) dan penajaman kontras adaptif (*adaptive thresholding / contrast enhancement*) untuk mengatasi pencahayaan dokumen yang tidak merata.
- **FR-2.4:** File gambar asli tidak boleh ditimpa; gambar hasil prapemrosesan disimpan sebagai varian kerja (*processing proxy*).

### FR-3: Ekstraksi Teks & Koordinat (OCR Engine)
- **FR-3.1:** Sistem mengekstraksi teks alfabetik (huruf kapital dan kecil) dengan dukungan tata bahasa Indonesia dan istilah akuntansi formal.
- **FR-3.2:** Sistem mengekstraksi angka numerik, pemisah ribuan (titik/koma), simbol mata uang (`Rp`, `IDR`, `$`), serta format tanggal standar bisnis Indonesia (`DD/MM/YYYY`, `DD-Mon-YYYY`, `16 Juni 2007`).
- **FR-3.3:** Sistem menghitung dan menyimpan koordinat spasial (*bounding box*) setiap kata dalam format 4-titik poligon atau koordinat ternormalisasi `[x_min, y_min, x_max, y_max]` relatif terhadap dimensi citra asli.
- **FR-3.4:** Sistem mencatat skor tingkat keyakinan (*confidence score*) dari skala 0.00 hingga 1.00 (atau 0% - 100%) untuk setiap token teks yang diekstraksi.

### FR-4: Antarmuka Interaktif Overlay Viewer
- **FR-4.1:** Menampilkan citra dokumen asli sebagai latar belakang dengan rasio aspek (*aspect ratio*) yang presisi.
- **FR-4.2:** Merender layer overlay transparan di atas gambar, dengan posisi teks tepat 1:1 di atas teks asli.
- **FR-4.3:** Memungkinkan pengguna melakukan navigasi dokumen: Smooth Zooming (25% hingga 500%), Panning (geser kanvas dengan mouse/drag), dan Fit-to-Width / Fit-to-Page.
- **FR-4.4:** Setiap kotak teks overlay dapat:
  - Diklik satu kali untuk menyalin (*click-to-copy*) nilai teks ke clipboard sistem.
  - Diseleksi seperti teks biasa (*native selection*) untuk menyalin paragraf atau deretan tabel.
  - Diklik dua kali (*double click*) untuk mengaktifkan mode inline-edit guna mengoreksi kesalahan OCR.
- **FR-4.5:** Indikator Visual Keyakinan (Confidence Indicator): Bounding box dengan confidence rendah (< 85%) diberi sorotan warna khusus (misal: kuning/oranye) untuk memberi peringatan visual kepada auditor.
- **FR-4.6:** Toggle Kontrol Overlay: Pengguna dapat menyalakan/mematikan tampilan overlay, mengubah transparansi layer (opacity slider), atau beralih antara "Bounding Box Mode" dan "Clean Text Mode".

### FR-5: Koreksi Data & Audit Log
- **FR-5.1:** Pengguna dapat mengoreksi teks atau angka yang salah dibaca oleh OCR secara langsung pada kanvas overlay atau panel samping (*sidebar*).
- **FR-5.2:** Setiap perubahan mencatat data: User ID pengubah, nilai lama (*original value*), nilai baru (*corrected value*), koordinat token, dan cap waktu (*timestamp*).
- **FR-5.3:** Status dokumen diperbarui secara berjenjang: `Uploaded` -> `Processed` -> `Under Review` -> `Verified/Approved`.

### FR-6: Ekstraksi Entitas & Export Terstruktur
- **FR-6.1:** Sistem mendeteksi entitas kunci akuntansi secara otomatis melalui pengenalan pola spasial dan regex:
  - Nomor Dokumen / No Faktur
  - Tanggal Transaksi
  - Nama Entitas / PT / Vendor
  - Subtotal, PPN/Pajak, Total Nilai Transaksi
- **FR-6.2:** Pengguna dapat mengekspor hasil pembacaan ke dalam format Microsoft Excel (`.xlsx`), CSV, dan JSON terstruktur.
- **FR-6.3:** Format Excel yang dihasilkan harus menyajikan data tabular yang rapi, mempertahankan tipe data numerik (bukan teks) agar formula perhitungan Excel dapat langsung berfungsi.

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### NFR-1: Performa & Efisiensi Latensi
- **Latensi OCR:** Pemrosesan satu lembar dokumen A4 (resolusi standar 300 DPI) tidak boleh melebihi 2.5 detik pada server bertarget GPU (Nvidia RTX class) atau maksimal 5 detik pada server bertarget CPU modern (8-core Intel/AMD).
- **Frontend Smoothness:** Operasi Zoom, Pan, dan interaksi kanvas harus berjalan pada frame-rate stabil minimal 55-60 FPS tanpa jeda input (*input lag*), bahkan saat menangani lebih dari 1.500 bounding box per halaman.
- **Asynchronous Execution:** Proses upload dan analisis dokumen harus dijalankan secara asynchronous melalui *background task queue*. Pengguna tidak boleh terkunci (*browser freeze*) saat dokumen sedang diproses.

### NFR-2: Keamanan & Kepatuhan (Security & Compliance)
- **Air-Gapped Isolation:** Sistem backend tidak boleh memiliki dependensi runtime ke API pihak ketiga di internet. Seluruh bobot model (*model weights*), binary runtime, dan pustaka harus dihosting secara lokal.
- **Role-Based Access Control (RBAC):** Hak akses dibagi minimal menjadi 4 peran:
  - *Super Admin:* Manajemen sistem dan hak akses user.
  - *Lead Auditor:* Dapat memverifikasi dokumen, melakukan approval akhir, dan melihat seluruh log.
  - *Auditor/Staff:* Dapat mengunggah, melakukan OCR, mengoreksi teks, dan mengekspor data.
  - *Viewer:* Hanya dapat melihat dokumen dan hasil verifikasi (read-only).
- **Enkripsi Data:**
  - *In-Transit:* Seluruh komunikasi client-server diwajibkan menggunakan HTTPS/TLS 1.3 internal.
  - *At-Rest:* File dokumen mentah dan database dienkripsi menggunakan standar AES-256 pada level storage/volume.

### NFR-3: Akurasi & Ketepatan Spasial
- **Character Accuracy Rate (CAR):** Target akurasi karakter untuk dokumen ketik standar minimal 96% pada angka dan 95% pada huruf alfabet.
- **Precision Posisi Koordinat:** Toleransi deviasi bounding box overlay tidak boleh melebihi 2 piksel relatif terhadap batas fisik teks pada resolusi 1:1, memastikan teks overlay tidak bergeser (*misaligned*).

### NFR-4: Skalabilitas & Reliabilitas
- Mendukung pemrosesan dokumen secara batch (*batch upload*) hingga 50 halaman secara bertahap tanpa menyebabkan memory leak pada backend.
- Sistem logging terpusat untuk mendeteksi kegagalan OCR, format file korup, atau kegagalan worker.

---

## 5. TECHNICAL ARCHITECTURE

Sistem dirancang dengan pola **Decoupled Service Architecture** yang memisahkan frontend interaktif, backend API orchestrator, image processing pipeline, OCR engine worker, database persisten, dan media storage.

### 5.1 Diagram Alur Arsitektur End-to-End

```
+-----------------------------------------------------------------------------------+
| FRONTEND CLIENT (Single Page Application - React.js / Vue.js)                     |
|                                                                                   |
|  [Document Uploader]  <--->  [Interactive Overlay Canvas]  <--->  [Data Editor]   |
|         |                            ^                                   |        |
+---------|----------------------------|-----------------------------------|--------+
          | REST API / WebSocket       | JSON (Tokens, Box, Confidence)    | Save
          v                            v                                   v
+-----------------------------------------------------------------------------------+
| BACKEND API GATEWAY (FastAPI / Python 3.11+)                                      |
|                                                                                   |
|  - Auth & RBAC Middleware (JWT Session)                                           |
|  - Document Ingestion & Validation Controller                                     |
|  - Task Dispatcher (Celery Producer)                                              |
|  - Export Engine (OpenPyXL / Pandas)                                              |
+-----------------------------------------------------------------------------------+
       |                                      |
       | Media Write (Local FS / MinIO)       | Queue Job (Redis Broker)
       v                                      v
+---------------------------+       +-----------------------------------------------+
| LOCAL SECURE STORAGE      |       | ASYNC TASK WORKER (Celery / Redis Worker)     |
|                           |       |                                               |
| - /storage/raw_docs/      | <---> | 1. Image Preprocessing (OpenCV)               |
| - /storage/processed/     |       |    - Deskewing (Hough Transform)              |
| - /storage/exports/       |       |    - Noise Removal & Contrast Adapt           |
| (AES-256 Encrypted Mount) |       |    - Perspective Correction                   |
+---------------------------+       | 2. OCR Inference (PaddleOCR PP-OCRv4)         |
                                    |    - Text Detection (DBNet++)                 |
                                    |    - Direction Classifier                     |
                                    |    - Text Recognition (SVTR)                  |
                                    | 3. Post-Processing & Spatial Token Mapping    |
                                    +-----------------------------------------------+
                                                      |
                                                      | Write OCR Result & Metadata
                                                      v
                                    +-----------------------------------------------+
                                    | DATABASE LAYER (PostgreSQL 16)                |
                                    |                                               |
                                    | - Users & Audit Logs                          |
                                    | - Documents & Pages Metadata                  |
                                    | - OCR Blocks & Tokens (Normalized Polygons)   |
                                    | - Entity Key-Values & Corrections History     |
                                    +-----------------------------------------------+
```

### 5.2 Rincian Modul Arsitektur

#### 1. Frontend Client Layer
- **Tanggung Jawab:** Antarmuka interaksi auditor.
- **Komponen Kunci:**
  - *Canvas/SVG Engine:* Merender gambar dokumen dan ribuan bounding box teks interaktif.
  - *Viewport Controller:* Mengelola matrix transformasi 2D (pan, zoom, scale) sehingga layer citra dan layer overlay bergerak secara sinkron (*perfect alignment*).
  - *Correction Inspector:* Panel inspeksi cepat untuk mengedit teks yang salah dibaca dan navigasi keyboard (misal: tombol `Tab` untuk berpindah ke token berikutnya yang confidence-nya rendah).

#### 2. Backend API Layer (FastAPI)
- **Tanggung Jawab:** Menyediakan endpoint RESTful berkinerja tinggi, mengelola autentikasi JWT, validasi file, dan orkestrasi pemrosesan.
- **Alasan Pemilihan FastAPI:**
  - Berbasis asynchronous (*async/await*) dengan performa setara NodeJS/Go.
  - Ekosistem Python asli, memudahkan komunikasi data memori dengan NumPy, OpenCV, dan model ML tanpa overhead inter-process serialization yang lambat.
  - Validasi schema otomatis berbasis Pydantic menjamin konsistensi payload koordinat dan metadata.

#### 3. Image Processing Worker (OpenCV Pipeline)
- **Tanggung Jawab:** Membersihkan dan menstandarisasi citra mentah sebelum dikirim ke engine OCR guna memaksimalkan akurasi pengenalan karakter.
- **Urutan Operasi:**
  1. *Color Space Conversion:* Mengubah ke format Grayscale.
  2. *Bilateral Filtering:* Menghilangkan noise kertas tanpa mengaburkan tepi teks (*edge preservation*).
  3. *Skew Detection & Correction:* Menggunakan deteksi kontur garis teks untuk menghitung sudut kemiringan dokumen dan melakukan rotasi affine balik.
  4. *Adaptive Illumination Equalization:* Mengatasi bayangan akibat foto kamera handphone/dokumen bergelombang menggunakan teknik CLAHE (*Contrast Limited Adaptive Histogram Equalization*).

#### 4. OCR Engine Worker (PaddleOCR Inference Service)
- **Tanggung Jawab:** Melakukan inferensi machine learning lokal pada citra hasil prapemrosesan.
- **Tahapan Inferensi:**
  1. *Detection Model:* Mendeteksi area teks dan menghasilkan poligon koordinat batas kata.
  2. *Direction Angle Classifier:* Memastikan orientasi teks tegak (mengoreksi teks terbalik 90/180/270 derajat).
  3. *Recognition Model:* Mengubah patch gambar teks menjadi string karakter dan probabilitas kepercayaan (*confidence score*).

#### 5. Database Layer (PostgreSQL)
- **Tanggung Jawab:** Menyimpan data terstruktur, koordinat bounding box (dalam tipe data JSONB fleksibel untuk performa kueri spasial), serta riwayat audit koreksi yang tidak dapat dihapus (*immutable audit log*).

#### 6. Export Engine
- **Tanggung Jawab:** Mengonversi data token yang telah diverifikasi menjadi file spreadsheet Microsoft Excel (`.xlsx`) dengan format sel akuntansi (pemisah ribuan, format tanggal, currency code) menggunakan engine OpenPyXL.

---

## 6. TECHNOLOGY EVALUATION & RECOMMENDATIONS

### 6.1 Evaluasi OCR Engine

Kami membandingkan 3 engine open-source paling matang yang dapat dijalankan secara lokal:

| Parameter Evaluasi | PaddleOCR (PP-OCRv4) | Tesseract OCR (v5 LSTM) | EasyOCR |
| :--- | :--- | :--- | :--- |
| **Akurasi Membaca Angka** | **Sangat Tinggi (98%+)** | Sedang - Rendah (Sering tertukar 8/3/0) | Tinggi (94%+) |
| **Deteksi Tabel & Invoice** | **Unggul (Mampu membaca teks rapat & garis tipis)** | Lemah (Sering menggabungkan kolom berbeda) | Cukup Baik (Terkadang memotong batas tabel) |
| **Akurasi Bounding Box** | **Poligon Presisi (DBNet++)** | Bounding Box Persegi Kasar | Poligon (CRAFT) |
| **Performa Kecepatan** | **Sangat Cepat (~150-300ms GPU, ~1.2s CPU)** | Cepat (~1.5s CPU) | Lambat (~3.5s - 5s CPU) |
| **Dukungan Dokumen Indonesia**| Sangat Baik (Latin character set standard) | Baik (Perlu training tesseract data) | Baik |
| **Konsumsi Resource (RAM/VRAM)**| Sangat Ringan (~800MB VRAM) | Paling Ringan (~200MB RAM) | Cukup Berat (PyTorch Base, ~2GB VRAM) |
| **Ketergantungan Model** | C++/Python Runtime Ringan | C++ Native Binary | PyTorch Dependency |

#### Rekomendasi Pilihan: **PaddleOCR (PP-OCRv4)**
**Justifikasi Keputusan:**
1. **Akurasi Angka Finansial:** PaddleOCR menggunakan arsitektur recognizer SVTR (*Single Visual Model for Text Recognition*) yang sangat superior dalam membedakan karakter angka yang ambigu (misal: titik vs koma pada nominal `19.020.000`).
2. **Precision Poligon:** Algoritma deteksi DBNet++ pada PaddleOCR menghasilkan koordinat batas teks yang sangat ketat (*tight bounding box*), esensial untuk kebutuhan text overlay yang presisi.
3. **Efisiensi On-Premise:** Sangat hemat resource dan memiliki varian Mobile (sangat cepat untuk CPU server) dan Server (maksimum akurasi untuk GPU server).

---

### 6.2 Evaluasi Image Preprocessing (OpenCV)

Pemrosesan citra adalah penentu terbesar keberhasilan OCR pada dokumen fisik (terutama hasil scan miring atau foto kamera ponsel). Prapemrosesan wajib mencakup:

```
Raw Scanned Image
       |
       v
[Grayscale Conversion] -> [Gaussian / Bilateral Blur (Denoising)]
       |
       v
[Otsu / Sauvola Adaptive Thresholding] -> Ekstraksi biner teks & background
       |
       v
[Hough Lines / MinAreaRect Contour] -> Deteksi sudut kemiringan (Deskewing)
       |
       v
[Warp Perspective Matrix] -> Meluruskan sudut dokumen (Perspective Rectification)
       |
       v
Preprocessed Clean Image -> Dikirim ke OCR Engine
```

1. **Deskewing (Koreksi Kemiringan):** Menggunakan transformasi Radon atau deteksi garis Hough untuk mengukur sudut kemiringan baris teks, lalu menerapkan rotasi affine balik. Hal ini menjamin baris teks berada pada sumbu horizontal 0 derajat.
2. **Perspective Correction (Koreksi Sudut Kamera):** Mendeteksi 4 kontur sudut kertas dokumen hardcopy, lalu memetakan kembali citra ke proyeksi planar persegi panjang standar (A4 ratio).
3. **Shadow & Background Removal:** Menggunakan background subtraction atau filter Sauvola untuk mengeliminasi noda kertas atau bayangan tangan pada saat pengambilan foto.

---

### 6.3 Evaluasi Document Understanding (LayoutLM / Donut / VLM vs Rule-Based)

Kebutuhan akuntansi sering kali memerlukan pengelompokan teks menjadi data bermakna (misal: mengidentifikasi bahwa teks "19.020.000" adalah "Total Tagihan", bukan "Nomor Faktur").

| Pendekatan | Deskripsi | Kebutuhan Hardware | Kompleksitas Setup | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- |
| **LayoutLMv3 (Microsoft)** | Model multimodal (Teks + Posisi Koordinat + Gambar) | Butuh Server GPU Dedicated (Min. 16GB VRAM) | Sangat Tinggi (Perlu fine-tuning dataset sendiri) | **Terlalu kompleks untuk MVP** |
| **Donut / Nougat (OCR-free VLM)** | Model end-to-end langsung dari gambar ke JSON | Butuh Server GPU Besar (Min. 24GB VRAM) | Sangat Tinggi & Latensi lambat (4-8 detik) | **Tidak direkomendasikan untuk fase awal** |
| **Local LLM (Llama 3 / Mistral via Ollama)** | Teks hasil OCR dikirim ke LLM lokal untuk diekstrak jadi JSON | Butuh 8GB-16GB VRAM (Q4 quantization) | Sedang | **Cocok untuk Fase 4** |
| **Rule-Based & Spatial Heuristic (Rekomendasi MVP)** | Menggunakan Regex + Kedekatan Spasial Koordinat (*proximity clustering*) | **Zero GPU Needed (Jalan di CPU standard)** | **Cepat, Transparan, Deterministik** | **PILIHAN TERBAIK UNTUK MVP** |

#### Keputusan Strategis untuk MVP:
Untuk tahap MVP, **TIDAK DIBUTUHKAN LayoutLM atau Vision Language Model**.
Ekstraksi data faktur/kwitansi tahap awal cukup diselesaikan menggunakan:
1. **Spatial Proximity Heuristics:** Sistem mencari kata kunci seperti `"Total"`, `"No Faktur"`, `"Tanggal"`, kemudian mengambil token teks/angka yang terletak tepat di sebelah kanan atau di bawah koordinat kata kunci tersebut berdasarkan ambang batas jarak piksel (*bounding box distance*).
2. **Regex Patterns Akuntansi Indonesia:**
   - Format Tanggal: `\d{1,2}\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|\w+)\s+\d{4}`
   - Format Nominal Rupiah: `(?:Rp\.?|IDR)?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)`
   - Format Nomor Faktur Pajak: `\d{3}\.\d{3}-\d{2}\.\d{8}`

Pendekatan ini 100% deterministik, tidak mengalami halusinasi AI, sangat ringan, dan dapat langsung diandalkan oleh auditor.

---

### 6.4 Evaluasi Frontend Overlay System

Arsitektur rendering overlay adalah komponen paling vital bagi pengalaman pengguna (*user experience*). Teks harus tampak menempel sempurna di atas gambar pada tingkat zoom berapa pun.

| Parameter | 1. HTML/CSS Overlay (`<div>` & `<span>`) | 2. Raw HTML5 Canvas 2D | 3. Konva.js (Canvas Library) | 4. Fabric.js |
| :--- | :--- | :--- | :--- | :--- |
| **Presisi Seleksi Teks** | **Sempurna (Native browser selection & copy)** | Buruk (Harus membuat seleksi kursor sendiri) | Rumit (Butuh overlay DOM tambahan) | Rumit (Canvas based selection) |
| **Performa 1.000+ Box** | Sedang (Beban DOM bertambah jika tidak dioptimasi) | **Sangat Cepat (Render via GPU canvas)** | Sangat Cepat | Cepat |
| **Zoom & Pan Fidelity** | Mudah dengan CSS `transform: matrix()` | Perlu hitung ulang skala manual pada context | Sangat Baik (Built-in stage drag/zoom) | Sangat Baik |
| **Kemudahan Inline Edit**| **Sangat Mudah (`contenteditable` atau input)** | Sangat Sulit (Harus inject input element) | Butuh custom DOM node injection | Butuh custom DOM node injection |
| **Aksesibilitas & Copy** | **Langsung (Bisa di-drag seperti teks PDF biasa)**| Tidak bisa disalin secara native | Tidak bisa disalin secara native | Tidak bisa disalin secara native |

#### Rekomendasi Pilihan Arsitektur Frontend: **Hybrid Layer Architecture (Canvas + Absolute SVG/DOM Overlay)**
Mirip dengan cara kerja **PDF.js (Mozilla Firefox PDF Viewer)** atau **Google Docs**:

```
+-------------------------------------------------------------+
| CONTAINER VIEWPORT (Pan & Zoom Handler via CSS Matrix)      |
|                                                             |
|  [LAYER 1: Image / Canvas Layer]                            |
|  <img src="document_original.jpg" style="width: 100%;" />   |
|                                                             |
|  [LAYER 2: SVG / SVG Path Highlight Layer]                  |
|  <svg class="bounding-box-highlights">                      |
|    <rect x="120" y="340" width="80" height="25"             |
|          class="box-confidence-low" />                      |
|  </svg>                                                     |
|                                                             |
|  [LAYER 3: Transparent Interactive Text Layer]              |
|  <div class="text-overlay-layer">                           |
|    <span style="left: 120px; top: 340px; font-size: 14px;"  |
|          class="ocr-token" title="Confidence: 99%">         |
|      19.020.000                                             |
|    </span>                                                  |
|  </div>                                                     |
+-------------------------------------------------------------+
```

**Kelebihan Pendekatan Hybrid:**
1. **Layer 1:** Gambar asli dirender tanpa distorsi.
2. **Layer 2:** Menggunakan SVG ringan untuk menggambar garis batas (*bounding box rectangles*) dan efek highlight warna oranye/kuning/hijau berdasarkan confidence score.
3. **Layer 3:** Elemen teks transparan (atau semi-transparan) ditempatkan tepat di atas teks fisik. Pengguna dapat menyeleksi teks dengan mouse (*click & drag*), menekan `Ctrl+C` secara native, atau melakukan *double-click* untuk memunculkan pop-up input edit.

---

## 7. DATABASE DESIGN

Database menggunakan **PostgreSQL 16** dengan skema terelasi normal (*3NF*) untuk menjamin integritas data dan riwayat audit audit trail.

### 7.1 Entity Relationship Diagram (Textual Representation)

```
 [users] 1 -----< N [documents] 1 -----< N [document_pages]
                          |                         |
                          |                         +----< N [ocr_blocks]
                          |                                     |
                          |                                     +----< N [ocr_tokens]
                          |                                                 |
                          +-------------------------------------------------+
                          |                         |
                          v                         v
               [extracted_entities]       [correction_history]
```

### 7.2 Spesifikasi Skema Tabel (DDL Specification)

#### 1. Tabel: `users`
Menyimpan kredensial dan hak akses staf akuntansi/auditor.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'VIEWER')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Tabel: `documents`
Menyimpan berkas induk dokumen yang diunggah.
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Path fisik storage internal terenkripsi
    file_hash_sha256 CHAR(64) NOT NULL, -- Mencegah upload dokumen duplikat
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    page_count INT DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED' 
        CHECK (status IN ('UPLOADED', 'PREPROCESSING', 'OCR_RUNNING', 'COMPLETED', 'UNDER_REVIEW', 'VERIFIED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_hash ON documents(file_hash_sha256);
CREATE INDEX idx_documents_user ON documents(user_id);
```

#### 3. Tabel: `document_pages`
Menyimpan detail per halaman (mendukung PDF multi-page).
```sql
CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    raw_image_path VARCHAR(500) NOT NULL,
    preprocessed_image_path VARCHAR(500),
    width INT NOT NULL, -- Dimensi piksel asli
    height INT NOT NULL,
    dpi INT DEFAULT 300,
    processing_time_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doc_page UNIQUE (document_id, page_number)
);
```

#### 4. Tabel: `ocr_tokens`
Menyimpan setiap kata/angka individual beserta koordinat spasial dan confidence score.
```sql
CREATE TABLE ocr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES document_pages(id) ON DELETE CASCADE,
    token_index INT NOT NULL, -- Urutan pembacaan teks
    text_content TEXT NOT NULL,
    
    -- Koordinat Bounding Box Ternormalisasi (0.00000 - 1.00000) relatif terhadap W & H
    bbox_x_min NUMERIC(7, 5) NOT NULL,
    bbox_y_min NUMERIC(7, 5) NOT NULL,
    bbox_x_max NUMERIC(7, 5) NOT NULL,
    bbox_y_max NUMERIC(7, 5) NOT NULL,
    
    -- Koordinat Poligon 4-titik absolut piksel (opsional untuk dokumen miring)
    polygon_points JSONB, -- Contoh: [[120,340], [200,340], [200,365], [120,365]]
    
    confidence_score NUMERIC(5, 4) NOT NULL, -- Contoh: 0.9920 (99.20%)
    is_numeric BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokens_page ON ocr_tokens(page_id);
CREATE INDEX idx_tokens_confidence ON ocr_tokens(confidence_score);
```

#### 5. Tabel: `correction_history` (Audit Log Koreksi Teks)
Mencatat setiap perubahan manual yang dilakukan auditor terhadap hasil OCR.
```sql
CREATE TABLE correction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES ocr_tokens(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    previous_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_corrections_token ON correction_history(token_id);
CREATE INDEX idx_corrections_user ON correction_history(user_id);
```

#### 6. Tabel: `extracted_entities`
Menyimpan hasil ekstraksi key-value otomatis atau hasil mapping auditor (misal: Total, Tanggal, No Faktur).
```sql
CREATE TABLE extracted_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_key VARCHAR(50) NOT NULL, -- e.g., 'INVOICE_NUMBER', 'INVOICE_DATE', 'TOTAL_AMOUNT', 'VENDOR_NAME'
    field_value TEXT NOT NULL,
    normalized_value TEXT, -- e.g., standard ISO Date '2007-06-16' atau Decimal '19020000.00'
    source_token_ids JSONB, -- Array ID token pembentuk nilai ini
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. SECURITY & DATA PRIVACY DESIGN

Mengingat dokumen akuntansi bersifat rahasia (*confidential corporate financial records*), sistem dirancang mengikuti prinsip **Zero Trust on Data Ingestion**:

```
+-------------------------------------------------------------------------------+
| LOCAL AIR-GAPPED PERIMETER (No Internet Access Required)                      |
|                                                                               |
|   [Auditor Workstation]                                                       |
|           |                                                                   |
|     HTTPS | (TLS 1.3 Internal CA / Strict Local IP Subnet 192.168.x.x)        |
|           v                                                                   |
|   [Nginx Reverse Proxy] -> Rate Limiting, HTTP Security Headers, WAF rules    |
|           |                                                                   |
|           +---> [FastAPI Server] -> JWT Auth + RBAC Validation                |
|                       |                                                       |
|                       +---> [Local Storage Engine] (Disk AES-256 Encrypted)   |
|                       +---> [PaddleOCR Engine] (Local Binary Models)          |
|                       +---> [PostgreSQL DB] (TLS + Encrypted DB Credentials)  |
+-------------------------------------------------------------------------------+
```

### 8.1 Jaminan Local Processing (Zero Cloud Leakage)
1. **Network Binding Strictness:** Service backend, Redis, PostgreSQL, dan worker OCR dibinding khusus pada antarmuka localhost (`127.0.0.1`) atau Docker internal bridge network. Tidak ada port yang diekspos ke publik internet.
2. **Offline Model Dependency:** Model PaddleOCR diunduh dan dipaketkan ke dalam image Docker atau folder lokal saat build awal. Pada runtime, flag `use_gpu=True/False` berjalan tanpa melakukan handshake atau telemetry ke server eksternal Baidu/PaddlePaddle.

### 8.2 Manajemen File & Keamanan Storage
1. **Randomized Storage Names:** File dokumen fisik yang disimpan pada disk tidak menggunakan nama asli, melainkan UUID v4 acak (contoh: `d3b07384-d113-4660-9d0d-2b4d456789ab.enc`) untuk mencegah eksploitasi direktori (*path traversal*).
2. **Filesystem Permission:** Direktori file storage hanya dapat diakses oleh user sistem level Linux berhak akses rendah (`chown -R ocruser:ocrgroup /storage && chmod 700 /storage`).
3. **Data Retention & Shredding Policy:** Sistem memiliki opsi *Auto-Purge* atau *Safe Shredding* yang dapat dikonfigurasi untuk menghapus citra mentah setelah verifikasi selesai dan hanya menyisakan data metadata teks jika diatur oleh kebijakan kepatuhan perusahaan.

### 8.3 Autentikasi & Autentikasi (AuthN & AuthZ)
1. **JWT dengan HttpOnly Cookies:** Token autentikasi disimpan dalam cookie dengan atribut `HttpOnly`, `SameSite=Strict`, dan `Secure` untuk mencegah serangan XSS (*Cross-Site Scripting*).
2. **Session Expiry:** Sesi auditor otomatis kedaluwarsa setelah 30 menit tidak aktif (*inactivity timeout*).

### 8.4 Audit Logging (Integritas Bukti Audit)
1. **Immutable Log:** Tabel audit log dirancang append-only (hanya `INSERT`, tidak ada perintah `UPDATE` atau `DELETE`).
2. **Pencatatan Lengkap:** Mencatat: Waktu akses dokumen, alamat IP lokal klien, user agent, token yang dikoreksi, dan kapan file diekspor ke Excel.

---

## 9. DEVELOPMENT ROADMAP

Pengembangan dibagi ke dalam 5 fase terukur agar tim memiliki target yang jelas dan menghasilkan fungsionalitas yang dapat langsung diuji di setiap tahap:

```
[Phase 1: Prototype OCR Overlay]  (Minggu 1 - 3)  <-- FOKUS MVP
         |
         v
[Phase 2: Accuracy & Usability]   (Minggu 4 - 6)
         |
         v
[Phase 3: Template & Rule Engine] (Minggu 7 - 9)
         |
         v
[Phase 4: AI Doc Understanding]   (Minggu 10 - 13)
         |
         v
[Phase 5: Automated Excel Export] (Minggu 14 - 16)
```

---

### Phase 1: Prototype OCR Overlay (MVP Target)
**Tujuan:** Memvalidasi konsep inti: "Unggah Dokumen -> Baca OCR Lokal -> Render Text Overlay Interaktif -> Salin Teks".
- **Ruang Lingkup:**
  1. Setup arsitektur backend FastAPI dan worker async.
  2. Implementasi pipeline PaddleOCR PP-OCRv4 dasar pada CPU/GPU lokal.
  3. UI Web minimalis: Drag-and-drop upload gambar (format JPG/PNG).
  4. Komponen Canvas Viewer: Menampilkan gambar asli + bounding box teks yang presisi.
  5. Fitur klik-untuk-salin (*click-to-copy*) teks ke clipboard.
  6. Kemampuan zoom dan pan kanvas gambar.
- **Keluaran (Deliverable):** Web prototype fungsional di mana pengguna dapat mengunggah faktur dan langsung menyeleksi serta menyalin teks/angka dari dokumen fisik.

---

### Phase 2: Peningkatan Akurasi & Preprocessing Pipeline
**Tujuan:** Mengoptimasi hasil pembacaan pada dokumen fisik riil yang berkualitas rendah atau miring.
- **Ruang Lingkup:**
  1. Integrasi modul OpenCV: Deteksi kemiringan otomatis (*deskew*) dan koreksi orientasi dokumen.
  2. Filter reduksi bayangan dan peningkatan kontras adaptif untuk hasil scan pudar.
  3. Visualisasi Confidence Score: Bounding box otomatis berubah warna (hijau jika >90%, kuning 75%-90%, oranye <75%).
  4. Fitur Inline Correction: Auditor dapat mengklik dua kali kotak teks untuk memperbaiki salah baca OCR langsung pada kanvas.
  5. Dukungan dokumen format PDF multi-halaman.
- **Keluaran (Deliverable):** Viewer yang stabil dengan akurasi pembacaan dokumen riil meningkat di atas 95% dan koreksi interaktif.

---

### Phase 3: Template Dokumen Perusahaan & Heuristic Parser
**Tujuan:** Mengotomasi pengelompokan token teks menjadi entitas finansial standar Indonesia.
- **Ruang Lingkup:**
  1. Engine pengenalan pola format Indonesia: Nomor Faktur Pajak standar, Tanggal Indonesia, Format Rupiah.
  2. Spatial proximity engine: Mencari kata kunci (e.g. "Total", "DPP", "PPN") dan memetakan nilainya berdasarkan posisi kotak terdekat.
  3. Fitur Template Manager: Pengguna dapat menyimpan template posisi kotak untuk dokumen dari vendor rutin (e.g., Invoice Telkom, PLN, atau vendor tetap).
  4. Panel Ringkasan Finansial: Sidebar otomatis menampilkan key-value penting yang terdeteksi.
- **Keluaran (Deliverable):** Sistem mampu secara otomatis mengisi form: Vendor, Tanggal, No Dokumen, dan Total Nominal.

---

### Phase 4: AI Document Understanding (Local Model)
**Tujuan:** Menangani dokumen non-standar atau dokumen dengan tata letak kompleks/tabel dinamis tanpa perlu template manual.
- **Ruang Lingkup:**
  1. Integrasi model lokal ringan (seperti LLM 7B/8B terkuantisasi via Ollama atau Layout parser khusus tabel seperti PaddleOCR Table Engine / PP-Structure).
  2. Ekstraksi otomatis baris tabel akuntansi (*table line-item detection*) menjadi format baris dan kolom.
  3. Verifikasi silang otomatis (*cross-validation math check*): Sistem memverifikasi apakah `Subtotal + PPN == Total`. Jika tidak cocok, sistem memberi notifikasi audit alert.
- **Keluaran (Deliverable):** Deteksi tabel multi-baris otomatis dan audit otomatis terhadap validitas perhitungan matematis dokumen.

---

### Phase 5: Export Otomatis & Integrasi Alur Kerja Akuntansi
**Tujuan:** Integrasi mulus dengan lembar kerja audit harian dan sistem ERP.
- **Ruang Lingkup:**
  1. Modul generator Excel tingkat lanjut (`.xlsx`):
     - Mempertahankan format numerik dan desimal.
     - Menyusun kolom sesuai standar kertas kerja audit (KKA) perusahaan.
  2. Batch Export: Menggabungkan 50 dokumen yang telah diverifikasi ke dalam satu rekapitulasi Excel.
  3. Role-based workflow: Siklus status `Draft` -> `Audited` -> `Approved by Lead Auditor`.
  4. REST API Webhook: Menyiapkan endpoint untuk sinkronisasi langsung ke sistem ERP internal (SAP, Accurate, atau database akuntansi internal).
- **Keluaran (Deliverable):** Solusi enterprise siap pakai yang terintegrasi penuh dengan proses bisnis akuntansi perusahaan.

---

## 10. ANALISIS RISIKO, TANTANGAN, DAN MITIGASI

| No | Risiko / Tantangan Teknis | Dampak pada Sistem | Strategi Mitigasi Terencana |
| :--- | :--- | :--- | :--- |
| 1 | **Ambiguitas Karakter Angka** (misal: angka `0` dibaca `O`, `1` dibaca `l` atau `I`, atau `8` dibaca `3`). | Fatal bagi data nominal akuntansi. | 1. Terapkan post-processing regex pada token bertipe numerik (jika di dalam pola nominal, paksa konversi karakter alfabet mirip angka).<br>2. Berikan highlight oranye (*warning*) untuk angka dengan confidence < 90%.<br>3. Fitur *Math Check*: validasi apakah subtotal cocok dengan grand total. |
| 2 | **Format Pemisah Titik vs Koma** (Standar Indonesia: `19.020.000,00` vs Internasional: `19,020,000.00`). | Angka bisa terpotong atau salah bernilai 1.000x lipat saat diekspor ke Excel. | Buat layer normalisasi numerik di backend yang mendeteksi pola pemisah ribuan secara kontekstual sebelum dikonversi ke tipe data `Decimal` Python. |
| 3 | **Dokumen Fisik Berkerut, Miring, atau Resolusi Rendah (Foto HP).** | Bounding box meleset dan OCR gagal membaca teks. | Wajibkan pipeline OpenCV deskewing dan adaptive thresholding sebelum proses OCR. Buat validator kualitas gambar: jika DPI < 150, munculkan peringatan kepada auditor. |
| 4 | **Beban Komputasi Server CPU (Resource Bottleneck).** | Antrean dokumen menumpuk jika beberapa auditor mengunggah secara bersamaan. | 1. Gunakan Celery / Redis task queue dengan batasan *concurrency*.<br>2. Gunakan PaddleOCR varian Mobile/Lightweight untuk eksekusi CPU dengan inferensi sub-detik.<br>3. Jika tersedia, manfaatkan 1 unit GPU workstation internal untuk akselerasi batched inference. |
| 5 | **Desinkronisasi Posisi Overlay saat Browser di-Resize/Zoom.** | Teks overlay bergeser dari gambar asli, membingungkan auditor. | Koordinat bounding box disimpan dan ditransmisikan dalam format **koordinat ternormalisasi (rasio 0.0 s.d 1.0)**. Ukuran absolut piksel dihitung ulang secara dinamis oleh JavaScript menggunakan ukuran canvas viewport aktual (`renderX = normX * currentImageWidth`). |
| 6 | **Risiko Kebocoran Data oleh Akses Tidak Sah.** | Dokumen audit finansial internal diakses oleh pihak luar divisi. | Enkripsi disk penyimpanan dokumen dengan AES-256, terapkan RBAC ketat, isolasi jaringan hanya pada VLAN akuntansi/audit, dan catat setiap akses ke dalam immutable audit log. |

---

## RINGKASAN REKOMENDASI UNTUK DEVELOPMENT KELAK

1. **Gunakan PaddleOCR (PP-OCRv4)** sebagai OCR engine utama karena terbukti paling unggul dalam pengenalan angka, invoice, dan tabel, serta sangat efisien dijalankan secara lokal.
2. **Gunakan OpenCV** untuk standardisasi prapemrosesan citra (deskewing dan penajaman kontras) guna menjamin kualitas input sebelum masuk ke OCR.
3. **Pilih Hybrid Frontend Architecture (Canvas Image + SVG Bounding Box + Transparent DOM Text)** untuk memungkinkan interaktivitas penuh: drag selection, native copy-paste, dan visual highlight tanpa mengorbankan performa kanvas.
4. **Fokus MVP pada Rule-Based & Proximity Heuristics**, hindari pemakaian model AI yang terlalu berat (seperti LayoutLM) di tahap awal untuk menjaga sistem tetap cepat, deterministik, dan dapat dijalankan pada infrastruktur server internal yang ada.
5. **Gunakan PostgreSQL dengan tipe data JSONB** untuk koordinat spasial token, serta pastikan tabel riwayat koreksi (*audit trail*) aktif sejak hari pertama untuk kepatuhan standar audit.
