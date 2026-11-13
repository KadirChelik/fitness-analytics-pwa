import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LogOut, LayoutDashboard, PieChart, Scale, Wrench } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Giriş kontrolü: LocalStorage'da token var mı?
  const isLoggedIn = !!localStorage.getItem('token');

  // Çıkış Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token'); // Token'ı sil
    addToast('Başarıyla çıkış yapıldı 👋', 'info');
    navigate('/login'); // Giriş sayfasına at
  };

  // Aktif link stilini belirlemek için yardımcı fonksiyon
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-1 transition-colors ${
      isActive ? 'text-blue-400 font-bold' : 'hover:text-blue-300 text-gray-300'
    }`;
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition">
            <Dumbbell className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-wider hidden sm:block">
            FITNESS<span className="text-blue-500">KN</span>
          </span>
        </Link>

        {/* MENÜ LİNKLERİ (Sadece giriş yapmışsa görünür) */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
            
            <Link to="/" className={getLinkClass('/')}>
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">PANEL</span>
            </Link>

            <Link to="/analytics" className={getLinkClass('/analytics')}>
              <PieChart size={18} />
              <span className="hidden sm:inline">ANALİZ</span>
            </Link>

            <Link to="/measurements" className={getLinkClass('/measurements')}>
              <Scale size={18} />
              <span className="hidden sm:inline">VÜCUT</span>
            </Link>

            <Link to="/tools" className={getLinkClass('/tools')}>
              <Wrench size={18} />
              <span className="hidden sm:inline">ARAÇLAR</span>
            </Link>

            {/* ÇIKIŞ BUTONU */}
            <button 
              onClick={handleLogout} 
              className="bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition flex items-center space-x-1"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">ÇIKIŞ</span>
            </button>

          </div>
        ) : (
          /* GİRİŞ YAPMAMIŞSA SADECE BU GÖRÜNÜR */
          <div className="space-x-4">
            <Link to="/login" className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-900/20">
              GİRİŞ YAP
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;