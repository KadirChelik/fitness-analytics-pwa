const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Nur veya Kadir'in ID'si
  stats: {
    height: Number,
    weight: Number,
    bodyFat: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);