import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; // Dosya isminin büyük/küçük harfine dikkat et!
import { Plus, Save, Trash2, ArrowLeft, X, Clock, Dumbbell, User, Search } from 'lucide-react';

// --- AKILLI HAREKET VERİTABANI ---
const EXERCISE_DB = [
  // GÖĞÜS & İTİŞ
  { name: "Barbell Bench Press", type: "weighted" },
  { name: "Incline Bench Press", type: "weighted" },
  { name: "Dumbbell Press", type: "weighted" },
  { name: "Push-ups (Şınav)", type: "bodyweight" },
  { name: "Chest Fly", type: "weighted" },
  { name: "Dips", type: "bodyweight" },

  // SIRT & ÇEKİŞ
  { name: "Pull-ups (Barfiks)", type: "bodyweight" },
  { name: "Chin-ups", type: "bodyweight" },
  { name: "Lat Pulldown", type: "weighted" },
  { name: "Barbell Row", type: "weighted" },
  { name: "Dumbbell Row", type: "weighted" },
  { name: "Deadlift", type: "weighted" },
  { name: "Face Pull", type: "weighted" },

  // BACAK
  { name: "Squat (Barbell)", type: "weighted" },
  { name: "Squat (Bodyweight)", type: "bodyweight" },
  { name: "Leg Press", type: "weighted" },
  { name: "Lunge", type: "weighted" },
  { name: "Bulgarian Split Squat", type: "weighted" },
  { name: "Leg Extension", type: "weighted" },
  { name: "Leg Curl", type: "weighted" },
  { name: "Calf Raise", type: "weighted" },

  // OMUZ
  { name: "Overhead Press", type: "weighted" },
  { name: "Military Press", type: "weighted" },
  { name: "Lateral Raise", type: "weighted" },
  { name: "Front Raise", type: "weighted" },
  { name: "Arnold Press", type: "weighted" },

  // KOL
  { name: "Barbell Curl", type: "weighted" },
  { name: "Dumbbell Curl", type: "weighted" },
  { name: "Hammer Curl", type: "weighted" },
  { name: "Preacher Curl", type: "weighted" },
  { name: "Triceps Pushdown", type: "weighted" },
  { name: "Skull Crusher", type: "weighted" },
  { name: "Triceps Extension", type: "weighted" },
  
  // KARIN & KARDİYO
  { name: "Plank", type: "duration" },
  { name: "Crunch", type: "bodyweight" },
  { name: "Mekik (Sit-ups)", type: "bodyweight" },
  { name: "Leg Raise", type: "bodyweight" },
  { name: "Russian Twist", type: "bodyweight" },
  { name: "Mountain Climber", type: "duration" },
  { name: "Running (Koşu)", type: "duration" },
  { name: "Cycling (Bisiklet)", type: "duration" },
  { name: "Jump Rope (İp Atlama)", type: "duration" },
  { name: "Burpees", type: "bodyweight" }
];

