import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; // Import
import { Dumbbell } from 'lucide-react';

const Login = () => {
    const { addToast } = useToast();
  // Sayfa modu: True ise Giriş, False ise Kayıt ekranı
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Moduna göre endpoint seç: /login veya /register
    const endpoint = isLogin ? 'login' : 'register';
    const apiUrl = `/api/auth/${endpoint}`;

    try {
      const res = await axios.post(apiUrl, formData);
      
      // Gelen token'ı kaydet
      localStorage.setItem('token', res.data.token);
      
      addToast(isLogin ? 'Giriş Başarılı! Yönlendiriliyorsunuz...' : 'Kayıt Başarılı! Hoşgeldin.', 'success');
      
      // Ana sayfaya git
      navigate('/');
      
      // Sayfayı yenile ki Navbar güncellensin
      window.location.reload(); 
      
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.msg || 'İşlem başarısız', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Başlık ve İkon */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">
            {isLogin ? 'Tekrar Hoşgeldin' : 'Aramıza Katıl'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Antrenman verilerine erişmek için giriş yap.' : 'Kadir & Nur Fitness dünyasına adım at.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* İsim Alanı (Sadece Kayıt Olurken Görünür) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Örn: Kadir"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="ornek@mail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
          </button>
        </form>

        {/* Geçiş Butonu */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Hesabın yok mu?{' '}
              <button 
                onClick={() => setIsLogin(false)} 
                className="text-blue-600 font-bold hover:underline"
              >
                Hemen Kayıt Ol
              </button>
            </>
          ) : (
            <>
              Zaten hesabın var mı?{' '}
              <button 
                onClick={() => setIsLogin(true)} 
                className="text-blue-600 font-bold hover:underline"
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;