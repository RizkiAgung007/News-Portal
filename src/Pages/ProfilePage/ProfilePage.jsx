import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { RxExit, RxPencil1 } from "react-icons/rx";
import { FaThumbsUp, FaCommentDots } from "react-icons/fa";
import { toast } from "react-toastify";
import HistoryActPage from "./HistoryActPage";
import Loading from "../../components/Loading/Loading";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [stats, setStats] = useState({ totalLikes: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState({
    type: null,
    data: [],
    isLoading: false,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchAllData = async (token) => {
      setLoading(true);
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/auth/activity-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!profileRes.ok || !statsRes.ok)
          throw new Error("Gagal mengambil data");
        const profileData = await profileRes.json();
        const statsData = await statsRes.json();
        setUsername(profileData.username);
        localStorage.setItem("username", profileData.username);
        setCreatedAt(
          new Date(profileData.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setStats(statsData);
      } catch (error) {
        toast.error("Sesi Anda berakhir, silakan login kembali.");
        handleLogout(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData(token);
  }, [navigate, token]);

  const handleLogout = (confirmLogout = true) => {
    const doLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/login");
    };
    if (confirmLogout) {
      if (window.confirm("Apakah Anda yakin ingin logout?")) doLogout();
    } else {
      doLogout();
    }
  };

  const fetchHistory = async (type) => {
    if (history.type === type) {
      setHistory({ type: null, data: [], isLoading: false });
      return;
    }
    setHistory({ type, data: [], isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/activity/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat riwayat");
      setHistory({ type, data, isLoading: false });
    } catch (error) {
      toast.error(error.message);
      setHistory({ type, data: [], isLoading: false });
    }
  };

  return (
    <>
      <div className="min-h-screen dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        {/* [STRUKTUR] Tombol Exit diposisikan secara absolut terhadap viewport */}
        <RxExit
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 w-7 h-7 dark:text-green-400 hover:text-red-500 cursor-pointer transition-colors duration-300 z-10"
          title="Kembali ke Beranda"
        />

        {/* [STRUKTUR] Wrapper utama tanpa background, border, atau shadow. Hanya untuk mengatur lebar dan spasi. */}
        <div className="w-full max-w-lg mx-auto p-4 space-y-10">
          {loading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {/* Bagian Header */}
              <div className="text-center pt-8">
                <h1 className="text-4xl sm:text-5xl font-bold dark:text-gray-100">
                  Halo,
                  <span className="ml-2 text-green-500">{username}</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Bergabung sejak {createdAt}
                </p>
              </div>

              {/* Bagian Statistik */}
              <div className="space-y-6">
                <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  Statistik Aktivitas
                </h3>
                {/* [STYLE] Kartu statistik individual diberi sedikit shadow agar 'terangkat' dari background */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-lg">
                      <FaThumbsUp className="text-green-500 text-2xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {stats.totalLikes}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Like Diberikan
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FaCommentDots className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {stats.totalComments}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Komentar Dibuat
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all duration-300 transform cursor-pointer"
                >
                  <RxPencil1 /> Edit Profil & Password
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => fetchHistory("likes")}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 font-medium transition cursor-pointer"
                  >
                    <FaThumbsUp /> Riwayat Like
                  </button>
                  <button
                    onClick={() => fetchHistory("comments")}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 font-medium transition cursor-pointer"
                  >
                    <FaCommentDots /> Riwayat Komentar
                  </button>
                </div>
              </div>

              {history.type && (
                <HistoryActPage
                  type={history.type}
                  data={history.data}
                  isLoading={history.isLoading}
                  onClose={() =>
                    setHistory({ type: null, data: [], isLoading: false })
                  }
                />
              )}

              {/* Bagian Logout */}
              <div className="text-center pb-8">
                <button
                  onClick={() => handleLogout()}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-red-700 text-red-600 rounded-lg hover:bg-red-500 hover:text-gray-100 dark:text-gray-100 font-medium transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
