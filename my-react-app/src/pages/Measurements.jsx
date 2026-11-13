import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Scale, Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext'; // Toast entegrasyonu

const Measurements = () => {
  const [metrics, setMetrics] = useState([]);
  const [form, setForm] = useState({ weight: '', bodyFat: '', date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null); // Düzenlenen kaydın ID'si
  const [loading, setLoading] = useState(false);
  
  const { addToast } = useToast(); // Bildirim sistemi

  // Verileri Çek
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/metrics', { headers: { 'x-auth-token': token } });
      
      const formatted = res.data.map(m => ({
        ...m,
        displayDate: new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        rawDate: new Date(m.date).toISOString().split('T')[0] // Input için format
      }));
      setMetrics(formatted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMetrics(); }, []);

  // Form İşlemleri (Ekleme veya Güncelleme)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight) return addToast('Lütfen kilo girin', 'error');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      if (editingId) {
        // GÜNCELLEME
        await axios.put(`/api/metrics/${editingId}`, form, config);
        addToast('Kayıt güncellendi! 👍', 'success');
      } else {
        // YENİ KAYIT
        await axios.post('/api/metrics', form, config);
        addToast('Ölçüm kaydedildi! 🔥', 'success');
      }

      // Temizlik
      setForm({ weight: '', bodyFat: '', date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      fetchMetrics(); // Listeyi yenile
    } catch (err) { 
      addToast('İşlem başarısız oldu.', 'error'); 
    }
    finally { setLoading(false); }
  };

  // Düzenleme Modunu Başlat
  const startEdit = (metric) => {
    setForm({
      weight: metric.weight,
      bodyFat: metric.bodyFat || '',
      date: metric.rawDate
    });
    setEditingId(metric._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfayı yukarı kaydır
  };

  // Düzenlemeyi İptal Et
  const cancelEdit = () => {
    setForm({ weight: '', bodyFat: '', date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  // Silme İşlemi
  const handleDelete = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğine emin misin?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/metrics/${id}`, { headers: { 'x-auth-token': token } });
      addToast('Kayıt silindi.', 'info');
      fetchMetrics();
      
      // Eğer düzenlenen kayıt silindiyse formu temizle
      if (editingId === id) cancelEdit();
    } catch (err) {
      addToast('Silinemedi.', 'error');
    }
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto space-y-8 px-4 md:px-0">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center mt-6">
        <Scale className="mr-2 text-blue-600" /> Vücut Ölçümleri
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- FORM ALANI --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">
              {editingId ? 'Kaydı Düzenle' : 'Yeni Ölçüm Gir'}
            </h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs text-red-500 hover:text-red-700 flex items-center bg-red-50 px-2 py-1 rounded">
                <X size={14} className="mr-1"/> İptal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">Tarih</label>
              <input type="date" className="w-full p-2 border rounded bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500" 
                value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Kilo (kg)</label>
              <input type="number" step="0.1" className="w-full p-2 border rounded bg-slate-50 outline-none font-bold text-lg focus:ring-1 focus:ring-blue-500" 
                value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="75.5" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Yağ Oranı (%) - Opsiyonel</label>
              <input type="number" step="0.1" className="w-full p-2 border rounded bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500" 
                value={form.bodyFat} onChange={e => setForm({...form, bodyFat: e.target.value})} placeholder="15" />
            </div>
            
            <button 
              disabled={loading} 
              className={`w-full text-white py-3 rounded-lg font-bold transition flex justify-center items-center shadow-lg ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'İşleniyor...' : (
                editingId ? <><Save size={18} className="mr-2" /> GÜNCELLE</> : <><Plus size={18} className="mr-2" /> KAYDET</>
              )}
            </button>
          </form>
        </div>

        {/* --- GRAFİK ALANI --- */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="font-bold mb-4 text-slate-700">Kilo Değişimi</h3>
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill:'#3b82f6'}} activeDot={{r: 6}} name="Kilo" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">İlk ölçümünü soldan ekle!</div>
          )}
        </div>
      </div>

      {/* --- GEÇMİŞ LİSTESİ --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <h3 className="p-6 font-bold text-slate-800 border-b border-slate-100">Ölçüm Geçmişi</h3>
        
        {metrics.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {[...metrics].reverse().map((m) => (
              <div key={m._id} className={`p-4 flex justify-between items-center transition ${editingId === m._id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                
                {/* Sol: Tarih */}
                <span className="text-gray-500 text-sm w-24">
                  {new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>

                {/* Orta: Değerler */}
                <div className="flex space-x-6 flex-1 justify-center md:justify-start">
                  <span className="font-bold text-slate-700 text-lg">{m.weight} kg</span>
                  {m.bodyFat && <span className="text-gray-400 text-sm flex items-center bg-slate-100 px-2 rounded">%{m.bodyFat} yağ</span>}
                </div>

                {/* Sağ: Aksiyonlar */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEdit(m)} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition"
                    title="Düzenle"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(m._id)} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400">Henüz kayıt yok.</div>
        )}
      </div>
    </div>
  );
};

export default Measurements;