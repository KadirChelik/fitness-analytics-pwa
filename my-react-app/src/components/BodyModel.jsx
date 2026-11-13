import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- YARDIMCI RENK VE METİN FONKSİYONLARI ---
const getColor = (value) => {
  if (!value || value === 0) return "#e2e8f0"; // Gri (Boş)
  if (value < 25) return "#60a5fa"; // Açık Mavi
  if (value < 50) return "#2563eb"; // Koyu Mavi
  if (value < 75) return "#8b5cf6"; // Mor
  return "#ef4444"; // Kırmızı (Max)
};

const getIntensityText = (value) => {
  if (!value) return "Dinlenmiş";
  if (value < 25) return "Hafif Yorgun";
  if (value < 50) return "Orta Yorgun";
  if (value < 75) return "Çok Yorgun";
  return "Tükenmiş 🔥";
};

// --- MUSCLE PATH BİLEŞENİ (DIŞARI ALINDI - Performans İçin Şart) ---
const MusclePath = ({ d, muscleKey, name, opacity = 1, muscleData, setHoveredMuscle }) => {
  const value = muscleData?.[muscleKey] || 0;
  const color = getColor(value);
  const isHighIntensity = value >= 75;

  return (
    <motion.path
      d={d}
      stroke="white"
      strokeWidth="1.5"
      // Initial'ı sildik veya sabit verdik ki her render'da yanıp sönmesin
      initial={{ fill: "#e2e8f0", opacity: opacity }} 
      animate={{ 
        fill: color,
        opacity: opacity,
        filter: isHighIntensity ? "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.5))" : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
      }}
      whileHover={{ 
        scale: 1.05, 
        filter: "drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.6))", // Hover parlaması
        zIndex: 10
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }} // Yumuşak geçiş
      
      onMouseEnter={() => setHoveredMuscle({ name, value, intensity: getIntensityText(value) })}
      onMouseLeave={() => setHoveredMuscle(null)}
      
      className="cursor-pointer outline-none"
      style={{ transformOrigin: 'center' }} // Büyüme efekti merkezden olsun
    />
  );
};

