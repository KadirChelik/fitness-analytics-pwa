const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BodyMetric = require('../models/BodyMetric');

// @route   POST api/metrics
// @desc    Yeni Ölçüm Ekle
router.post('/', auth, async (req, res) => {
  try {
    const { weight, bodyFat, date, note } = req.body;
    const newMetric = new BodyMetric({
      user: req.user.id,
      weight,
      bodyFat,
      date: date || Date.now(),
      note
    });
    const saved = await newMetric.save();
    res.json(saved);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/metrics
// @desc    Geçmiş Ölçümleri Getir
router.get('/', auth, async (req, res) => {
  try {
    const metrics = await BodyMetric.find({ user: req.user.id }).sort({ date: 1 });
    res.json(metrics);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/metrics/:id
// @desc    Ölçüm Sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const metric = await BodyMetric.findById(req.params.id);
    if (!metric) return res.status(404).json({ msg: 'Kayıt bulunamadı' });

    // Kullanıcı kontrolü
    if (metric.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Yetkisiz işlem' });
    }

    await metric.deleteOne();
    res.json({ msg: 'Kayıt silindi' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/metrics/:id
// @desc    Ölçüm Güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { weight, bodyFat, date, note } = req.body;
    let metric = await BodyMetric.findById(req.params.id);

    if (!metric) return res.status(404).json({ msg: 'Kayıt bulunamadı' });
    if (metric.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Yetkisiz işlem' });

    metric.weight = weight;
    metric.bodyFat = bodyFat;
    metric.date = date;
    metric.note = note;

    await metric.save();
    res.json(metric);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;