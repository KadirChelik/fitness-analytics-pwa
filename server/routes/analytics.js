const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const WorkoutSession = require('../models/WorkoutSession');

// @route   GET api/analytics/progress
// @desc    Kullanıcının bireysel gelişim verilerini getir
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Tüm antrenmanları tarihe göre (eskiden yeniye) getir
    const workouts = await WorkoutSession.find({ user: user._id }).sort({ date: 1 });

    // 1. Genel İstatistikler
    const totalVolume = workouts.reduce((acc, w) => acc + w.totalVolume, 0);
    const totalWorkouts = workouts.length;
    
    // Son antrenman tarihi
    const lastWorkoutDate = workouts.length > 0 
      ? new Date(workouts[workouts.length - 1].date).toLocaleDateString('tr-TR') 
      : "Henüz yok";

    // 2. Grafik Verisi Hazırla (Son 10 antrenman veya Son 30 gün)
    // Her antrenmanın tarihini ve hacmini grafiğe döküyoruz
    const chartData = workouts.map(w => ({
      name: new Date(w.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), // Örn: 14 Ara
      volume: w.totalVolume,
      title: w.title
    }));

   // ... önceki kodlar aynı ...

    res.json({
      stats: {
        name: user.name,
        totalVolume,
        totalWorkouts,
        lastWorkoutDate
      },
      chartData,
      workouts // 👈 BUNU EKLEMEYİ UNUTMA (Tüm ham veriyi listeleme için gönderiyoruz)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;