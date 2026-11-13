const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Config
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/water', require('./routes/water'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/ai', require('./routes/ai'));
// app.use('/api/workouts', require('./routes/workouts')); // Eklenebilir

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor...`));