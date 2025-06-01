import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RxExit } from 'react-icons/rx';
import { API_BASE_URL } from '../../config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Login gagal');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      alert('Login berhasil!');
      navigate('/');
    } catch (error) {
      alert('Terjadi kesalahan saat login');
      console.error(error);
    }
  };

  const handleExitLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f9f6f2] flex justify-center items-center p-6 relative font-sans text-gray-700">
      <RxExit
        onClick={handleExitLogin}
        className="absolute top-5 right-5 w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500 transition"
        title="Kembali ke Beranda"
      />

      <div
        style={{ boxShadow: '4px 8px 20px rgba(0,0,0,0.12)' }}
        className="bg-white rounded-xl max-w-md w-full p-8"
      >
        <h1 className="text-center text-3xl font-serif mb-6" style={{ letterSpacing: '1.5px' }}>
          Masuk ke Akunmu
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-semibold text-gray-600"
              style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              style={{ fontSize: '15px', fontWeight: '500' }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-gray-600"
              style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              style={{ fontSize: '15px', fontWeight: '500' }}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-3 rounded-lg font-semibold text-lg"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
