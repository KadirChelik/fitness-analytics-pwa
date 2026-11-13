import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { Activity, PieChart as PieIcon, Droplets } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [waterHistory, setWaterHistory] = useState([]); // Su verisi
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        // 1. Genel Analizler
        const res = await axios.get('/api/analytics/progress', config);
        setData(res.data);

        // 2. Su Geçmişi
        const waterRes = await axios.get('/api/water/history', config);
        setWaterHistory(waterRes.data);

        setLoading(false);
      } catch (err) {
        addToast("Veriler yüklenirken hata oluştu", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-10 font-bold text-blue-600">Analizler Yükleniyor...</div>;
  if (!data) return <div className="text-center p-10">Veri bulunamadı.</div>;

  // Pie Chart Verisi Hazırlama (Örnek mantık: Egzersiz isimlerine göre)
  // Gerçek projede bunu backend'de hesaplamak daha doğru olur ama burada basitçe yapalım.
  const muscleDistribution = [
    { name: 'Göğüs', value: 30 },
    { name: 'Sırt', value: 25 },
    { name: 'Bacak', value: 20 },
    { name: 'Omuz', value: 15 },
    { name: 'Kol', value: 10 },
  ]; 
  // Not: Gerçek veriyi AI analizinden veya egzersiz tiplerinden çekebilirsin. 
  // Şimdilik görsel doluluk için statik/örnek veri koydum.

  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-8 px-4">
      
      <h2 className="text-2xl font-bold text-slate-800 flex items-center mt-6">
        <Activity className="mr-2 text-blue-600" /> Detaylı Analiz
      </h2>

      {/* --- 1. HACİM GELİŞİMİ (LINE CHART) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-6">Toplam Hacim Gelişimi</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill:'#3b82f6'}} activeDot={{r: 6}} name="Hacim (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- 2. KAS DAĞILIMI (PIE CHART) --- */}
        {/* Not: Bu şu an statik veri gösteriyor, ileride AI verisiyle beslenebilir */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center">
             <PieIcon size={20} className="mr-2 text-purple-500"/> Bölgesel Odak (Tahmini)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={muscleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {muscleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- 3. SU TÜKETİMİ GEÇMİŞİ (BAR CHART) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center">
            <Droplets className="mr-2 text-blue-500"/> Su Tüketimi (Son 7 Gün)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('tr-TR', {day:'numeric', month:'short'})} 
                  fontSize={12} stroke="#94a3b8" 
                  tickLine={false} axisLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#eff6ff'}} 
                  contentStyle={{borderRadius:'8px', border:'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Bardak" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;