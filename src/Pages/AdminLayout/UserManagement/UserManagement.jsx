import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegTrashCan } from "react-icons/fa6";
import { API_BASE_URL } from "../../../config";
import { FaSun, FaMoon, FaArrowDown, FaArrowUp } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc"); // default: terbaru dulu
  const [searchQuery, setSearchQuery] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Menyimpan token pada localstorage
  const token = localStorage.getItem("token");

  // Mengamil API melalui endpoint pada databade
  const fetchUsers = async (page = 1, order = "desc", search = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/all-users?page=${page}&limit=20&sortOrder=${order}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, sortOrder);
  }, [currentPage, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(1, sortOrder, searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, sortOrder]);

  // Menangani tombol delete by id
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const originalUsers = [...users];
    setUsers((prevUsers) => prevUsers.filter((user) => user.id_users !== id));
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(currentPage, sortOrder);
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
      setUsers(originalUsers);
    }
  };

  // Menangani tombol untuk page
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Menangani tombol untuk sorting
  const handleSortToggle = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Manajemen Pengguna
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Total pengguna:{" "}
            <span className="font-semibold text-green-700 dark:text-green-400">
              {totalUsers}
            </span>
          </p>

          <div className="md:w-full w-1/3 pt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengguna..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSortToggle}
            title="sorting"
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {sortOrder === "desc" ? <FaArrowDown /> : <FaArrowUp />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>}

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
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                >
                  Memuat...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id_users}
                  className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {(currentPage - 1) * 20 + index + 1}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-900 dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                    {new Date(user.create_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center">
                    <button
                      onClick={() => handleDelete(user.id_users)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                      title="Delete User"
                    >
                      <FaRegTrashCan className="inline-block text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md disabled:opacity-50 transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 cursor-pointer py-2 text-sm font-medium rounded-md disabled:opacity-50 transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
