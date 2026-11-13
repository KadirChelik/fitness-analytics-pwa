const mongoose = require('mongoose');

const WorkoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  date: { type: Date, default: Date.now },
  totalVolume: { type: Number, default: 0 },
  duration: { type: Number, default: 60 },
  exercises: [{
    name: String,
    // 👇 YENİ ALAN: Egzersiz Tipi
    type: { type: String, enum: ['weighted', 'bodyweight', 'duration'], default: 'weighted' },
    sets: [{
      reps: Number,
      weight: Number, // Ağırlık veya Ek Ağırlık
      duration: Number, // Saniye cinsinden
      rpe: Number
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutSession', WorkoutSessionSchema);