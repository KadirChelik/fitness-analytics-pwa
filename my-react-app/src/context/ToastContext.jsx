import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Toast Ekleme
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  // Toast Silme (Listeden tamamen kaldırma)
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- ToastItem Bileşeni (Animasyon Mantığı Burada) ---
const ToastItem = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Süre dolunca veya kapatmaya basınca çalışacak fonksiyon
  const handleDismiss = useCallback(() => {
    setIsExiting(true); // 1. Çıkış animasyonunu başlat
    
    // 2. Animasyon süresi (400ms) kadar bekle, sonra DOM'dan sil
    setTimeout(() => {
      onRemove();
    }, 400); 
  }, [onRemove]);

  // Otomatik Kapanma Zamanlayıcısı
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, handleDismiss]);

  // Renk ve İkon Ayarları
  const styles = {
    success: { bg: 'bg-slate-800', border: 'border-green-500', icon: <CheckCircle className="text-green-400" size={20} /> },
    error: { bg: 'bg-slate-800', border: 'border-red-500', icon: <AlertCircle className="text-red-400" size={20} /> },
    info: { bg: 'bg-slate-800', border: 'border-blue-500', icon: <Info className="text-blue-400" size={20} /> }
  };

  const style = styles[toast.type] || styles.success;

  return (
    <div 
      className={`
        pointer-events-auto relative overflow-hidden flex items-center w-80 p-4 rounded-lg shadow-2xl border-l-4 text-white
        ${style.bg} ${style.border}
        ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}
      `}
    >
      {/* İkon ve Mesaj */}
      <div className="flex items-center gap-3 w-full">
        {style.icon}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>

      {/* Kapat Butonu */}
      <button onClick={handleDismiss} className="ml-auto text-gray-400 hover:text-white transition-colors">
        <X size={16} />
      </button>

      {/* Süre Barı (Progress Bar) */}
      <div 
        className={`absolute bottom-0 left-0 h-1 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
        style={{ 
          width: '100%', 
          // Çıkış animasyonu başladığında barı donduruyoruz veya gizliyoruz ki görsel bozulmasın
          animation: isExiting ? 'none' : `shrink ${toast.duration}ms linear forwards` 
        }}
      />
    </div>
  );
};