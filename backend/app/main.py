from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Inisialisasi instance aplikasi FastAPI untuk Milestone 0 (Project Preparation)
app = FastAPI(
    title="Internal OCR Document Analyzer API",
    description="Backend REST API untuk OCR Text Overlay System (Milestone 0: Preparation)",
    version="0.1.0",
)

# Konfigurasi CORS agar frontend React Vite (http://localhost:5173) dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Endpoint root untuk verifikasi ketersediaan server."""
    return {
        "status": "online",
        "service": "Internal OCR Document Analyzer API",
        "milestone": "Milestone 0 (Project Preparation)",
    }


@app.get("/health")
def health_check():
    """Endpoint health check sederhana untuk verifikasi koneksi frontend."""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "milestone": "0",
    }
