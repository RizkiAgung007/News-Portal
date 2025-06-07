import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config'; 
import { RxExit } from 'react-icons/rx';
import { FaThumbsUp, FaCommentDots } from 'react-icons/fa';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  // 1. State baru untuk statistik aktivitas
  const [stats, setStats] = useState({ totalLikes: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/login');
      return;
    }
    if (savedUsername) setUsername(savedUsername);
    
    const fetchAllData = async (token) => {
        try {
            // 2. Menggunakan Promise.all untuk mengambil semua data secara paralel
            const [profileRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/auth/activity-stats`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (!profileRes.ok || !statsRes.ok) {
                throw new Error('Gagal mengambil data profil atau aktivitas');
            }

            const profileData = await profileRes.json();
            const statsData = await statsRes.json();

            setCreatedAt(new Date(profileData.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
            setStats(statsData);

        } catch (error) {
            alert('Gagal mengambil data: ' + error.message);
            // Jika gagal, mungkin token tidak valid, logout pengguna
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    fetchAllData(token);
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // Jangan lupa hapus role juga
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 flex items-center justify-center p-6">
      <div className="relative bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 space-y-6">
        <RxExit
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 w-7 h-7 text-gray-400 hover:text-red-500 cursor-pointer transition"
          title="Kembali ke Beranda"
        />

        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide text-center">
          Halo, <span className="text-green-700">{username || 'User'}</span>
        </h1>

        {loading ? (
            <p className="text-center text-gray-500">Memuat data profil...</p>
        ) : (
            <>
            <section className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Username</label>
                        <p className="text-lg text-gray-800 font-semibold">{username}</p>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium text-right">Bergabung Sejak</label>
                        <p className="text-gray-500 text-right">{createdAt}</p>
                    </div>
                  </div>
                </section>
                
                {/* 3. Kartu Statistik Aktivitas Pengguna */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-100 p-4 rounded-xl">
                        <FaThumbsUp className="text-green-600 text-3xl mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-800">{stats.totalLikes}</p>
                        <p className="text-sm text-green-700 font-medium">Like Diberikan</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-xl">
                        <FaCommentDots className="text-blue-600 text-3xl mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-800">{stats.totalComments}</p>
                        <p className="text-sm text-blue-700 font-medium">Komentar Dibuat</p>
                    </div>
                </div>
            </>
        )}


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