# PANDUAN IMPLEMENTASI & DEVELOPMENT CHECKLIST
## Project: Internal OCR Document Analyzer (Text Overlay System)
**Kategori:** Financial & Accounting Audit Tool  
**Dokumen:** Step-by-Step Development Roadmap & QA Checklist  
**Target:** 100% On-Premise / Localhost (Air-Gapped Ready)  
**Versi:** 1.0.0 (MVP Implementation Phase)  

---

## DAFTAR ISI
1. [Development Principles (Prinsip Pengembangan)](#1-development-principles)
2. [Milestone 0: Project Preparation & Environment Setup](#2-milestone-0-project-preparation--environment-setup)
3. [Milestone 1: Backend OCR Engine Prototype](#3-milestone-1-backend-ocr-engine-prototype)
4. [Milestone 2: Backend API & Data Ingestion](#4-milestone-2-backend-api--data-ingestion)
5. [Milestone 3: Frontend Basic Interface & Uploader](#5-milestone-3-frontend-basic-interface--uploader)
6. [Milestone 4: Interactive Text Overlay Viewer (Fitur Utama)](#6-milestone-4-interactive-text-overlay-viewer-fitur-utama)
7. [Milestone 5: Testing, Akurasi, dan Evaluasi Sampel](#7-milestone-5-testing-akurasi-dan-evaluasi-sampel)
8. [Milestone 6: Penyempurnaan MVP & Persistence](#8-milestone-6-penyempurnaan-mvp--persistence)
9. [Definition of Done (DoD) MVP](#9-definition-of-done-dod-mvp)

---

## 1. DEVELOPMENT PRINCIPLES

Sebelum menulis baris kode pertama, seluruh tim pengembang wajib mematuhi 6 aturan dasar berikut:

1. **Anti Over-Engineering:**
   - Fokus hanya pada pembuktian hipotesis utama: *"Gambar Asli + Text Overlay Presisi"*.
   - Dilarang menambahkan sistem login, otorisasi multi-role, microservices, container orkestrasi kompleks, atau Redis/Celery pada tahap MVP.
2. **Prioritas Mutlak pada Fitur Inti (Core First):**
   - Keberhasilan project diukur dari presisi koordinat overlay dan kemudahan auditor menyalin angka (*click-to-copy*), bukan dari banyaknya fitur sampingan.
3. **Validasi Kualitas OCR Sebelum Menambah AI Lanjutan:**
   - Optimalkan hasil pembacaan PaddleOCR dan prapemrosesan OpenCV terlebih dahulu.
   - Jangan terburu-buru memasang LayoutLM, Donut, atau LLM lokal sebelum pipeline OCR dasar terbukti stabil dan akurat membaca angka akuntansi.
4. **Zero Cloud API (Strict Air-Gapped):**
   - Dilarang keras menggunakan API pihak ketiga (OpenAI, Google Cloud Vision, AWS Textract, dll.).
   - Seluruh binary, pustaka, dan bobot model AI harus dapat dieksekusi secara lokal tanpa sambungan internet.
5. **Integritas Dokumen Asli:**
   - File citra asli yang diunggah tidak boleh dimanipulasi secara visual atau ditimpa oleh gambar hasil filter. Citra asli adalah referensi hukum/audit yang permanen.
6. **Fail-Fast & Iteratif:**
   - Selesaikan dan verifikasi acceptance criteria di setiap milestone sebelum melangkah ke milestone berikutnya.

---

## 2. MILESTONE 0: PROJECT PREPARATION & ENVIRONMENT SETUP

### 2.1 Tujuan
Mempersiapkan struktur direktori project, virtual environment Python, workspace Node.js, repositori Git, dan file konfigurasi awal agar lingkungan pengembangan terisolasi dan siap digunakan.

### 2.2 Checklist Task
- [ ] Inisialisasi Git repository lokal (`git init`).
- [ ] Buat file `.gitignore` komprehensif (mengabaikan `node_modules/`, `venv/`, `__pycache__/`, `storage/uploads/*`, `.sqlite`, `.env`).
- [ ] Buat struktur folder utama project:
  - `backend/`
  - `frontend/`
  - `docs/`
- [ ] **Setup Lingkungan Backend (Python):**
  - Buat Python Virtual Environment (`python -m venv venv`).
  - Aktivasi virtual environment.
  - Buat file `backend/requirements.txt` awal dengan daftar dependensi:
    - `fastapi`
    - `uvicorn[standard]`
    - `python-multipart`
    - `paddlepaddle`
    - `paddleocr`
    - `opencv-python-headless`
    - `numpy`
    - `pillow`
    - `pydantic`
- [ ] **Setup Lingkungan Frontend (Node.js):**
  - Pastikan Node.js (LTS v18+ atau v20+) terpasang.
  - Inisialisasi project React menggunakan Vite (`npm create vite@latest frontend -- --template react`).
  - Masuk ke folder `frontend` dan jalankan `npm install`.
- [ ] Buat folder penyimpanan lokal untuk backend:
  - `backend/storage/uploads/`
  - `backend/storage/preprocessed/`
- [ ] Buat file dummy `.gitkeep` di dalam folder storage agar struktur folder terlacak di Git.

### 2.3 Output yang Dihasilkan
- Struktur repositori bersih dengan backend Python dan frontend React terpisah.
- Virtual environment aktif dan dependensi terpasang tanpa bentrok versi.

### 2.4 Acceptance Criteria
- [ ] Perintah `uvicorn --version` dan `python -c "import cv2; import paddleocr"` berhasil dieksekusi di terminal backend tanpa error import.
- [ ] Perintah `npm run dev` di folder frontend berhasil memunculkan halaman default Vite di `http://localhost:5173`.
- [ ] Direktori backend dan frontend memiliki siklus kerja mandiri.

### 2.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** Instalasi `paddlepaddle` di sistem operasi Windows terkadang membutuhkan Visual C++ Redistributable 2015-2022.
- **Mitigasi:** Pastikan Microsoft Visual C++ Redistributable terpasang pada OS Windows developer sebelum menginstal PaddlePaddle.

---

## 3. MILESTONE 1: BACKEND OCR ENGINE PROTOTYPE

### 3.1 Tujuan
Membuktikan secara mandiri via script terminal bahwa library **PaddleOCR** dan **OpenCV** lokal mampu membaca citra satu lembar dokumen hardcopy (faktur/nota) serta menghasilkan teks, skor confidence, dan koordinat poligon/bounding box.

### 3.2 Checklist Task
- [ ] Sediakan 1 gambar sampel dokumen faktur/nota nyata (`sample_invoice.jpg`) di folder root backend.
- [ ] Buat script Python pengujian mandiri: `backend/test_ocr_prototype.py`.
- [ ] Di dalam script:
  - Inisialisasi model PaddleOCR (`PaddleOCR(use_angle_cls=True, lang='en')`).
  - Baca gambar menggunakan OpenCV (`cv2.imread`).
  - Lakukan prapemrosesan sederhana: konversi ke Grayscale dan penyesuaian kontras ringan.
  - Jalankan fungsi OCR: `ocr.ocr(img_path, cls=True)`.
  - Parse hasil pembacaan ke dalam struktur data list/dictionary:
    - `text`: string karakter yang dibaca.
    - `confidence`: float tingkat keyakinan (0.00 - 1.00).
    - `box`: koordinat poligon 4-titik `[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]`.
  - Hitung koordinat bounding box persegi: `[x_min, y_min, width, height]`.
  - Cetak hasil ekstrak ke terminal dalam format JSON rapi (*pretty print*).
- [ ] Verifikasi bahwa karakter alfabet dan angka (seperti nomor nota dan nominal) berhasil terbaca.

### 3.3 Output yang Dihasilkan
- Script `test_ocr_prototype.py` yang dapat dieksekusi secara offline.
- Output terminal berupa array JSON berisi teks, skor confidence, dan koordinat.

### 3.4 Acceptance Criteria
- [ ] Diberikan file input `sample_invoice.jpg`.
- [ ] Script dieksekusi via terminal: `python test_ocr_prototype.py`.
- [ ] Script menghasilkan output terstruktur tanpa error:
  ```json
  [
    {
      "text": "742",
      "confidence": 0.985,
      "box": {"x": 120, "y": 85, "width": 65, "height": 28}
    }
  ]
  ```
- [ ] Seluruh proses berlangsung 100% lokal tanpa melakukan koneksi jaringan internet.

### 3.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** PaddleOCR mengunduh bobot model (*pretrained model weights*) saat pertama kali dieksekusi. Jika mesin tidak memiliki koneksi saat pertama kali run, inisialisasi akan gagal.
- **Mitigasi:** Jalankan inisialisasi pertama kali pada saat setup lingkungan development (atau letakkan file bobot model `.tar` di direktori cache lokal `~/.paddleocr/`).

---

## 4. MILESTONE 2: BACKEND API & DATA INGESTION

### 4.1 Tujuan
Membangun REST API menggunakan FastAPI untuk menerima unggahan berkas gambar dari klien, memvalidasi berkas, menjalankan pipeline prapemrosesan OpenCV dan inferensi PaddleOCR, lalu mengembalikan data JSON terstruktur ke frontend.

### 4.2 Checklist Task
- [ ] Buat file arsitektur backend:
  - `backend/app/main.py`
  - `backend/app/config.py`
  - `backend/app/schemas.py`
  - `backend/app/services/preprocessor.py`
  - `backend/app/services/ocr_engine.py`
  - `backend/app/routers/documents.py`
- [ ] **Konfigurasi CORS & Middleware (`main.py`):**
  - Izinkan CORS untuk domain frontend `http://localhost:5173` agar browser tidak memblokir request.
- [ ] **Modul Preprocessing (`preprocessor.py`):**
  - Buat fungsi `preprocess_image(input_path, output_path)`:
    - Baca gambar via OpenCV.
    - Dapatkan resolusi asli `(width, height)`.
    - Lakukan resizing proporsional jika lebar > 2000 piksel.
    - Terapkan filter Grayscale dan penajaman kontras adaptif (CLAHE).
    - Simpan hasilnya ke `backend/storage/preprocessed/`.
- [ ] **Modul OCR Engine (`ocr_engine.py`):**
  - Buat singleton class / service wrapper untuk instance PaddleOCR agar model tidak dimuat ulang di setiap request (menghemat RAM dan waktu respon).
  - Buat fungsi `extract_text_and_boxes(image_path, orig_w, orig_h)`:
    - Menghasilkan token dengan koordinat absolut dan koordinat ternormalisasi (rasio 0.0 - 1.0).
- [ ] **Endpoint Ingestion (`documents.py`):**
  - Buat endpoint `POST /api/documents/process`:
    - Validasi tipe MIME (`image/jpeg`, `image/png`).
    - Validasi ukuran file (maksimal 15MB).
    - Simpan file fisik ke folder `backend/storage/uploads/` dengan nama berbasis timestamp/UUID.
    - Jalankan pipeline preprocessing OpenCV.
    - Jalankan ekstraksi PaddleOCR.
    - Kembalikan response JSON sesuai skema kontrak MVP.
- [ ] **Endpoint Static / Image Serving:**
  - Buat endpoint `GET /api/documents/{doc_id}/image` untuk menyajikan citra asli ke frontend.

### 4.3 Output yang Dihasilkan
- Server API FastAPI yang berjalan di `http://localhost:8000`.
- Endpoint interaktif yang dapat diuji melalui Swagger UI (`http://localhost:8000/docs`).

### 4.4 Acceptance Criteria
- [ ] Pengujian upload via Postman / Swagger UI (`POST /api/documents/process`) dengan file `invoice.jpg` berhasil mengembalikan status `HTTP 200 OK`.
- [ ] Payload response JSON memuat:
  - `document_id`
  - `image_url`
  - `image_width` dan `image_height`
  - `ocr_results` (array berisi objek `text`, `confidence`, `box`, `normalized_box`).
- [ ] Mengakses URL `image_url` via browser menampilkan gambar asli dokumen secara utuh.

### 4.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** Waktu inferensi terlalu lambat jika gambar beresolusi 4K (4000x3000 piksel).
- **Mitigasi:** Fungsi prapemrosesan harus secara otomatis mereduksi dimensi citra kerja OCR ke batas lebar 1800–2000 piksel, namun tetap mempertahankan metadata resolusi asli untuk pemetaan koordinat.

---

## 5. MILESTONE 3: FRONTEND BASIC INTERFACE & UPLOADER

### 5.1 Tujuan
Membangun antarmuka web interaktif menggunakan React + Vite untuk memungkinkan pengguna mengunggah gambar dokumen, melihat pratinjau gambar asli, serta mengelola status pemrosesan (*loading state*).

### 5.2 Checklist Task
- [ ] Setup struktur file di dalam `frontend/src/`:
  - `components/Uploader.jsx`
  - `components/ZoomControls.jsx`
  - `components/ResultsSidebar.jsx`
  - `services/api.js`
  - `App.jsx`
  - `index.css`
- [ ] **Komponen Uploader (`Uploader.jsx`):**
  - Buat area dropzone yang mendukung *drag-and-drop* file citra.
  - Buat tombol fallback *"Pilih File dari Komputer"*.
  - Tambahkan validasi tipe file di sisi client (hanya menerima file `.jpg`, `.jpeg`, `.png`).
- [ ] **State Management di `App.jsx`:**
  - `file`: file objek yang dipilih.
  - `isLoading`: boolean penanda proses upload/OCR sedang berjalan.
  - `documentData`: objek penyimpan respons JSON dari backend.
  - `selectedToken`: token teks yang sedang aktif/diklik.
  - `zoomLevel`: tingkat perbesaran kanvas (default: 1.0 atau 100%).
- [ ] **Integrasi API Client (`services/api.js`):**
  - Buat fungsi `processDocument(file)` yang mengirimkan `FormData` via HTTP POST ke endpoint backend.
- [ ] **Tampilan Loading State:**
  - Tampilkan animasi spinner atau status bar yang jelas saat backend sedang menganalisis dokumen: *"Sedang memproses citra dan membaca teks..."*.

### 5.3 Output yang Dihasilkan
- Antarmuka web modern di browser yang responsif, rapi, dan intuitif.
- Alur upload yang berfungsi dari sisi client hingga menerima payload JSON dari backend.

### 5.4 Acceptance Criteria
- [ ] Pengguna dapat menyeret (*drag-and-drop*) file foto faktur ke browser.
- [ ] Tampilan loading muncul saat tombol proses ditekan.
- [ ] Gambar dokumen berhasil ditampilkan di area kerja utama browser setelah proses selesai.
- [ ] Data respons JSON tersimpan dengan aman pada state React tanpa error rendering di console.

### 5.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** Request upload gagal karena CORS terblokir atau batasan payload request di server.
- **Mitigasi:** Konfigurasi `CORSMiddleware` di FastAPI dengan izin eksplisit ke `http://localhost:5173` dan handle error HTTP jika backend belum aktif.

---

## 6. MILESTONE 4: INTERACTIVE TEXT OVERLAY VIEWER (FITUR UTAMA)

### 6.1 Tujuan
Membangun komponen inti **OverlayViewer** yang memetakan layer teks hasil OCR tepat 1:1 di atas gambar fisik dokumen asli, mendukung perbesaran gambar (*zooming*), serta fitur *click-to-copy*.

### 6.2 Checklist Task
- [ ] **Komponen Viewport (`OverlayViewer.jsx`):**
  - Buat kontainer relatif (`position: relative; overflow: hidden;`) untuk menampung gambar dan layer overlay.
  - Pasang tag `<img>` yang merender `image_url` dari backend.
  - Gunakan referensi DOM (`useRef`) untuk mengukur dimensi rendered aktual gambar (`renderedWidth`, `renderedHeight`).
- [ ] **Matematika Sinkronisasi Koordinat:**
  - Implementasikan algoritma pemetaan koordinat ternormalisasi:
    $$\text{top} = \text{token.normalized\_box.y\_min} \times \text{renderedHeight}$$
    $$\text{left} = \text{token.normalized\_box.x\_min} \times \text{renderedWidth}$$
    $$\text{width} = (\text{token.normalized\_box.x\_max} - \text{token.normalized\_box.x\_min}) \times \text{renderedWidth}$$
    $$\text{height} = (\text{token.normalized\_box.y\_max} - \text{token.normalized\_box.y\_min}) \times \text{renderedHeight}$$
  - Tambahkan event listener `window.onresize` agar posisi kotak overlay selalu dikalkulasi ulang saat ukuran jendela browser berubah.
- [ ] **Styling & Interaktivitas Bounding Box:**
  - Setiap token teks dirender sebagai elemen `<span>` atau `<div>` dengan posisi absolut (`position: absolute`).
  - Berikan border halus semi-transparan (contoh: `border: 1px solid rgba(59, 130, 246, 0.5)`).
  - Efek Hover: Berikan highlight warna kuning/biru terang saat kursor mouse melintas di atas teks.
  - Tooltip: Tampilkan teks terbaca dan confidence score saat hover.
- [ ] **Fitur Click-to-Copy:**
  - Tambahkan event `onClick` pada setiap kotak token:
    - Salin `token.text` ke clipboard menggunakan `navigator.clipboard.writeText()`.
    - Munculkan feedback visual toast sederhana: *"Tersalin: [text]"*.
- [ ] **Fitur Navigasi Zoom (`ZoomControls.jsx`):**
  - Buat tombol: *Zoom In* (+25%), *Zoom Out* (-25%), dan *Reset*.
  - Terapkan transformasi skala CSS (`transform: scale(zoomLevel)`) pada kontainer pembungkus utama agar gambar dan overlay membesar/mengecil bersamaan secara sempurna (*zero desynchronization*).
- [ ] **Komponen Sidebar Hasil (`ResultsSidebar.jsx`):**
  - Tampilkan daftar urut semua teks yang terbaca di panel samping kanan.
  - Hubungkan interaksi: Mengklik teks pada sidebar otomatis menyorot kotak overlay yang sesuai di gambar.

### 6.3 Output yang Dihasilkan
- Komponen Text Overlay interaktif dengan tampilan mirip Google Lens / PDF text layer.
- Kemampuan menyalin teks/angka akuntansi langsung dari gambar dokumen fisik hanya dengan satu klik.

### 6.4 Acceptance Criteria
- [ ] Teks hasil OCR (contoh: `"No Faktur: 742"` dan `"19.020.000"`) muncul tepat di atas posisi tulisan fisik pada foto dokumen.
- [ ] Mengklik kotak overlay otomatis menyalin string ke clipboard (dapat di-paste ke Notepad/Excel).
- [ ] Melakukan Zoom In (hingga 200%) atau Zoom Out (hingga 50%) tidak membuat posisi kotak teks overlay bergeser dari tulisan aslinya.
- [ ] Navigasi zoom berjalan mulus tanpa lag visual.

### 6.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** Kotak overlay teks bergeser beberapa piksel jika aspek rasio tag `<img>` terdistorsi oleh CSS (`object-fit`).
- **Mitigasi:** Pastikan tag `<img>` mempertahankan aspek rasio alami (`height: auto; max-width: 100%; display: block;`) dan ukuran overlay layer dikunci secara ketat mengikuti ukuran aktual gambar (`naturalWidth` vs `clientWidth`).

---

## 7. MILESTONE 5: TESTING, AKURASI, DAN EVALUASI SAMPEL

### 7.1 Tujuan
Menguji kehandalan, ketepatan posisi, dan akurasi pembacaan angka pada berbagai kondisi dokumen akuntansi riil.

### 7.2 Checklist Task
- [ ] **Siapkan Dataset Pengujian Sampel Nyata (Minimal 10 Sampel Dokumen):**
  - [ ] 2 Sampel Faktur Standar Komputer (teks dan angka bersih, 300 DPI).
  - [ ] 2 Sampel Nota/Struk Belanja Thermal (huruf dot matrix / cetakan pudar).
  - [ ] 2 Sampel Rekening Koran / Tabel Akuntansi (banyak angka rapat dan pemisah titik/koma).
  - [ ] 2 Sampel Foto Ponsel Sudut Sedikit Miring (terdapat sedikit bayangan/noise).
  - [ ] 2 Sampel Kwitansi dengan tulisan ketik dan stempel basah.
- [ ] **Jalankan Uji Coba End-to-End:**
  - Unggah masing-masing dokumen melalui antarmuka web.
  - Evaluasi 3 indikator utama:
    1. *Keterbacaan Teks:* Apakah nama PT, nomor faktur, dan tanggal terbaca benar?
    2. *Presisi Angka:* Apakah angka nominal (contoh: `19.020.000`) terbaca utuh tanpa tertukar karakter (misal angka `0` menjadi huruf `O`)?
    3. *Presisi Koordinat:* Apakah kotak overlay menempel pas di atas tulisan aslinya?
- [ ] **Dokumentasikan Hasil Pengujian:**
  - Buat tabel laporan pengujian sederhana yang mencatat: nama file, persentase akurasi, kendala yang ditemukan, dan waktu pemrosesan.

### 7.3 Output yang Dihasilkan
- Matriks evaluasi hasil pengujian sampel dokumen akuntansi.
- Catatan batas toleransi pembacaan sistem (misal: batasan resolusi minimal yang disarankan).

### 7.4 Acceptance Criteria
- [ ] Akurasi pembacaan angka finansial pada dokumen cetak standar minimal 95%.
- [ ] Tidak ada bounding box teks yang meleset lebih dari 3 piksel pada rasio perbesaran 100%.
- [ ] Rata-rata waktu pemrosesan satu lembar dokumen berada di bawah 5 detik pada CPU lokal.
- [ ] Seluruh siklus pengujian berhasil dijalankan tanpa koneksi internet (*air-gapped confirmed*).

### 7.5 Risiko & Masalah yang Mungkin Muncul
- **Risiko:** Cetakan struk thermal yang pudar sering kali menghasilkan confidence score rendah atau angka tidak terbaca.
- **Mitigasi:** Catat kondisi ini untuk dioptimalkan pada filter peningkatan kontras OpenCV di Milestone 6.

---

## 8. MILESTONE 6: PENYEMPURNAAN MVP & PERSISTENCE

### 8.1 Tujuan
Menyempurnakan fungsionalitas sistem setelah fitur inti bekerja sempurna, mencakup penyimpanan riwayat dokumen ke database SQLite lokal, indikator visual confidence score, dan peningkatan filter OpenCV.

### 8.2 Checklist Task
- [ ] **Integrasi Database SQLite (`backend/app/database.py` & `models.py`):**
  - Setup SQLite lokal (`app_database.sqlite`) menggunakan SQLAlchemy.
  - Implementasikan tabel `documents` dan `ocr_results` sesuai skema spesifikasi MVP.
  - Setiap kali proses OCR berhasil, simpan metadata dokumen dan seluruh token hasil pembacaan ke database secara otomatis.
- [ ] **Endpoint Riwayat Dokumen:**
  - Buat endpoint `GET /api/documents` untuk melihat daftar dokumen yang pernah dianalisis sebelumnya.
  - Buat endpoint `GET /api/documents/{doc_id}` untuk membuka kembali hasil OCR dokumen lama tanpa perlu menjalankan proses OCR ulang.
- [ ] **Pewarnaan Visual Confidence Score:**
  - Modifikasi styling kotak overlay pada frontend:
    - Confidence $\ge 90\%$: Border hijau lembut / netral.
    - Confidence $75\% - 89\%$: Border kuning (peringatan ringan).
    - Confidence $< 75\%$: Border oranye/merah (memberi sinyal visual kepada auditor untuk memverifikasi ulang angka tersebut).
- [ ] **Peningkatan Preprocessing OpenCV:**
  - Tambahkan fungsi auto-leveling kontras adaptif untuk meningkatkan keterbacaan teks pudar pada struk nota belanja.

### 8.3 Output yang Dihasilkan
- Aplikasi MVP yang stabil dengan riwayat dokumen tersimpan di SQLite.
- Tampilan overlay cerdas yang langsung memandu mata auditor ke angka-angka yang meragukan melalui indikator warna.

### 8.4 Acceptance Criteria
- [ ] Dokumen yang pernah diunggah dapat dibuka kembali dalam waktu < 1 detik dari database lokal tanpa proses inferensi ulang.
- [ ] Bounding box dengan confidence rendah memiliki indikator visual yang jelas.
- [ ] File database `app_database.sqlite` terisi data secara benar dan konsisten.

---

## 9. DEFINITION OF DONE (DoD) MVP

Versi MVP dinyatakan **SELESAI dan SIAP DIGUNAKAN untuk uji coba operasional internal audit** apabila SELURUH kriteria berikut telah terpenuhi (100% Checklist Lolos):

- [ ] **Zero Internet Leakage:** Sistem dapat dijalankan sepenuhnya dengan kabel LAN dicabut / koneksi internet dimatikan. Tidak ada request keluar jaringan lokal.
- [ ] **Upload Berfungsi Mulus:** Pengguna dapat mengunggah file foto faktur/nota dalam format JPG/PNG tanpa crash.
- [ ] **PaddleOCR Lokal Berjalan:** Model OCR mendeteksi teks dan angka, menghasilkan bounding box serta skor keyakinan untuk setiap kata.
- [ ] **Text Overlay Menempel Presisi:** Teks hasil OCR ditampilkan di atas gambar asli pada posisi yang tepat 1:1.
- [ ] **Fungsionalitas Zoom Sinkron:** Navigasi Zoom In, Zoom Out, dan Reset berjalan mulus tanpa membuat posisi teks overlay bergeser dari gambar.
- [ ] **Fitur Click-to-Copy Berhasil:** Mengklik teks pada overlay berhasil menyalin isi karakter secara akurat ke clipboard sistem.
- [ ] **Persistence Berjalan:** Data dokumen dan koordinat tersimpan di SQLite lokal.
- [ ] **Code Cleanliness:** Kode backend dan frontend terstruktur rapi sesuai folder arsitektur, tanpa dependensi cloud eksternal.

---

## CATATAN PENGEMBANGAN SELANJUTNYA (PASCA-MVP)
Setelah seluruh checklist di atas selesai dan disetujui oleh tim audit:
- Implementasi **Fase 2:** Fitur rotasi kemiringan otomatis (*auto deskewing*) dan *perspective warp* untuk foto dokumen yang diambil miring dari kamera smartphone.
- Implementasi **Fase 3:** Fitur koreksi teks langsung pada kanvas (*inline editing*) dan pencatatan riwayat perubahan audit (*audit trail*).
- Implementasi **Fase 4 & 5:** Pengenalan pola data faktur Indonesia (regex format NPWP/Faktur/Rupiah) dan fitur export terstruktur ke file Microsoft Excel (`.xlsx`).
