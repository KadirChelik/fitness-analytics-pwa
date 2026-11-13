import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import WorkoutLogger from './pages/WorkoutLogger';
import Analytics from './pages/Analytics'; // 👈 YENİ IMPORT
import Tools from './pages/Tools';
import Measurements from './pages/Measurements'; // Import et

// Routes içine ekle:


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add-workout" element={<WorkoutLogger />} />
            <Route path="/measurements" element={<Measurements />} />
            <Route path="/analytics" element={<Analytics />} /> {/* 👈 YENİ ROTA */}
            <Route path="/tools" element={<Tools />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;