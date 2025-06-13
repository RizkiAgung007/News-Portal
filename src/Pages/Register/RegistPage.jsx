import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading"

const RegistPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Password dan konfirmasi tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registrasi gagal");
        return;
      }

      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      toast.error("Terjadi kesalahan saat registrasi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-4 sm:p-6 relative font-sans">
      <RxExit
        className="absolute top-6 right-6 w-7 h-7 text-gray-500 cursor-pointer hover:text-red-500 transition"
        onClick={handleExit}
        title="Kembali ke Beranda"
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full border-l-4 border-green-500">
        <div className="p-8">
          <h1 className="text-center text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">
            Buat Akun Baru
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Daftar untuk mulai memberikan kontribusi.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="cth: username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Konfirmasi Password
              </label>
              <input
                id="confirm"
                type="password"
                placeholder="Ulangi password Anda"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg font-bold text-base shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading && <Loading />}
              {loading ? "PROCES..." : "REGISTER"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-green-600 font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistPage;
