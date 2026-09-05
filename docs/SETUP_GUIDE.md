# PANDUAN SETUP & PENGOPERASIAN LINGKUNGAN
## Project: Internal OCR Document Analyzer (Milestone 0)
**Status:** Local Development Environment Ready  
**Target:** 100% On-Premise / Localhost (Air-Gapped)  

---

## 1. PERSYARATAN PERANGKAT LUNAK (SOFTWARE REQUIREMENTS)

Sebelum menjalankan project di komputer lokal, pastikan software berikut telah terinstal pada sistem:

1. **Python:** Versi 3.10 atau 3.11 (64-bit).
   - Verifikasi: `python --version`
2. **Node.js:** Versi 18 LTS atau 20 LTS.
   - Verifikasi: `node --version` dan `npm --version`
3. **Git:** Versi 2.30+.
   - Verifikasi: `git --version`
4. **Visual C++ Redistributable (Khusus Pengguna Windows):**
   - Microsoft Visual C++ 2015–2022 Redistributable (x64) diperlukan untuk modul C++ OpenCV dan PaddleOCR di masa mendatang.

---

## 2. STRUKTUR DIREKTORI PROJECT

```
d:/OCR/
│
├── backend/                       # Layanan Backend API (Python FastAPI)
│   ├── .venv/                     # Virtual Environment lokal (diabaikan Git)
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py                # Entry point FastAPI & Health Check
│   └── requirements.txt           # Dependensi Python (fastapi, uvicorn)
│
├── frontend/                      # Antarmuka Klien (React 18 + Vite)
│   ├── node_modules/              # Dependensi npm (diabaikan Git)
│   ├── src/
│   │   ├── App.jsx                # Komponen utama & indikator status backend
│   │   ├── main.jsx               # Entry point React
│   │   └── index.css              # Styling antarmuka
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── storage/                       # Direktori Penyimpanan Dokumen Finansial
│   ├── uploads/                   # Citra dokumen asli yang diunggah (diabaikan Git)
│   └── preprocessed/              # Citra kerja prapemrosesan OpenCV (diabaikan Git)
│
├── test_data/                     # Sampel dokumen untuk uji coba lokal (diabaikan Git)
│
├── docs/                          # Dokumentasi Resmi Proyek
│   ├── TECHNICAL_SPECIFICATION.md # Arsitektur lengkap & rencana enterprise
│   ├── MVP_SPECIFICATION.md       # Spesifikasi teknis khusus MVP
│   ├── DEVELOPMENT_CHECKLIST.md   # Panduan milestone implementasi & QA
│   ├── CODING_RULES.md            # Standar koding & batasan implementasi
│   └── SETUP_GUIDE.md             # Dokumen ini
│
└── .gitignore                     # Proteksi kebocoran dokumen & folder dependensi
```

---

## 3. CARA MENJALANKAN BACKEND (FASTAPI)

### Langkah 1: Navigasi ke Direktori Backend
Buka terminal (PowerShell atau Command Prompt) dan arahkan ke direktori backend:
```powershell
cd d:\OCR\backend
```

### Langkah 2: Pembuatan & Aktivasi Virtual Environment
Jika `.venv` belum dibuat:
```powershell
python -m venv .venv
```
Aktifkan virtual environment:
- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt):**
  ```cmd
  .\.venv\Scripts\activate.bat
  ```

### Langkah 3: Instalasi Dependensi Dasar (Milestone 0)
```powershell
pip install -r requirements.txt
```

### Langkah 4: Jalankan Development Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Akses API Root:** `http://localhost:8000/`
- **Akses Health Check:** `http://localhost:8000/health`
- **Akses Dokumentasi Interaktif (Swagger UI):** `http://localhost:8000/docs`

---

## 4. CARA MENJALANKAN FRONTEND (REACT + VITE)

### Langkah 1: Navigasi ke Direktori Frontend
Buka terminal baru dan arahkan ke direktori frontend:
```powershell
cd d:\OCR\frontend
```

### Langkah 2: Instalasi Dependensi Node.js
```powershell
npm install
```

### Langkah 3: Jalankan Development Server
```powershell
npm run dev
```
- **Akses Antarmuka Web:** `http://localhost:5173`
- Halaman web akan memverifikasi koneksi ke backend di `http://localhost:8000/health` secara otomatis.

---

## 5. VERIFIKASI KEBERHASILAN (ACCEPTANCE TEST MILESTONE 0)

1. Backend berjalan di port `8000` dan mengembalikan JSON status: `{"status":"healthy","version":"0.1.0"}`.
2. Frontend berjalan di port `5173` dan menampilkan kartu status verifikasi lingkungan.
3. Seluruh alur berjalan 100% pada localhost tanpa sambungan internet luar.
