import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify"; // Impor toast
import { FaSpinner } from "react-icons/fa"; // Impor ikon spinner untuk loading

const LoginPage = () => {
  // [SARAN 2] Mengganti nama state agar konsisten
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // [SARAN 1] Menambahkan state untuk loading
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading saat proses dimulai

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // [SARAN 2] Menggunakan state username yang sudah konsisten
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // [SARAN 1] Menggunakan toast untuk notifikasi error
        toast.error(data.message || "Login gagal. Periksa kembali username dan password Anda.");
        return; 
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      // [SARAN 1] Menggunakan toast untuk notifikasi sukses
      toast.success("Login berhasil! Selamat datang kembali.");
      
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      // [SARAN 1] Menggunakan toast untuk notifikasi error jaringan
      toast.error("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      console.error(error);
    } finally {
      setLoading(false); // Set loading selesai, baik berhasil maupun gagal
    }
  };

  const handleExitLogin = () => {
    navigate("/");
  };

  return (
    // [SARAN 2] Menggunakan font-sans sebagai dasar, dark mode support
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-6 relative font-sans">
      <RxExit
        onClick={handleExitLogin}
        className="absolute top-5 right-5 w-7 h-7 text-gray-500 cursor-pointer hover:text-red-500 transition"
        title="Kembali ke Beranda"
      />
      
      {/* [SARAN 2] Menggunakan kelas Tailwind untuk styling, bukan inline style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-center text-3xl font-serif mb-8 text-gray-800 dark:text-gray-100 tracking-wider">
          Masuk ke Akunmu
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading} // Tombol dinonaktifkan saat loading
            className="w-full flex justify-center items-center gap-3 bg-green-600 hover:bg-green-700 transition-colors text-white py-3 rounded-lg font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {/* [SARAN 1] Menampilkan ikon spinner saat loading */}
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-green-600 font-semibold hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;