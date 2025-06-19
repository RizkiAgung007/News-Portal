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
  FaHome,
  FaArchive,
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
import Loading from "../../../components/Loading/Loading";

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
  const [commentGrowth, setCommentGrowth] = useState({
    labels: [],
    datasets: [],
  });
  const [userGrowth, setUserGrowth] = useState({ label: [], datasets: [] });
  const [categoryDist, setCategoryDist] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryVisibility, setCategoryVisibility] = useState({});

  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem("theme")) return localStorage.getItem("theme");
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Menangani ketika label kategori diklik
  const handleLegendClick = (label) => {
    setCategoryVisibility((prevVisibility) => ({
      ...prevVisibility,
      [label]: !prevVisibility[label],
    }));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Menangani toggle untuk theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Menyimpan username pada localstorage
  const username = localStorage.getItem("username");
  // Menyimpan token pada localstorage
  const token = localStorage.getItem("token");

  // Mengamil API melalui endpoint pada databade
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
          `${API_BASE_URL}/api/comments/stats/growth`,
          `${API_BASE_URL}/api/auth/stats/growth`,
          `${API_BASE_URL}/api/category/stats/category-distribution`,
          `${API_BASE_URL}/api/news/favorites/top`,
        ];

        // Melakukan mapping request API dalam sebuah daftar.
        const requests = endpoints.map((url) =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        );

        // Memproses semua permintaan secara paralel dan tunggu hingga semua data diterima.
        const [
          newsRes,
          categoryRes,
          userRes,
          recentCommentsRes,
          recentUsersRes,
          growthNewRes,
          growthComRes,
          growthUserRes,
          categoryDistRes,
          favNewsRes,
        ] = await Promise.all(requests);

        // Memperbarui state komponen dengan data yang sudah diterima dari API.
        setNewsCount(newsRes.data.length);
        setCategoryCount(categoryRes.data.length);
        setUserCount(userRes.data.totalUsers);
        setRecentComments(recentCommentsRes.data);
        setRecentUsers(recentUsersRes.data);
        setFavoriteNews(favNewsRes.data);

        // Membuat chart untuk pertumbuhan berita
        const growthNews = growthNewRes.data.map((d) =>
          new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        );
        const growthNewsVal = growthNewRes.data.map((d) => d.count);
        setNewsGrowth({
          labels: growthNews,
          datasets: [
            {
              label: "News Created",
              data: growthNewsVal,
              borderColor: "rgb(34, 197, 94)",
              backgroundColor: "rgba(34, 197, 94, 0.5)",
              tension: 0.1,
            },
          ],
        });

        // Membuat chart untuk pertumbuhan komentar
        const growthComment = growthComRes.data.map((d) =>
          new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        );
        const growthComVal = growthComRes.data.map((d) => d.count);
        setCommentGrowth({
          labels: growthComment,
          datasets: [
            {
              label: "Comment Created",
              data: growthComVal,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.5)",
              tension: 0.1,
            },
          ],
        });

        // Membuat chart untuk pertumbuhan user
        const growthUser = growthUserRes.data.map((d) =>
          new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        );
        const growthUserVal = growthUserRes.data.map((d) => d.count);
        setUserGrowth({
          labels: growthUser,
          datasets: [
            {
              label: "User Created",
              data: growthUserVal,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.5)",
              tension: 0.1,
            },
          ],
        });

        // Membuat chart untuk kategori
        const categoryLabels = categoryDistRes.data.map((d) => d.category);
        const categoryValues = categoryDistRes.data.map((d) => d.count);

        // Membuat fungsi untuk menampilkan semua label kategori
        const initialVisibility = {};
        categoryLabels.forEach((label) => {
          initialVisibility[label] = true;
        });
        setCategoryVisibility(initialVisibility);

        setCategoryDist({
          labels: categoryLabels,
          datasets: [
            {
              label: "Number of News",
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

  // Menyiapkan data yang sudah difilter untuk ditampilkan
  const visibleDataForChart = {
    labels: categoryDist.labels.filter((label) => categoryVisibility[label]),
    datasets: categoryDist.datasets.map((dataset) => ({
      ...dataset,
      data: categoryDist.labels
        .map((label, index) =>
          categoryVisibility[label] ? dataset.data[index] : null
        )
        .filter((data) => data !== null),
      backgroundColor: categoryDist.labels
        .map((label, index) =>
          categoryVisibility[label] ? dataset.backgroundColor[index] : null
        )
        .filter((color) => color !== null),
    })),
  };

  return (
    <div className="">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome, {username || "Admin"}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Below is a summary of the activity on your website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol Home  */}
          <div className="relative group">
            <Link
              to="/"
              className="p-3 block cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaHome />
            </Link>
          </div>

          {/* Tombol Theme dengan Tooltip */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === "light" ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded">
          {error}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Membuat berita */}
            <Link
              to="/admin/create"
              className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
            >
              <FaPlus className="text-2xl mb-1" />
              <span className="font-semibold">Create News</span>
            </Link>

            {/* Mengelola user */}
            <Link
              to="/admin/users"
              className="flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition"
            >
              <FaUserShield className="text-2xl mb-1" />
              <span className="font-semibold">User</span>
            </Link>

            {/* Mengelola kategori */}
            <Link
              to="/admin/category"
              className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              <FaFolderPlus className="text-2xl mb-1" />
              <span className="font-semibold">Category</span>
            </Link>

            {/* Mengelola berita */}
            <Link
              to="/admin/news"
              className="flex flex-col items-center justify-center p-4 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              <FaNewspaper className="text-2xl mb-1" />
              <span className="font-semibold">All News</span>
            </Link>

            {/* Mengelola review */}
            <Link
              to="/admin/review"
              className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
            >
              <FaArchive className="text-2xl mb-1" />
              <span className="font-semibold">Review</span>
            </Link>

          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Tampilan total berita */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center space-x-4">
                    <FaNewspaper className="text-green-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total News
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {newsCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tampilan total kategori */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-4">
                    <FaList className="text-blue-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Category
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {categoryCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tampilan total user */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center space-x-4">
                    <FaUsers className="text-purple-500 text-3xl" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total User
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {userCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart untuk pertumbuhan berita dan komentar */}
              <div className="md:flex md:flex-row flex-col gap-8 md:space-y-0 space-y-4">
                <div className="bg-white md:w-1/2 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    News Growth (Last 7 Days)
                  </h3>
                  {newsGrowth.labels.length > 0 ? (
                    <Line data={newsGrowth} options={chartOptions} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Not enough data.
                    </p>
                  )}
                </div>
                <div className="bg-white md:w-1/2 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    Comment Growth (Last 7 Days)
                  </h3>
                  {commentGrowth.labels.length > 0 ? (
                    <Line data={commentGrowth} options={chartOptions} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Not enough data.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:flex md:flex-row flex-col gap-8 md:space-y-0 space-y-4">
                <div className="bg-white md:w-1/2 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    User Growth (Last 7 Days)
                  </h3>
                  {userGrowth.labels.length > 0 ? (
                    <Line data={userGrowth} options={chartOptions} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Not enough data.
                    </p>
                  )}
                </div>

                {/* Chart untuk distribusi kategori by berita */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    News Distribution by Category
                  </h3>
                  {categoryDist.labels.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                      {/* Label untuk kategori */}
                      <div className="flex-shrink-0">
                        <ul className="space-y-2 sm:space-x-0 space-x-4 grid sm:grid-cols-1 grid-cols-2">
                          {categoryDist.labels.map((label, index) => (
                            <li
                              key={label}
                              className={`flex items-center text-sm cursor-pointer transition-opacity ${
                                !categoryVisibility[label]
                                  ? "opacity-40"
                                  : "opacity-100"
                              }`}
                              onClick={() => handleLegendClick(label)}
                            >
                              <span
                                className="inline-block w-4 h-4 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    categoryDist.datasets[0].backgroundColor[
                                      index
                                    ],
                                }}
                              ></span>
                              <span
                                className={`text-gray-700 dark:text-gray-300 ${
                                  !categoryVisibility[label]
                                    ? "line-through"
                                    : ""
                                }`}
                              >
                                {label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Chart Doughnut */}
                      <div className="w-48 h-48 sm:w-56 sm:h-56">
                        <Doughnut
                          data={visibleDataForChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                            },
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Not enough data.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Komentar terbaru */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaComment className="mr-2" />
                  Latest Comments
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
                        by <strong>{comment.username}</strong> on
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
                      No new comments yet.
                    </p>
                  )}
                </ul>
              </div>

              {/* User terbaru */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaUserPlus className="mr-2" />
                  New user
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
                      There are no new registrants yet.
                    </p>
                  )}
                </ul>
              </div>

              {/* Berita fav */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                  <FaStar className="mr-2 text-yellow-500" />
                  Most Liked News
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
                      No news has been liked yet.
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
