import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify"; 
import { FaSpinner } from "react-icons/fa"; 

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Logika handleLogin Anda sudah bagus, tidak perlu diubah.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed. Please double check your username and password..");
        return; 
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      if (data.userId) {
        localStorage.setItem("id_users", data.userId)
      }

      toast.success("Login successfull! Welcome back.");
      
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Unable to connect to server. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false); 
    }
  };

  const handleExitLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-4 sm:p-6 relative font-sans">
      <RxExit
        onClick={handleExitLogin}
        className="absolute top-6 right-6 w-7 h-7 text-gray-500 cursor-pointer hover:text-red-500 transition"
        title="Kembali ke Beranda"
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full border-l-4 border-green-500">
        <div className="p-8">
          <h1 className="text-center text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">
            Selamat Datang Kembali
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Silakan masuk ke akun Anda.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
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
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center cursor-pointer gap-3 bg-green-500 hover:bg-green-600 transition-colors text-white py-3 rounded-lg font-bold text-base shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {loading ? "PROCES..." : "LOGIN"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
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
    </div>
  );
};

export default LoginPage;