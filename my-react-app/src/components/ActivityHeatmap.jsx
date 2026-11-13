import React from 'react';

const ActivityHeatmap = ({ workouts }) => {
  // Son 365 günün tarihlerini oluştur
  const today = new Date();
  const days = [];
  for (let i = 120; i >= 0; i--) { // Son 4 ay (120 gün) yeterli, çok yer kaplamasın
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Hangi gün antrenman var?
  const workoutMap = {};
  workouts.forEach(w => {
    const dateStr = new Date(w.date).toISOString().split('T')[0];
    workoutMap[dateStr] = (workoutMap[dateStr] || 0) + w.totalVolume;
  });

  const getColor = (date) => {
    const vol = workoutMap[date];
    if (!vol) return 'bg-gray-100'; // Boş
    if (vol < 5000) return 'bg-green-200'; // Hafif
    if (vol < 10000) return 'bg-green-400'; // Orta
    return 'bg-green-600'; // Ağır
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <h3 className="font-bold text-slate-800 mb-4">Aktivite Haritası (Son 4 Ay)</h3>
      <div className="flex flex-wrap gap-1 justify-center">
        {days.map(date => (
          <div 
            key={date} 
            title={`${date}: ${workoutMap[date] ? workoutMap[date] + 'kg' : 'Yok'}`}
            className={`w-3 h-3 rounded-sm ${getColor(date)}`}
          ></div>
        ))}
      </div>
      <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-gray-400">
        <span>Az</span>
        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
        <span>Çok</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;