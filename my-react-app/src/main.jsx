import axios from 'axios';

// Eğer sitemiz localhost'ta ise kendi bilgisayarıma, 
// değilse Render'daki sunucuya istek at:
const backendURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://kn-fitness.onrender.com/'; // 👈 Render'dan aldığın linki buraya yapıştır

axios.defaults.baseURL = backendURL;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './context/ToastContext'; // 👈 Import et

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>  {/* 👈 Uygulamayı Sar */}
      <App />
    </ToastProvider>
  </React.StrictMode>,
);