import React, { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus('Connected (Online)');
        setBackendData(data);
      })
      .catch(() => {
        setBackendStatus('Backend Offline (Run: uvicorn app.main:app --reload)');
      });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Internal OCR Document Analyzer</h1>
        <p className="subtitle">Milestone 0: Project Preparation & Environment Setup</p>
      </header>

      <main className="card">
        <h2>Status Verifikasi Lingkungan</h2>
        <ul className="status-list">
          <li>
            <span>Frontend Client:</span>
            <span className="badge badge-success">React 18 + Vite (Port 5173)</span>
          </li>
          <li>
            <span>Backend API:</span>
            <span className={`badge ${backendData ? 'badge-success' : 'badge-warning'}`}>
              {backendStatus}
            </span>
          </li>
          <li>
            <span>Target OCR Engine:</span>
            <span className="badge badge-neutral">PaddleOCR PP-OCRv4 (Milestone 1)</span>
          </li>
          <li>
            <span>Data Privacy:</span>
            <span className="badge badge-success">100% Local / Air-Gapped Ready</span>
          </li>
        </ul>

        <div className="hint-box">
          <strong>Catatan Milestone 0:</strong>
          <p>
            Fondasi proyek telah berhasil disiapkan secara modular. Backend dan frontend telah
            terpisah dan siap memasuki tahap <em>Milestone 1 (Backend OCR Engine Prototype)</em>.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
