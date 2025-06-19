import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import {
  FaRegTrashCan,
  FaArrowDown,
  FaArrowUp,
  FaMoon,
  FaSun,
  FaEye,
} from "react-icons/fa6";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "react-toastify";
import Confirm from "../../../components/Modal/Confirm";
import Loading from "../../../components/Loading/Loading";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [activePopoverId, setActivePopoverId] = useState(null);
  const popoverRef = useRef(null);
  const token = localStorage.getItem("token");
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

  const fetchReviews = async (page = 1, order = "desc", search = "") => {
    setLoading(true);
    setError(null);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await axios.get(
        `${API_BASE_URL}/api/review?page=${page}&limit=20&sortOrder=${order}${searchParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews(res.data.reviews || res.data);
      setTotalReviews(res.data.totalReviews || res.data.length);
      setTotalPages(res.data.totalPages || Math.ceil(res.data.length / 20));
      setCurrentPage(res.data.currentPage || page);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load review. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage, sortOrder, searchQuery);
  }, [currentPage, sortOrder, token]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews(1, sortOrder, searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const togglePopover = (reviewId) => {
    setActivePopoverId(activePopoverId === reviewId ? null : reviewId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopoverId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopoverId]);

  const handleDeleteClick = (review) => {
    setActivePopoverId(null);
    setReviewToDelete(review);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    setLoading(true);
    setConfirmModalOpen(false);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/review/${reviewToDelete.id_ulasan}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Review successfully deleted!");
      fetchReviews(currentPage, sortOrder, searchQuery);
    } catch (err) {
      console.error("Error deleting review:", err);
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to delete review. Please try again..");
      }
    } finally {
      setLoading(false);
      setReviewToDelete(null);
    }
  };

  const handleView = (id) => {
      setActivePopoverId(null);
      navigate(`review/view/${id}`);
    };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortToggle = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  if (loading && reviews.length === 0) {
    return <Loading  />;
  }
  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <p>{error}</p>
        <button
          onClick={() => fetchReviews(currentPage, sortOrder, searchQuery)}
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
            Review Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Total Reviews:{" "}
            <span className="font-semibold text-green-700 dark:text-green-400">
              {totalReviews}
            </span>
          </p>
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ulasan berdasarkan subjek..."
              className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleSortToggle}
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

      {error && (
        <p className="text-red-600 dark:text-red-400 mb-6 text-center">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
        <table className="min-w-full text-left table-auto">
          <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300 font-medium">
            <tr>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                No
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Username
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Email
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Subject
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Message
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                Created At
              </th>
              <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  <Loading />
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                >
                  Tidak ada ulasan ditemukan.
                </td>
              </tr>
            ) : (
              reviews.map((review, index) => (
                <tr
                  key={review.id_ulasan}
                  className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {(currentPage - 1) * 20 + index + 1}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-900 dark:text-white">
                    {review.username}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {review.email}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {review.subject}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {review.message}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                    {new Date(review.create_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center relative">
                    {/* Tombol aksi untuk DESKTOP */}
                    <div className="hidden md:flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handleDeleteClick(review)}
                        className="text-red-500 cursor-pointer hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                        disabled={loading}
                      >
                        <FaRegTrashCan className="inline-block text-lg" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/review/view/${review.id_ulasan}`)}
                        className="text-blue-500 cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 transition"
                        disabled={loading}
                      >
                        <FaEye className="inline-block text-lg" />
                      </button>
                    </div>

                    {/* Tombol ellipsis untuk MOBILE */}
                    <div className="md:hidden flex justify-center items-center">
                      <button
                        onClick={() => togglePopover(review.id_ulasan)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                      >
                        <HiOutlineDotsVertical className="text-xl" />
                      </button>

                      {/* Popover aksi mobile */}
                      {activePopoverId === review.id_ulasan && (
                        <div
                          ref={popoverRef}
                          className="absolute left-1/2 -translate-x-1/2 mt-2 w-14 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <button
                            onClick={() => handleDeleteClick(review)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            disabled={loading}
                          >
                            <FaRegTrashCan className="text-red-500" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/review/view/${review.id_ulasan}`)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            disabled={loading}
                          >
                            <FaEye className="text-blue-500" />
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
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={currentPage === page || loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
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
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
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
          setReviewToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete Review"
        message={`Are you sure you want to delete the review from "${reviewToDelete?.username}" with subject "${reviewToDelete?.subject}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Review;
