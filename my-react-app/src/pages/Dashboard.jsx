import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Activity, Calendar, Zap, Flame, Clock, Award, 
  ChevronRight, BarChart3, Dumbbell, Edit2, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Bileşenler
import ComparisonChart from '../components/ComparisonChart';
import ActivityHeatmap from '../components/ActivityHeatmap';
import BodyModel from '../components/BodyModel';
import WaterTracker from '../components/WaterTracker';

// --- ANİMASYON AYARLARI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

// --- YARDIMCI FONKSİYONLAR ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Erkencisin";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "Tünaydın";
  return "İyi Akşamlar";
};

const getRandomQuote = () => {
  const quotes = [
    "Ter, yağların ağlamasıdır.",
    "Bugün hissettiğin acı, yarın hissedeceğin güçtür.",
    "Bahane üretme, kas üret.",
    "En zor adım, spor salonunun kapısından içeri girmektir.",
    "Hafif siklet bebek! (Ronnie Coleman)",
    "Yavaş ilerlemek, hiç ilerlememekten iyidir.",
    "Dileme, çalış.",
    "Disiplin, istediğin şey ile şu anki isteklerin arasında seçim yapmaktır."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [aiMuscleData, setAiMuscleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(getRandomQuote());
  const navigate = useNavigate();

  // --- HESAPLAMALAR ---
  const streak = useMemo(() => {
    if (!data?.workouts) return 0;
    let currentStreak = 0;
    const sortedDates = [...new Set(data.workouts.map(w => new Date(w.date).toISOString().split('T')[0]))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) currentStreak++;
      else {
        const diff = (new Date(sortedDates[i-1]) - new Date(sortedDates[i])) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }
    return currentStreak;
  }, [data]);

  const totalCalories = useMemo(() => {
    if (!data?.workouts) return 0;
    let totalMinutes = 0;
    data.workouts.forEach(w => {
        if(w.duration > 0) totalMinutes += (w.duration / 60); 
        else totalMinutes += (w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) * 2);
    });
    return Math.round(totalMinutes * 5);
  }, [data]);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const config = { headers: { 'x-auth-token': token } };
        
        // 1. İstatistikler
        const res = await axios.get('/api/analytics/progress', config);
        setData(res.data);

        // 2. AI Vücut Analizi (Cache yok, anlık)
        axios.get('/api/ai/analyze-body', config)
          .then(aiRes => setAiMuscleData(aiRes.data))
          .catch(err => console.log("Analiz hatası:", err));

        setLoading(false);
      } catch (err) {
        if(err.response?.status === 401) navigate('/login');
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (id) => {
    if(window.confirm('Silmek istediğine emin misin?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/workouts/${id}`, { headers: { 'x-auth-token': token } });
        window.location.reload();
      } catch(err) { alert('Hata'); }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-blue-600">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"
        />
        <p className="font-bold text-lg tracking-widest animate-pulse">YÜKLENİYOR...</p>
    </div>
  );
  
  if (!data) return <div className="text-center p-10">Veri bulunamadı.</div>;

  return (
    <motion.div 
      className="space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* --- 1. HERO SECTION --- */}
      <motion.div variants={itemVariants} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-slate-900 rounded-[1.7rem] p-8 text-white shadow-2xl overflow-hidden border border-slate-800">
          
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"
          />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <motion.div className="flex items-center space-x-2 text-blue-300 text-sm font-bold uppercase tracking-wider mb-2">
                  <Calendar size={14} />
                  <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
               </motion.div>
               <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
                 {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{data.stats.name}</span>
               </h1>
               <p className="text-slate-400 italic font-light text-lg border-l-4 border-blue-500 pl-4 py-1">"{quote}"</p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/add-workout')} 
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 flex items-center hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <Zap className="mr-2 text-blue-600 fill-blue-600" size={20}/> 
              Antrenman Başlat
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* --- 2. HIZLI İSTATİSTİKLER --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Toplam Yük", val: (data.stats.totalVolume / 1000).toFixed(1) + "k", icon: <Activity size={24}/>, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Antrenman", val: data.stats.totalWorkouts, icon: <BarChart3 size={24}/>, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Yakılan (Est)", val: totalCalories + " kcal", icon: <Flame size={24}/>, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Günlük Seri", val: streak + " Gün", icon: <Award size={24}/>, color: "text-red-600", bg: "bg-red-50", extra: streak > 0 ? "🔥 On Fire" : null }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-3">
               <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>{stat.icon}</div>
               {stat.extra && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">{stat.extra}</span>}
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.val}</h3>
          </motion.div>
        ))}
      </div>
      
      {/* --- 3. ANA ANALİZ ALANI (Sol: Grafikler, Orta: Vücut, Sağ: Su) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Sol: Gelişim Grafiği (Geniş) - 7 birim */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
             <ComparisonChart data={data.chartData} />
          </div>
          <ActivityHeatmap workouts={data.workouts || []} />
        </motion.div>

        {/* Orta: Vücut Analizi - 3 birim */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          {aiMuscleData ? (
            <div className="h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-500">
               <BodyModel muscleData={aiMuscleData} />
            </div>
          ) : (
             <div className="bg-white p-6 rounded-3xl h-full flex flex-col items-center justify-center text-gray-400 border border-slate-100 shadow-sm">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-300 mb-4"></div>
               <p className="font-medium text-sm">Analiz...</p>
             </div>
          )}
        </motion.div>

        {/* Sağ: Su Takibi - 2 birim */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
           <WaterTracker />
        </motion.div>

      </div>

      {/* --- 4. SON AKTİVİTELER --- */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
           <h3 className="font-bold text-lg text-slate-800 flex items-center">
             <Clock className="mr-2 text-blue-500" size={20}/> Son Aktiviteler
           </h3>
           <button onClick={() => navigate('/add-workout')} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">TÜMÜNÜ GÖR</button>
        </div>
        
        {data.workouts && data.workouts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {[...data.workouts].reverse().slice(0, 5).map((w, index) => (
              <motion.div 
                key={w._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 hover:bg-blue-50/30 transition group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-2xl ${w.exercises.some(e => e.type === 'duration') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {w.exercises.some(e => e.type === 'duration') ? <Clock size={20}/> : <Dumbbell size={20}/>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{w.title || 'Antrenman'}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center font-medium">
                      <Calendar size={12} className="mr-1"/> {new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      <span className="mx-2 text-slate-300">|</span>
                      {w.totalVolume > 0 ? `${(w.totalVolume).toLocaleString()} kg` : 'Vücut/Süre'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap gap-2 justify-start sm:justify-center">
                   {w.exercises.slice(0, 3).map((ex, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        {ex.name}
                      </span>
                   ))}
                   {w.exercises.length > 3 && <span className="text-[10px] font-bold text-slate-400 px-2 py-1">+{w.exercises.length - 3}</span>}
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={(e) => {e.stopPropagation(); navigate('/add-workout', { state: { workoutToEdit: w } })}} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition"><Edit2 size={18} /></button>
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(w._id)}} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition"><Trash2 size={18} /></button>
                  <ChevronRight className="text-slate-300" size={20}/>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">Henüz bir aktivite yok.</p>
            <button onClick={() => navigate('/add-workout')} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition mt-4">KAYIT EKLE</button>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;