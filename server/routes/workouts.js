const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const BodyMetric = require('../models/BodyMetric'); 

// --- 🔬 BİLİMSEL HACİM HESAPLAMA MOTORU ---
const calculateVolume = (exercises, userWeight = 75) => {
  if (!Array.isArray(exercises)) return 0;
  
  let total = 0;
  exercises.forEach(ex => {
    if (ex.sets && Array.isArray(ex.sets)) {
      ex.sets.forEach(set => {
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight) || 0; // Ek ağırlık (+kg)
        const duration = Number(set.duration) || 0;

        // 1. AĞIRLIKLI (Weighted)
        // Formül: Set x Tekrar x Yük
        if (ex.type === 'weighted') {
           total += reps * weight;
        } 
        
        // 2. VÜCUT AĞIRLIĞI (Bodyweight)
        // Gerçekçilik Ayarı: Şınav, Squat gibi hareketlerde vücudun %100'ü değil,
        // ortalama %80'i (Biyomekanik Katsayı) aktif yük olarak kaldırılır.
        else if (ex.type === 'bodyweight') {
           const activeBodyLoad = userWeight * 0.80; // %80 Katsayısı
           total += reps * (activeBodyLoad + weight);
        }
        
        // 3. SÜRE / İZOMETRİK (Duration)
        // Plank gibi duruşlarda "Mesafe" olmadığı için fiziksel iş 0'dır.
        // Ancak metabolik stres yüksektir. 
        // Formül: Saniye x (Vücut Ağırlığının %5'i)
        // Örn: 80kg biri 60sn plank yaparsa -> 60 * 4 = 240 Puan Hacim.
        else if (ex.type === 'duration') {
           const isometricLoad = userWeight * 0.05; 
           total += duration * isometricLoad;
        }
      });
    }
  });
  return Math.round(total);
};

// @route   POST api/workouts
// @desc    Yeni antrenman kaydet
router.post('/', auth, async (req, res) => {
  try {
    const { title, duration, exercises, date } = req.body;

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ msg: 'En az bir egzersiz eklemelisiniz.' });
    }

    // 1. Kullanıcının En Son Kilosunu Çek
    const lastMetric = await BodyMetric.findOne({ user: req.user.id }).sort({ date: -1 });
    const currentWeight = lastMetric ? lastMetric.weight : 75; // Varsayılan 75kg

    // 2. Bilimsel Hacmi Hesapla
    const totalVolume = calculateVolume(exercises, currentWeight);

    // 3. Kaydet
    const newWorkout = new WorkoutSession({
      user: req.user.id,
      title: title || 'İsimsiz Antrenman',
      duration: duration || 60,
      exercises,
      totalVolume,
      date: date || Date.now()
    });

    const workout = await newWorkout.save();
    console.log(`✅ Antrenman Kaydedildi! Hacim: ${totalVolume}kg (Kullanıcı: ${currentWeight}kg)`);
    
    res.json(workout);

  } catch (err) {
    console.error("Kayıt Hatası:", err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/workouts
// @desc    Tüm geçmişi getir
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await WorkoutSession.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/workouts/:id
// @desc    Antrenmanı Sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.id);
    if (!workout) return res.status(404).json({ msg: 'Antrenman bulunamadı' });

    if (workout.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Yetkisiz işlem' });
    }

    await workout.deleteOne();
    res.json({ msg: 'Antrenman silindi' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/workouts/:id
// @desc    Antrenmanı Güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, exercises, date } = req.body;
    let workout = await WorkoutSession.findById(req.params.id);

    if (!workout) return res.status(404).json({ msg: 'Antrenman bulunamadı' });
    if (workout.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Yetkisiz işlem' });

    // Güncellemede de güncel kiloyu baz al
    const lastMetric = await BodyMetric.findOne({ user: req.user.id }).sort({ date: -1 });
    const currentWeight = lastMetric ? lastMetric.weight : 75;

    workout.title = title;
    workout.exercises = exercises;
    workout.date = date;
    workout.totalVolume = calculateVolume(exercises, currentWeight);

    await workout.save();
    res.json(workout);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;