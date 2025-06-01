import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config'; 
import { RxExit } from 'react-icons/rx';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/login');
      return;
    }
    if (savedUsername) setUsername(savedUsername);
    fetchUserDetails(token);
  }, [navigate]);

  const fetchUserDetails = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil data user');
      const data = await res.json();
      setCreatedAt(new Date(data.createdAt).toLocaleDateString());
    } catch (error) {
      alert('Gagal mengambil data profil');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 flex items-center justify-center p-6">
      <div className="relative bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 space-y-8">
        <RxExit
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 w-7 h-7 text-gray-400 hover:text-red-500 cursor-pointer transition"
          title="Kembali ke Beranda"
        />

        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
          Halo, <span className="text-green-700">{username || 'User'}</span>
        </h1>

        <section>
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Username Saat Ini
          </label>
          <p className="text-xl text-gray-700">{username}</p>
        </section>

        <section>
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Waktu Dibuat Akun
          </label>
          <p className="text-gray-500">{createdAt || 'Memuat...'}</p>
        </section>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
