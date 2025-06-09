import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { Link } from "react-router-dom";
import {
  FaNewspaper,
  FaList,
  FaUsers,
  FaPlus,
  FaUserShield,
  FaFolderPlus,
  FaComment,
  FaUserPlus,
  FaStar,
  FaEye,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [newsCount, setNewsCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [recentComments, setRecentComments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [favoriteNews, setFavoriteNews] = useState([]);
  const [newsGrowth, setNewsGrowth] = useState({ labels: [], datasets: [] });
  const [categoryDist, setCategoryDist] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem("theme")) return localStorage.getItem("theme");
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoints = [
          `${API_BASE_URL}/api/news/`,
          `${API_BASE_URL}/api/category/all`,
          `${API_BASE_URL}/api/auth/all-users`,
          `${API_BASE_URL}/api/comments/recent`,
          `${API_BASE_URL}/api/auth/recent-users`,
          `${API_BASE_URL}/api/news/stats/growth`,
          `${API_BASE_URL}/api/category/stats/category-distribution`,
          `${API_BASE_URL}/api/news/favorites/top`,
        ];

        const requests = endpoints.map((url) =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        );

        const [
          newsRes,
          categoryRes,
          userRes,
          recentCommentsRes,
          recentUsersRes,
          growthRes,
          categoryDistRes,
          favNewsRes,
        ] = await Promise.all(requests);

        setNewsCount(newsRes.data.length);
        setCategoryCount(categoryRes.data.length);
        setUserCount(userRes.data.length);
        setRecentComments(recentCommentsRes.data);
        setRecentUsers(recentUsersRes.data);
        setFavoriteNews(favNewsRes.data);

        const growthLabels = growthRes.data.map((d) =>
          new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        );
        const growthValues = growthRes.data.map((d) => d.count);
        setNewsGrowth({
          labels: growthLabels,
          datasets: [
            {
              label: "Berita Dibuat",
              data: growthValues,
              borderColor: "rgb(34, 197, 94)",
              backgroundColor: "rgba(34, 197, 94, 0.5)",
              tension: 0.1,
            },
          ],
        });

        const categoryLabels = categoryDistRes.data.map((d) => d.category);
        const categoryValues = categoryDistRes.data.map((d) => d.count);
        setCategoryDist({
          labels: categoryLabels,
          datasets: [
            {
              label: "Jumlah Berita",
              data: categoryValues,
              backgroundColor: [
                "#3B82F6",
                "#8B5CF6",
                "#EC4899",
                "#F59E0B",
                "#10B981",
                "#6366F1",
              ],
              hoverOffset: 4,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Gagal mengambil sebagian atau seluruh data dasbor.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const chartOptions = {
    plugins: {
      legend: { labels: { color: theme === "dark" ? "#cbd5e1" : "#4b5563" } },
    },
    scales: {
      x: {
        ticks: { color: theme === "dark" ? "#9ca3af" : "#6b7280" },
        grid: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
      },
      y: {
        ticks: { color: theme === "dark" ? "#9ca3af" : "#6b7280" },
        grid: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
      },
    },
  };

  return (
    <div className="">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Selamat Datang, {username || "Admin"}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Berikut adalah ringkasan aktivitas di website Anda.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">
          Memuat data dasbor...
        </p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/create"
              className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
            >
              <FaPlus className="text-2xl mb-1" />
              <span className="font-semibold">Buat Berita</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition"
            >
              <FaUserShield className="text-2xl mb-1" />
              <span className="font-semibold">Kelola User</span>
            </Link>
            <Link
              to="/admin/category"
              className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              <FaFolderPlus className="text-2xl mb-1" />
              <span className="font-semibold">Kelola Kategori</span>
            </Link>
            <Link
              to="/admin/news"
              className="flex flex-col items-center justify-center p-4 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              <FaNewspaper className="text-2xl mb-1" />
              <span className="font-semibold">Semua Berita</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center space-x-4">
                    <FaNewspaper className="text-green-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Berita
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {newsCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-4">
                    <FaList className="text-blue-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Kategori
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {categoryCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center space-x-4">
                    <FaUsers className="text-purple-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Pengguna
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {userCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Pertumbuhan Berita (7 Hari Terakhir)
                </h3>
                {newsGrowth.labels.length > 0 ? (
                  <Line data={newsGrowth} options={chartOptions} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Data tidak cukup.
                  </p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Distribusi Berita per Kategori
                </h3>
                {categoryDist.labels.length > 0 ? (
                  <div className="max-w-xs mx-auto">
                    <Doughnut
                      data={categoryDist}
                      options={{
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#cbd5e1" : "#4b5563",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Data tidak cukup.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaComment className="mr-2" />
                  Komentar Terbaru
                </h3>
                <ul className="space-y-4">
                  {recentComments.map((comment, i) => (
                    <li
                      key={`comment-${i}`}
                      className="text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0"
                    >
                      <p className="text-gray-800 dark:text-gray-200 break-words">
                        "{comment.content}"
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        oleh <strong>{comment.username}</strong> pada
                        
                        <Link
                          to={`/searchdetail/${comment.id_news}`}
                          className="text-blue-500 hover:underline dark:text-blue-400 ml-1"
                        >
                          {comment.news_title}
                        </Link>
                      </p>
                    </li>
                  ))}
                  {recentComments.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada komentar baru.
                    </p>
                  )}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaUserPlus className="mr-2" />
                  Pendaftar Baru
                </h3>
                <ul className="space-y-3">
                  {recentUsers.map((user, i) => (
                    <li
                      key={`user-${i}`}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {user.username}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(user.create_at).toLocaleDateString("id-ID")}
                      </span>
                    </li>
                  ))}
                  {recentUsers.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada pendaftar baru.
                    </p>
                  )}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaStar className="mr-2 text-yellow-500" />
                  Berita Paling Disukai
                </h3>
                <ul className="space-y-3">
                  {favoriteNews.map((news) => (
                    <li
                      key={news.id_news}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis pr-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {news.title}
                        </p>
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          {news.like_count} Likes
                        </p>
                      </div>
                      
                      <Link
                        to={`/searchdetail/${news.id_news}`}
                        className="flex-shrink-0 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        <FaEye />
                      </Link>
                    </li>
                  ))}
                  {favoriteNews.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada berita yang disukai.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
