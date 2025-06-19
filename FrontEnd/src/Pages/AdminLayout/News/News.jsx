import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  FaEdit,
  FaSun,
  FaMoon,
  FaEye,
  FaPlus,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Confirm from "../../../components/Modal/Confirm";
import Loading from "../../../components/Loading/Loading";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNewsCount, setTotalNewsCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [newsToDeleteId, setNewsToDeleteId] = useState(null);
  const [newsToDeleteTitle, setNewsToDeleteTitle] = useState("");
  const [activePopoverId, setActivePopoverId] = useState(null); 
  const popoverRef = useRef(null); 
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
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

  const token = localStorage.getItem("token");

  // Fetch daftar kategori dari backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/public/all`);
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Gagal memuat daftar kategori.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch data berita dengan filter, sort, dan pagination
  const fetchNews = async (
    page = 1,
    order = "desc",
    category = "",
    search = ""
  ) => {
    setLoading(true);
    setError(null);
    try {
      const categoryParam = category
        ? `&category=${encodeURIComponent(category)}`
        : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

      const res = await axios.get(
        `${API_BASE_URL}/api/news/all-news?page=${page}&limit=20&sortOrder=${order}${categoryParam}${searchParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNews(res.data.news);
      setTotalNewsCount(res.data.totalNews);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Error fetching news:", err);
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Gagal memuat berita.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNews(currentPage, sortOrder, categoryFilter, searchQuery);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, sortOrder, categoryFilter, searchQuery, token]);

  const togglePopover = (newsId) => {
    setActivePopoverId(activePopoverId === newsId ? null : newsId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActivePopoverId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopoverId]);

  const handleDeleteClick = (id, title) => {
    setActivePopoverId(null);
    setNewsToDeleteId(id);
    setNewsToDeleteTitle(title);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!newsToDeleteId) return;

    setLoading(true);
    setConfirmModalOpen(false);

    try {
      await axios.delete(`${API_BASE_URL}/api/news/${newsToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Berita berhasil dihapus!");
      fetchNews(currentPage, sortOrder, categoryFilter, searchQuery); 
    } catch (error) {
      console.error("Error deleting news:", error);
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Gagal menghapus berita.");
      }
    } finally {
      setLoading(false);
      setNewsToDeleteId(null);
      setNewsToDeleteTitle("");
    }
  };

  const handleEdit = (id) => {
    setActivePopoverId(null);
    navigate(`/admin/edit/${id}`);
  };

  const handleView = (id) => {
    setActivePopoverId(null); 
    navigate(`/admin/view/${id}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  if (loading && news.length === 0) {
    return <Loading text="Memuat berita..." />;
  }
  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <p>{error}</p>
        <button
          onClick={() =>
            fetchNews(currentPage, sortOrder, categoryFilter, searchQuery)
          }
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Manajemen Berita
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Total Berita:{" "}
            <strong className="text-green-600 dark:text-green-400">
              {totalNewsCount}
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <div className="relative flex-grow">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="block md:w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out cursor-pointer"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari berdasarkan judul berita..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Link
            to="/admin/news/add"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Add News
          </Link>
          <button
            onClick={handleSort}
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {sortOrder === "desc" ? <FaArrowDown /> : <FaArrowUp />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300 font-medium">
            <tr>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                No
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                News
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Category
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Create At
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {news.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada berita ditemukan.
                </td>
              </tr>
            ) : (
              news.map((item, index) => (
                <tr
                  key={item.id_news}
                  className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-800/50 dark:hover:bg-gray-700/60 transition-colors duration-200"
                >
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {(currentPage - 1) * 20 + index + 1}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400">
                    {item.category}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400">
                    {new Date(item.create_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-center relative">
                    {" "}
                    <div className="hidden md:flex justify-center items-center space-x-4">
                      <button
                        onClick={() =>
                          handleDeleteClick(item.id_news, item.title)
                        }
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 cursor-pointer transition"
                        disabled={loading}
                      >
                        <FaRegTrashCan />
                      </button>
                      <button
                        onClick={() => handleEdit(item.id_news)}
                        className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-500 cursor-pointer transition"
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleView(item.id_news)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 cursor-pointer transition"
                        disabled={loading}
                      >
                        <FaEye />
                      </button>
                    </div>
                    
                    <div className="md:hidden flex justify-center items-center">
                      <button
                        onClick={() => togglePopover(item.id_news)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                      >
                        <HiOutlineDotsVertical className="text-xl" />
                      </button>
                    
                      {/* Popover aksi mobile */}
                      {activePopoverId === item.id_news && (
                        <div
                          ref={popoverRef}
                          className="absolute left-1/2 -translate-x-1/2 mt-2 w-14 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <button
                            onClick={() => handleEdit(item.id_news)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            disabled={loading}
                          >
                            <FaEdit className="text-yellow-500" />
                          </button>
                          <button
                            onClick={() => handleView(item.id_news)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            disabled={loading}
                          >
                            <FaEye className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id_news, item.title)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            disabled={loading}
                          >
                            <FaRegTrashCan className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={currentPage === page || loading}
              className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Komponen Confirm Modal */}
      <Confirm
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setNewsToDeleteId(null);
          setNewsToDeleteTitle("");
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete News"
        message={`Are you sure you want to delete the news "${newsToDeleteTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default News;