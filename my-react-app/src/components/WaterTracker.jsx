import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Minus, Droplets } from 'lucide-react';

const WaterTracker = () => {
  const [data, setData] = useState({ count: 0, target: 10 });

  // Veriyi Çek
  useEffect(() => {
    const fetchWater = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/water/today', { headers: { 'x-auth-token': token } });
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchWater();
  }, []);

  // Güncelleme Fonksiyonu
  const updateWater = async (amount) => {
    // Optimistik Update (Arayüzde anında göster, bekletme)
    const newCount = Math.max(0, data.count + amount);
    setData(prev => ({ ...prev, count: newCount }));

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/water/update', { amount }, { headers: { 'x-auth-token': token } });
    } catch (err) {
      // Hata olursa geri al
      setData(prev => ({ ...prev, count: prev.count - amount }));
    }
  };

  // Doluluk Oranı Hesapla (Max %100)
  const percentage = Math.min((data.count / data.target) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-between h-full relative overflow-hidden">
      
      {/* Başlık */}
      <div className="z-10 w-full flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Droplets className="mr-2 text-blue-500" size={20} /> Su Takibi
        </h3>
        <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
          {data.count} / {data.target} Bardak
        </span>
      </div>

      {/* --- SU ŞİŞESİ GÖRSELİ --- */}
      <div className="relative w-32 h-48 bg-slate-50 rounded-b-[3rem] rounded-t-xl border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.05)] overflow-hidden mb-6 z-10 box-content ring-4 ring-slate-100">
        
        {/* Su Seviyesi (Animasyonlu) */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-blue-400"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          {/* Dalga Efekti (SVG) */}
     
          
          {/* Yükselen Baloncuklar */}
          <div className="w-full h-full relative opacity-50">
             <motion.div className="absolute bottom-2 left-4 w-2 h-2 bg-white rounded-full" animate={{ y: -120, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
             <motion.div className="absolute bottom-4 right-6 w-3 h-3 bg-white rounded-full" animate={{ y: -100, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }} />
             <motion.div className="absolute bottom-10 left-10 w-1 h-1 bg-white rounded-full" animate={{ y: -80, opacity: 0 }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} />
          </div>
        </motion.div>
        
        {/* Hedef Çizgisi */}
        <div className="absolute top-[20%] left-0 w-full border-t border-dashed border-slate-400/30"></div>
        <div className="absolute top-[50%] left-0 w-full border-t border-dashed border-slate-400/30"></div>
        
        {/* Bardak Sayısı Göstergesi (Ortada) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-4xl font-black text-slate-800/10 mix-blend-overlay">{data.count}</span>
        </div>
      </div>

      {/* Kontrol Butonları */}
      <div className="flex space-x-6 z-10 w-full justify-center">
        <button 
          onClick={() => updateWater(-1)} 
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
          disabled={data.count <= 0}
        >
          <Minus size={20} />
        </button>
        <button 
          onClick={() => updateWater(1)} 
          className="w-12 h-12 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 transition transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

    </div>
  );
};

export default WaterTracker;