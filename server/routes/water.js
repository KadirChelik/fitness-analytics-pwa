const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WaterLog = require('../models/WaterLog');

// @route   GET api/water/today
// @desc    Bugünün su bilgisini getir (Yoksa 0 döner)
router.get('/today', auth, async (req, res) => {
  try {
    // Tarihi YYYY-MM-DD formatına çevir
    // Timezone farkını önlemek için basit split kullanıyoruz
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let log = await WaterLog.findOne({ user: req.user.id, date: todayStr });
    
    if (!log) {
      // Bugün için kayıt yoksa sanal bir obje dön
      return res.json({ date: todayStr, count: 0, target: 10 });
    }
    
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/water/update
// @desc    Su miktarını güncelle (+1 veya -1)
router.post('/update', auth, async (req, res) => {
  try {
    const { amount } = req.body; // +1 veya -1 gelir
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Upsert mantığı: Varsa bul güncelle, yoksa yarat
    let log = await WaterLog.findOne({ user: req.user.id, date: todayStr });

    if (!log) {
      log = new WaterLog({
        user: req.user.id,
        date: todayStr,
        count: amount > 0 ? amount : 0
      });
    } else {
      log.count += amount;
      if (log.count < 0) log.count = 0;
    }

    await log.save();
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/water/history
// @desc    Son 7 günün analizi (Analytics Sayfası İçin)
router.get('/history', auth, async (req, res) => {
  try {
    const logs = await WaterLog.find({ user: req.user.id })
      .sort({ date: -1 }) // En yeniden eskiye
      .limit(7);
    res.json(logs.reverse()); // Grafikte soldan sağa (eski->yeni) aksın diye ters çevir
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;