const WorkoutLogger = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const editMode = location.state?.workoutToEdit;
  
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  const [workout, setWorkout] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [{ 
      name: '', 
      type: 'weighted', 
      sets: [{ weight: '', reps: '', duration: '' }] 
    }]
  });

  // Dışarı tıklama kontrolü (Öneri listesini kapatmak için)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setActiveSuggestionIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Düzenleme Modu (Edit Mode) Verilerini Yükle
  useEffect(() => {
    if (editMode) {
      const w = editMode;
      const formattedDate = new Date(w.date).toISOString().split('T')[0];
      const formattedExercises = w.exercises.map(ex => ({
        name: ex.name,
        type: ex.type || 'weighted',
        sets: ex.sets.map(s => ({
          weight: s.weight || '',
          reps: s.reps || '',
          duration: s.duration || ''
        }))
      }));
      setWorkout({ title: w.title, date: formattedDate, exercises: formattedExercises });
    }
  }, [editMode]);

  // --- İŞLEVLER ---

  const handleNameChange = (index, value) => {
    const newEx = [...workout.exercises];
    newEx[index].name = value;
    setWorkout({ ...workout, exercises: newEx });

    // Filtreleme
    if (value.length > 1) {
      const filtered = EXERCISE_DB.filter(ex => 
        ex.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setActiveSuggestionIndex(index);
    } else {
      setActiveSuggestionIndex(null);
    }
  };

  const selectSuggestion = (index, suggestionObj) => {
    const newEx = [...workout.exercises];
    newEx[index].name = suggestionObj.name;
    
    // Otomatik Tip Seçimi ve Set Sıfırlama
    newEx[index].type = suggestionObj.type;
    newEx[index].sets = [{ weight: '', reps: '', duration: '' }];

    setWorkout({ ...workout, exercises: newEx });
    setActiveSuggestionIndex(null);
  };

  const updateExerciseField = (index, field, val) => {
    const newEx = [...workout.exercises];
    newEx[index][field] = val;
    // Tip değişirse (Weighted -> Duration vb.) inputları temizle
    if (field === 'type') {
       newEx[index].sets = [{ weight: '', reps: '', duration: '' }];
    }
    setWorkout({ ...workout, exercises: newEx });
  };

  const addExercise = () => {
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, { name: '', type: 'weighted', sets: [{ weight: '', reps: '', duration: '' }] }]
    });
  };

  const removeExercise = (index) => {
    const newEx = workout.exercises.filter((_, i) => i !== index);
    setWorkout({ ...workout, exercises: newEx });
  };

  const addSet = (exIndex) => {
    const newEx = [...workout.exercises];
    newEx[exIndex].sets.push({ weight: '', reps: '', duration: '' });
    setWorkout({ ...workout, exercises: newEx });
  };

  const removeSet = (exIndex, setIndex) => {
    const newEx = [...workout.exercises];
    newEx[exIndex].sets = newEx[exIndex].sets.filter((_, i) => i !== setIndex);
    setWorkout({ ...workout, exercises: newEx });
  };

  const updateSet = (exIndex, setIndex, field, val) => {
    const newEx = [...workout.exercises];
    newEx[exIndex].sets[setIndex][field] = val;
    setWorkout({ ...workout, exercises: newEx });
  };

  // --- KAYDETME FONKSİYONU (DÜZELTİLMİŞ) ---
  const handleSubmit = async () => {
    if (!workout.title) return addToast("Lütfen antrenman adı girin.", "error");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      // VERİYİ TEMİZLEME (String -> Number Dönüşümü)
      // Bu adım sunucunun veriyi kabul etmesi için KRİTİKTİR.
      const sanitizedWorkout = {
        ...workout,
        exercises: workout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            duration: Number(s.duration) || 0
          }))
        }))
      };

      if (editMode) {
        await axios.put(`/api/workouts/${editMode._id}`, sanitizedWorkout, config);
        addToast('Antrenman Başarıyla Güncellendi! 👍', 'success');
      } else {
        await axios.post('/api/workouts', sanitizedWorkout, config);
        addToast('Antrenman Kaydedildi! 🔥', 'success');
      }
      navigate('/');
    } catch (err) {
      console.error("Kayıt Hatası:", err);
      addToast('Bir hata oluştu, kaydedilemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-24 px-4">
      {/* Üst Bar */}
      <div className="flex items-center justify-between mb-6 pt-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {editMode ? 'Düzenle' : 'Antrenman Gir'}
        </h2>
        <div className="w-6"></div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 space-y-3">
        <input 
          type="text" 
          placeholder="Başlık (Örn: Full Body)" 
          className="w-full text-lg font-bold outline-none placeholder:text-gray-300"
          value={workout.title}
          onChange={(e) => setWorkout({...workout, title: e.target.value})}
        />
        <input 
          type="date" 
          className="w-full text-sm text-gray-500 outline-none"
          value={workout.date}
          onChange={(e) => setWorkout({...workout, date: e.target.value})}
        />
      </div>

      <div className="space-y-4">
        {workout.exercises.map((ex, exIndex) => (
          <div key={exIndex} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative animate-fadeIn">
            
            {/* Üst Kısımdaki Hızlı Silme İkonu */}
            <button 
              onClick={() => removeExercise(exIndex)} 
              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1"
              title="Hareketi Sil"
            >
              <X size={20} />
            </button>

            <div className="space-y-3 mb-4 relative pr-8">
              {/* --- AUTOCOMPLETE INPUT --- */}
              <div className="relative">
                <input 
                  placeholder="Hareket Ara (Örn: Plank)" 
                  className="font-bold text-slate-700 w-full outline-none pr-8 text-lg border-b border-transparent focus:border-blue-200 transition-colors pb-1"
                  value={ex.name}
                  onChange={(e) => handleNameChange(exIndex, e.target.value)}
                  onFocus={() => { if(ex.name.length > 1) handleNameChange(exIndex, ex.name); }}
                />
                <Search className="absolute right-0 top-1 text-gray-300" size={18} />
                
                {/* Öneri Listesi */}
                {activeSuggestionIndex === exIndex && filteredSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestionObj, i) => (
                      <div 
                        key={i} 
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 font-medium border-b border-slate-50 last:border-none flex justify-between items-center"
                        onClick={() => selectSuggestion(exIndex, suggestionObj)}
                      >
                        <span>{suggestionObj.name}</span>
                        <span className="text-xs text-gray-400 bg-slate-100 px-2 py-0.5 rounded">
                           {suggestionObj.type === 'duration' ? 'Süre' : suggestionObj.type === 'bodyweight' ? 'Vücut' : 'Ağırlık'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tip Seçiciler */}
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => updateExerciseField(exIndex, 'type', 'weighted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border transition ${ex.type === 'weighted' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-gray-500 border-slate-200'}`}
                >
                  <Dumbbell size={14} className="mr-1" /> Ağırlık
                </button>
                <button 
                  onClick={() => updateExerciseField(exIndex, 'type', 'bodyweight')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border transition ${ex.type === 'bodyweight' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-50 text-gray-500 border-slate-200'}`}
                >
                  <User size={14} className="mr-1" /> Vücut
                </button>
                <button 
                  onClick={() => updateExerciseField(exIndex, 'type', 'duration')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border transition ${ex.type === 'duration' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-gray-500 border-slate-200'}`}
                >
                  <Clock size={14} className="mr-1" /> Süre
                </button>
              </div>
            </div>

            {/* Setler */}
            <div className="space-y-2">
              {ex.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center space-x-2 animate-fadeIn">
                  <span className="text-xs text-gray-400 w-4 font-bold">{setIndex + 1}</span>
                  
                  {ex.type === 'weighted' && (
                    <>
                      <input type="number" placeholder="kg" className="bg-slate-50 w-20 p-2 rounded text-center text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500"
                        value={set.weight} onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} />
                      <span className="text-gray-300 text-xs">x</span>
                      <input type="number" placeholder="tekrar" className="bg-slate-50 w-20 p-2 rounded text-center text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500"
                        value={set.reps} onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} />
                    </>
                  )}

                  {ex.type === 'bodyweight' && (
                    <>
                      <div className="bg-green-50 text-green-600 px-2 py-2 rounded text-xs font-bold flex-1 text-center select-none">Vücut</div>
                      <span className="text-gray-300 text-xs">x</span>
                      <input type="number" placeholder="tekrar" className="bg-slate-50 w-20 p-2 rounded text-center text-sm font-bold outline-none focus:ring-1 focus:ring-green-500"
                        value={set.reps} onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} />
                      <input type="number" placeholder="+kg" className="bg-slate-50 w-14 p-2 rounded text-center text-xs text-gray-400 outline-none"
                        value={set.weight} onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} title="Ek Ağırlık" />
                    </>
                  )}

                  {ex.type === 'duration' && (
                    <>
                      <input type="number" placeholder="saniye" className="bg-slate-50 w-full p-2 rounded text-center text-sm font-bold outline-none focus:ring-1 focus:ring-orange-500"
                        value={set.duration} onChange={(e) => updateSet(exIndex, setIndex, 'duration', e.target.value)} />
                      <span className="text-gray-400 text-xs font-bold">SN</span>
                    </>
                  )}

                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(exIndex, setIndex)} className="text-gray-300 hover:text-red-400 ml-auto">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ALT BUTONLAR */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
              <button onClick={() => addSet(exIndex)} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-2 rounded-lg transition">
                <Plus size={14} className="mr-1"/> SET EKLE
              </button>

              <button 
                onClick={() => removeExercise(exIndex)} 
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <Trash2 size={14} className="mr-1"/> HAREKETİ SİL
              </button>
            </div>

          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <button onClick={addExercise} className="w-full py-3 border border-dashed border-gray-300 text-gray-500 rounded-xl font-medium hover:border-blue-400 hover:text-blue-500 transition text-sm">
          + BAŞKA HAREKET EKLE
        </button>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center hover:bg-black transition"
        >
          {loading ? 'İşleniyor...' : <><Save className="mr-2" size={20} /> {editMode ? 'GÜNCELLE' : 'KAYDET'}</>}
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;