// --- ANA BİLEŞEN ---
const BodyModel = ({ muscleData }) => {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden h-full">
      
      {/* HEADER & TOOLTIP */}
      <div className="w-full flex justify-between items-start mb-4 z-20 h-12 relative">
        <div>
           <h3 className="font-bold text-slate-800 flex items-center">
             🤖 Kas Haritası 
             <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
           </h3>
           <p className="text-xs text-slate-400">Son 30 günün analizi</p>
        </div>

        {/* Akıcı Tooltip Animasyonu */}
        <AnimatePresence>
          {hoveredMuscle && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl absolute right-0 top-0 border border-slate-700"
            >
              <p className="font-bold text-sm text-blue-200">{hoveredMuscle.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-12 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(hoveredMuscle.value, 100)}%` }}
                  ></div>
                </div>
                <span className="text-gray-300">{hoveredMuscle.value}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{hoveredMuscle.intensity}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VÜCUT ÇİZİMİ */}
      <div className="flex justify-center space-x-2 h-full w-full py-2 z-10">
        
        {/* --- ÖN (FRONT) --- */}
        <div className="h-full relative w-1/2 max-w-[120px]">
          <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-xl" style={{ overflow: 'visible' }}>
            {/* Sabit Parçalar */}
            <circle cx="100" cy="35" r="25" fill="#cbd5e1" />
            <rect x="85" y="60" width="30" height="20" fill="#cbd5e1" />
            <path d="M40 170 L 30 230 L 50 230 L 55 160 Z" fill="#cbd5e1" />
            <path d="M160 170 L 170 230 L 150 230 L 145 160 Z" fill="#cbd5e1" />

            {/* İnteraktif Parçalar */}
            <MusclePath muscleKey="shoulders" name="Ön Omuz" d="M50 75 Q 30 90 35 120 L 55 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="shoulders" name="Ön Omuz" d="M150 75 Q 170 90 165 120 L 145 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="chest" name="Göğüs" d="M60 80 Q 100 90 140 80 L 140 130 Q 100 160 60 130 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="biceps" name="Biceps" d="M35 120 Q 25 150 40 170 L 55 160 Q 50 140 55 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="biceps" name="Biceps" d="M165 120 Q 175 150 160 170 L 145 160 Q 150 140 145 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="abs" name="Karın (Abs)" d="M75 130 Q 100 135 125 130 L 120 200 Q 100 210 80 200 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="abs" name="Yan Karın" d="M60 130 L 75 130 L 80 200 L 60 190 Z" opacity={0.8} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="abs" name="Yan Karın" d="M140 130 L 125 130 L 120 200 L 140 190 Z" opacity={0.8} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Ön Bacak" d="M60 200 Q 40 250 50 320 L 95 310 L 100 210 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Ön Bacak" d="M140 200 Q 160 250 150 320 L 105 310 L 100 210 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Kalf" d="M50 320 L 60 400 L 90 390 L 95 320 Z" opacity={0.6} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Kalf" d="M150 320 L 140 400 L 110 390 L 105 320 Z" opacity={0.6} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
          </svg>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">ÖN</p>
        </div>

        {/* --- ARKA (BACK) --- */}
        <div className="h-full relative w-1/2 max-w-[120px]">
          <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-xl" style={{ overflow: 'visible' }}>
            <circle cx="100" cy="35" r="25" fill="#cbd5e1" />
            <rect x="85" y="60" width="30" height="20" fill="#cbd5e1" />

            <MusclePath muscleKey="back" name="Trapez" d="M60 75 L 100 110 L 140 75 L 100 60 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="shoulders" name="Arka Omuz" d="M50 75 Q 30 90 35 120 L 55 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="shoulders" name="Arka Omuz" d="M150 75 Q 170 90 165 120 L 145 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="back" name="Sırt (Kanat)" d="M60 110 L 100 180 L 140 110 L 100 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="back" name="Sırt (Kanat)" d="M60 80 L 55 140 L 80 160 L 100 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="back" name="Sırt (Kanat)" d="M140 80 L 145 140 L 120 160 L 100 110 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="triceps" name="Arka Kol" d="M35 120 Q 20 150 40 170 L 50 160 L 55 120 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="triceps" name="Arka Kol" d="M165 120 Q 180 150 160 170 L 150 160 L 145 120 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="back" name="Bel" d="M80 160 L 120 160 L 115 190 L 85 190 Z" opacity={0.6} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Kalça" d="M60 200 Q 80 250 100 260 L 100 200 Z" opacity={0.8} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Kalça" d="M140 200 Q 120 250 100 260 L 100 200 Z" opacity={0.8} muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Arka Bacak" d="M60 260 Q 50 300 60 330 L 95 330 L 100 260 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            <MusclePath muscleKey="legs" name="Arka Bacak" d="M140 260 Q 150 300 140 330 L 105 330 L 100 260 Z" muscleData={muscleData} setHoveredMuscle={setHoveredMuscle} />
            
            {/* Kalf için Elips Yerine Path (Daha stabil) */}
            <motion.path 
               d="M75 330 Q 60 360 75 390 Q 90 360 75 330 Z" // Basit damla şekli
               fill={getColor(muscleData?.legs)} 
               onMouseEnter={() => setHoveredMuscle({ name: "Kalf", value: muscleData?.legs, intensity: getIntensityText(muscleData?.legs) })}
               onMouseLeave={() => setHoveredMuscle(null)}
               className="cursor-pointer"
               whileHover={{ scale: 1.1 }}
            />
            <motion.path 
               d="M125 330 Q 110 360 125 390 Q 140 360 125 330 Z" 
               fill={getColor(muscleData?.legs)} 
               onMouseEnter={() => setHoveredMuscle({ name: "Kalf", value: muscleData?.legs, intensity: getIntensityText(muscleData?.legs) })}
               onMouseLeave={() => setHoveredMuscle(null)}
               className="cursor-pointer"
               whileHover={{ scale: 1.1 }}
            />
          </svg>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">ARKA</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-center space-x-3 mt-4 w-full bg-slate-50 p-2 rounded-xl border border-slate-200/50">
        <div className="flex items-center text-[10px] text-slate-500 font-bold"><span className="w-2 h-2 bg-red-500 rounded-full mr-1 shadow-[0_0_5px_red]"></span> Max</div>
        <div className="flex items-center text-[10px] text-slate-500 font-bold"><span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span> Çok</div>
        <div className="flex items-center text-[10px] text-slate-500 font-bold"><span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span> Orta</div>
        <div className="flex items-center text-[10px] text-slate-500 font-bold"><span className="w-2 h-2 bg-blue-300 rounded-full mr-1"></span> Az</div>
      </div>
    </div>
  );
};

export default BodyModel;