
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  // React 19.0.0 mounting
  root.render(<App />);
} catch (error) {
  console.error("Fatal Application Error during mount:", error);
  rootElement.innerHTML = `
    <div style="height: 100vh; background: #0c0a09; color: #ef4444; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; font-family: sans-serif;">
      <div>
        <h1 style="margin-bottom: 10px;">Sanad Terputus</h1>
        <p style="color: #a8a29e; font-size: 14px;">Gagal memuat aplikasi. Mohon pastikan lingkungan (environment) sudah selaras.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 8px; cursor: pointer;">Coba Lagi</button>
      </div>
    </div>
  `;
}
