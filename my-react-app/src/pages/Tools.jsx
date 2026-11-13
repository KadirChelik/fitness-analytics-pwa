import React, { useState } from 'react';
import { Disc, Utensils, Trophy, Activity } from 'lucide-react';

const Tools = () => {
  const [activeTab, setActiveTab] = useState('plate'); // 'plate', 'macro', 'wilks'

  // ==========================================
  // 1. PLAKA HESAPLAYICI (STANDART)
  // ==========================================
  const [targetWeight, setTargetWeight] = useState('');
  const [barWeight, setBarWeight] = useState(20);
  const [plates, setPlates] = useState([]);
  const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

  const calculatePlates = () => {
    let weight = parseFloat(targetWeight);
    if (!weight || weight < barWeight) { setPlates([]); return; }
    let remaining = (weight - barWeight) / 2;
    let result = [];
    AVAILABLE_PLATES.forEach(plate => {
      while (remaining >= plate) { result.push(plate); remaining -= plate; }
    });
    setPlates(result);
  };
  
  const getPlateColor = (kg) => {
    switch(kg) {
      case 25: return 'bg-red-600 border-red-700';
      case 20: return 'bg-blue-600 border-blue-700';
      case 15: return 'bg-yellow-500 border-yellow-600';
      case 10: return 'bg-green-600 border-green-700';
      case 5:  return 'bg-white border-gray-400 text-gray-800';
      default: return 'bg-gray-800 border-gray-900';
    }
  };
  const getHeight = (kg) => { if (kg >= 20) return 'h-32'; if (kg >= 15) return 'h-28'; if (kg >= 10) return 'h-24'; if (kg >= 5) return 'h-20'; return 'h-16'; };


  // ==========================================
  // 2. BİLİMSEL MAKRO & KALORİ HESAPLAYICI
  // Formül: Mifflin-St Jeor (En doğru kabul edilen)
  // ==========================================
  const [macroForm, setMacroForm] = useState({ 
    gender: 'male', weight: '', height: '', age: '', activity: '1.55', goal: 'maintain' 
  });
  const [macroResult, setMacroResult] = useState(null);

  const calculateMacros = () => {
    const { gender, weight, height, age, activity, goal } = macroForm;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if(!w || !h || !a) return;

    // 1. BMR Hesapla (Mifflin-St Jeor)
    // Erkek: (10 x kg) + (6.25 x cm) - (5 x yaş) + 5
    // Kadın: (10 x kg) + (6.25 x cm) - (5 x yaş) - 161
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'male' ? 5 : -161;

    // 2. TDEE (Günlük Enerji Harcaması)
    let tdee = bmr * parseFloat(activity);

    // 3. Hedefe Göre Kalori Ayarı
    let targetCalories = tdee;
    if (goal === 'cut') targetCalories -= 500; // Definasyon: -500 kcal (Sağlıklı)
    if (goal === 'bulk') targetCalories += 300; // Bulk: +300 kcal (Clean Bulk)

    // 4. Makro Dağılımı (Bilimsel Sporcu Standartları)
    // Protein: Kilo başına 2g (Kas onarımı için altın standart)
    // Yağ: Kilo başına 0.9g (Hormonal denge için minimum)
    // Karbonhidrat: Kalan kaloriler
    
    const proteinGrams = w * 2.0; 
    const fatGrams = w * 0.9;
    
    const proteinCals = proteinGrams * 4;
    const fatCals = fatGrams * 9;
    
    // Kalan kalori karbonhidrata gider
    let carbCals = targetCalories - (proteinCals + fatCals);
    // Karb negatif çıkarsa (imkansız ama) sıfırla
    if(carbCals < 0) carbCals = 0;
    
    const carbGrams = carbCals / 4;

    setMacroResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      fats: Math.round(fatGrams),
      carbs: Math.round(carbGrams)
    });
  };


  // ==========================================
  // 3. WILKS SCORE (POWERLIFTING STANDARDI)
  // Formül: 5th Degree Polynomial (Orijinal Katsayılar)
  // ==========================================
  const [wilksForm, setWilksForm] = useState({ gender: 'male', bodyWeight: '', liftedWeight: '' });
  const [wilksScore, setWilksScore] = useState(null);

  const calculateWilks = () => {
    const { gender, bodyWeight, liftedWeight } = wilksForm;
    const x = parseFloat(bodyWeight); // Vücut Ağırlığı
    const lifted = parseFloat(liftedWeight); // Kaldırılan (Total)

    if(!x || !lifted) return;

    // Orijinal Wilks Katsayıları (Erkek / Kadın)
    let a, b, c, d, e, f;

    if (gender === 'male') {
      a = -216.0475144;
      b = 16.2606339;
      c = -0.002388645;
      d = -0.00113732;
      e = 7.01863E-06;
      f = -1.291E-08;
    } else {
      a = 594.317477755;
      b = -27.23842536447;
      c = 0.82112226871;
      d = -0.00930733913;
      e = 4.731582E-05;
      f = -9.054E-08;
    }

    const denominator = a + (b * x) + (c * Math.pow(x, 2)) + (d * Math.pow(x, 3)) + (e * Math.pow(x, 4)) + (f * Math.pow(x, 5));
    const coeff = 500 / denominator;
    const score = coeff * lifted;

    setWilksScore(score.toFixed(2));
  };


  return (
    <div className="pb-24 max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-6 pt-6">
        <Activity className="mr-2 text-blue-600" /> Hesaplama Araçları
      </h2>

      {/* --- TAB BUTONLARI --- */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
        <button onClick={() => setActiveTab('plate')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center transition ${activeTab === 'plate' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
          <Disc size={16} className="mr-2"/> Plaka
        </button>
        <button onClick={() => setActiveTab('macro')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center transition ${activeTab === 'macro' ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
          <Utensils size={16} className="mr-2"/> Makro
        </button>
        <button onClick={() => setActiveTab('wilks')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center transition ${activeTab === 'wilks' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
          <Trophy size={16} className="mr-2"/> Wilks
        </button>
      </div>

      {/* ---------------- 1. PLAKA HESAPLAYICI ---------------- */}
      {activeTab === 'plate' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-500">Hedef Kilo (kg)</label>
              <input type="number" value={targetWeight} onChange={(e) => { setTargetWeight(e.target.value); setTimeout(calculatePlates, 100); }} onKeyUp={calculatePlates} placeholder="Örn: 100" className="w-full text-2xl font-bold p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Bar Ağırlığı</label>
              <select value={barWeight} onChange={(e) => { setBarWeight(Number(e.target.value)); calculatePlates(); }} className="w-full text-xl font-bold p-3 border rounded-lg bg-slate-50 outline-none">
                <option value={20}>20 kg (Olimpik)</option>
                <option value={15}>15 kg (Kısa)</option>
                <option value={10}>10 kg (Z Bar)</option>
              </select>
            </div>
          </div>
          <button onClick={calculatePlates} className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg mb-8 hover:bg-slate-900 transition">HESAPLA</button>
          
          <div className="relative h-48 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
            <div className="absolute w-full h-4 bg-gray-400 z-0"></div>
            <div className="flex items-center space-x-1 z-10 mr-10 opacity-50"><div className="w-4 h-36 bg-gray-300 rounded"></div></div>
            <div className="w-20"></div>
            <div className="flex items-center flex-row-reverse z-10">
              <div className="w-6 h-10 bg-gray-300 border-l border-gray-400"></div>
              {plates.length > 0 ? plates.map((kg, index) => (
                <div key={index} className={`w-8 ${getHeight(kg)} ${getPlateColor(kg)} border-2 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-lg mx-[1px]`}>
                  <span className="-rotate-90">{kg}</span>
                </div>
              )) : <span className="absolute top-2 text-xs text-gray-400 font-bold">Plaka Yok</span>}
            </div>
          </div>

          {plates.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <h4 className="font-bold text-blue-800 mb-2">Tek Tarafa Takılacaklar:</h4>
              <div className="flex justify-center flex-wrap gap-2">
                {plates.map((kg, i) => <span key={i} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm font-bold text-blue-600 shadow-sm">{kg} kg</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 2. MAKRO & KALORİ HESAPLAYICI (Mifflin-St Jeor) ---------------- */}
      {activeTab === 'macro' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 mb-4">
             {/* Cinsiyet */}
             <div className="col-span-2 flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setMacroForm({...macroForm, gender: 'male'})} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${macroForm.gender === 'male' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Erkek</button>
                <button onClick={() => setMacroForm({...macroForm, gender: 'female'})} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${macroForm.gender === 'female' ? 'bg-white shadow text-pink-500' : 'text-gray-500'}`}>Kadın</button>
             </div>
             
             <div>
               <label className="text-xs font-bold text-gray-500">Kilo (kg)</label>
               <input type="number" className="w-full p-2 border rounded bg-slate-50 font-bold outline-none focus:ring-1 focus:ring-green-500" placeholder="75" value={macroForm.weight} onChange={e => setMacroForm({...macroForm, weight: e.target.value})}/>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500">Boy (cm)</label>
               <input type="number" className="w-full p-2 border rounded bg-slate-50 font-bold outline-none focus:ring-1 focus:ring-green-500" placeholder="180" value={macroForm.height} onChange={e => setMacroForm({...macroForm, height: e.target.value})}/>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500">Yaş</label>
               <input type="number" className="w-full p-2 border rounded bg-slate-50 font-bold outline-none focus:ring-1 focus:ring-green-500" placeholder="25" value={macroForm.age} onChange={e => setMacroForm({...macroForm, age: e.target.value})}/>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500">Hedef</label>
               <select className="w-full p-2 border rounded bg-slate-50 font-bold outline-none text-sm" value={macroForm.goal} onChange={e => setMacroForm({...macroForm, goal: e.target.value})}>
                 <option value="cut">Definasyon (-500 kcal)</option>
                 <option value="maintain">Kilo Koru</option>
                 <option value="bulk">Bulk (+300 kcal)</option>
               </select>
             </div>
             <div className="col-span-2">
               <label className="text-xs font-bold text-gray-500">Aktivite Seviyesi</label>
               <select className="w-full p-2 border rounded bg-slate-50 font-bold outline-none text-sm" value={macroForm.activity} onChange={e => setMacroForm({...macroForm, activity: e.target.value})}>
                 <option value="1.2">Masa Başı (Spor Yok)</option>
                 <option value="1.375">Hafif (Haftada 1-3 gün)</option>
                 <option value="1.55">Orta (Haftada 3-5 gün)</option>
                 <option value="1.725">Aktif (Haftada 6-7 gün)</option>
                 <option value="1.9">Atlet (Günde 2 antrenman)</option>
               </select>
             </div>
          </div>
          
          <button onClick={calculateMacros} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition mb-6 shadow-lg shadow-green-200">HESAPLA</button>

          {macroResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                 <div>
                    <p className="text-gray-400 text-xs font-bold uppercase">Bazal Metabolizma</p>
                    <p className="text-slate-700 font-bold">{macroResult.bmr} kcal</p>
                 </div>
                 <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase">Günlük Harcama (TDEE)</p>
                    <p className="text-slate-700 font-bold">{macroResult.tdee} kcal</p>
                 </div>
              </div>

              <div className="text-center mb-6">
                 <p className="text-green-600 text-xs font-bold uppercase tracking-widest">GÜNLÜK HEDEF</p>
                 <h3 className="text-4xl font-black text-slate-800">{macroResult.calories} <span className="text-lg font-medium text-gray-500">kcal</span></h3>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                 <div className="bg-blue-100 p-3 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-black text-xl">{macroResult.protein}g</p>
                    <p className="text-blue-600 text-xs font-bold uppercase">Protein</p>
                    <p className="text-blue-400 text-[10px] mt-1">Kas Onarımı</p>
                 </div>
                 <div className="bg-yellow-100 p-3 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 font-black text-xl">{macroResult.carbs}g</p>
                    <p className="text-yellow-600 text-xs font-bold uppercase">Karb</p>
                    <p className="text-yellow-500 text-[10px] mt-1">Enerji</p>
                 </div>
                 <div className="bg-red-100 p-3 rounded-xl border border-red-200">
                    <p className="text-red-800 font-black text-xl">{macroResult.fats}g</p>
                    <p className="text-red-600 text-xs font-bold uppercase">Yağ</p>
                    <p className="text-red-400 text-[10px] mt-1">Hormonlar</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. WILKS SCORE (Bilimsel Katsayılar) ---------------- */}
      {activeTab === 'wilks' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
          <p className="text-sm text-gray-500 mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100 leading-relaxed">
             <span className="font-bold text-purple-700">Wilks Puanı Nedir?</span><br/>
             Vücut ağırlığı farklı olan iki sporcunun güç seviyesini adil bir şekilde karşılaştırmak için kullanılan uluslararası formüldür.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="col-span-2 flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setWilksForm({...wilksForm, gender: 'male'})} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${wilksForm.gender === 'male' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Erkek</button>
                <button onClick={() => setWilksForm({...wilksForm, gender: 'female'})} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${wilksForm.gender === 'female' ? 'bg-white shadow text-pink-500' : 'text-gray-500'}`}>Kadın</button>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500">Vücut Ağırlığı (kg)</label>
               <input type="number" className="w-full p-3 border rounded-lg bg-slate-50 font-bold outline-none focus:ring-1 focus:ring-purple-500" placeholder="80" value={wilksForm.bodyWeight} onChange={e => setWilksForm({...wilksForm, bodyWeight: e.target.value})}/>
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500">Total (Squat+Bench+Deadlift)</label>
               <input type="number" className="w-full p-3 border rounded-lg bg-slate-50 font-bold outline-none focus:ring-1 focus:ring-purple-500" placeholder="Örn: 400" value={wilksForm.liftedWeight} onChange={e => setWilksForm({...wilksForm, liftedWeight: e.target.value})}/>
             </div>
          </div>

          <button onClick={calculateWilks} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition mb-6 shadow-lg shadow-purple-200">SKORU HESAPLA</button>

          {wilksScore && (
             <div className="text-center p-8 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-purple-300 font-bold text-xs uppercase tracking-[0.2em] mb-2">Resmi Wilks Skoru</p>
                  <h3 className="text-6xl font-black text-white mb-4 tracking-tighter">{wilksScore}</h3>
                  
                  <div className="inline-flex bg-white/10 rounded-full p-1 gap-2 text-xs">
                     <span className={`px-3 py-1 rounded-full ${wilksScore < 300 ? 'bg-white text-black font-bold' : 'text-gray-400'}`}>Acemi</span>
                     <span className={`px-3 py-1 rounded-full ${wilksScore >= 300 && wilksScore < 400 ? 'bg-white text-black font-bold' : 'text-gray-400'}`}>Orta</span>
                     <span className={`px-3 py-1 rounded-full ${wilksScore >= 400 ? 'bg-white text-black font-bold' : 'text-gray-400'}`}>Elit</span>
                  </div>
                </div>
                {/* Arkaplan Efekti */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full blur-[60px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-40"></div>
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Tools;