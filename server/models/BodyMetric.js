const mongoose = require('mongoose');

const BodyMetricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true }, // Kilo
  bodyFat: { type: Number }, // Yağ oranı (Opsiyonel)
  note: String
}, { timestamps: true });

module.exports = mongoose.model('BodyMetric', BodyMetricSchema);