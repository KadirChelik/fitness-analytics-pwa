const mongoose = require('mongoose');

const WaterLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  count: { type: Number, default: 0 },
  target: { type: Number, default: 10 } // Günlük hedef (bardak)
});

// Aynı gün için birden fazla kayıt oluşmasını engelle (User + Date unique olmalı)
WaterLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', WaterLogSchema);