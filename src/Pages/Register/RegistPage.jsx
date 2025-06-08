import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { API_BASE_URL } from "../../config";

const RegistPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Password dan konfirmasi tidak cocok!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("JSON parse error:", err);
        alert("Response bukan JSON valid");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Registrasi gagal");
        return;
      }

      alert("Registrasi berhasil!");
      navigate("/login");
    } catch (error) {
      alert("Terjadi kesalahan saat registrasi");
      console.error(error);
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f9f6f2] flex justify-center items-center p-6 relative font-sans text-gray-700">
      <RxExit
        className="absolute top-5 right-5 w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500 transition"
        onClick={handleExit}
        title="Kembali ke Beranda"
      />
      <div
        style={{ boxShadow: "4px 8px 20px rgba(0,0,0,0.12)" }}
        className="bg-white rounded-xl max-w-md w-full p-8"
      >
        <h1
          className="text-center text-3xl font-serif mb-6"
          style={{ letterSpacing: "1.5px" }}
        >
          Buat Akun Baru
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-semibold text-gray-600"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              style={{ fontSize: "15px", fontWeight: "500" }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-gray-600"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
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
              style={{ fontSize: "15px", fontWeight: "500" }}
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block mb-1 text-sm font-semibold text-gray-600"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              Konfirmasi Password
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Ulangi password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              style={{ fontSize: "15px", fontWeight: "500" }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-3 rounded-lg font-semibold text-lg"
          >
            Daftar
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm font-sans">
          <p>Sudah punya akun?</p>
          <Link
            to="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistPage;
