import React, { useEffect, useState, useRef } from "react"; 
import axios from "axios";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPencilAlt, FaSave, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi"; 
import { API_BASE_URL } from "../../../config";
import { toast } from "react-toastify";
import Confirm from "../../../components/Modal/Confirm";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topCategories, setTopCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [categoryDelete, setCategoryDelete] = useState(null);
  const [activePopoverId, setActivePopoverId] = useState(null); 
  const popoverRef = useRef(null); 

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

  // Fungsi untuk mengganti tema terang dan gelap.
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Mengambil token otentikasi dari localStorage.
  const token = localStorage.getItem("token");

  // Mengambil semua data kategori dan statistik secara paralel dari API.
  const fetchData = async () => {
    try {
      const [categoriesRes, topCategoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/category/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/category/stats/category-distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCategories(categoriesRes.data);
      setTopCategories(topCategoriesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    }
  };

  // Memanggil `fetchData` sekali saat komponen pertama kali dimuat.
  useEffect(() => {
    fetchData();
  }, [token]);  

  // Fungsi submit form untuk membuat kategori baru dan memuat ulang data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/category/create`,
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        toast.success("Category success added");
        fetchData(); 
      } else if (res.status === 200) {
        toast.warning("Category already exists");
      }
      setNewCategory("");
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  // Menangani edit untuk sebuah kategori.
  const handleEditClick = (category) => {
    setActivePopoverId(null); 
    setEditingCategoryId(category.id_category);
    setEditingText(category.name);
  };

  // Menangani cancel saat edit untuk sebuah kategori.
  const handleCancelClick = () => {
    setEditingCategoryId(null);
    setEditingText("");
  };

  // Mengirim perubahan kategori ke API dan memuat ulang data.
  const handleSaveClick = async (id) => {
    if (!editingText.trim()) {
      toast.error("The category name cannot be empty.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/category/update/${id}`,
        { name: editingText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category success edit");
      handleCancelClick();
      fetchData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 409) {
        toast.warning("The category name is already in use.");
      } else {
        console.error("Error updating category:", err);
        toast.error("Failed to update category");
      }
    }
  };

  const handleDelete = (category) => {
    setActivePopoverId(null); 
    setCategoryDelete(category);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryDelete) return;

    try {
      const idToDelete = categoryDelete.id_category;
      await axios.delete(`${API_BASE_URL}/api/category/delete/${idToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Category "${categoryDelete.name}" successfully deleted.`);
      fetchData();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(`Failed to delete category "${categoryDelete.name}".`);
    } finally {
      setConfirmModalOpen(false);
      setCategoryDelete(null);
    }
  };

  // Fungsi untuk membuka/menutup popover aksi mobile
  const togglePopover = (categoryId) => {
    setActivePopoverId(activePopoverId === categoryId ? null : categoryId);
  };

  // Efek untuk menutup popover ketika klik di luar
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


  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Category Management
          </h1>
          {/* Tombol untuk theme */}
          <button
            onClick={toggleTheme}
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Total Category:{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">
            {categories.length}
          </span>
        </p>

        {/* Form untuk nambah kategori */}
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Add a New Category
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="New Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent flex-grow text-gray-900 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`rounded-md px-6 cursor-pointer py-2 text-white font-semibold transition-colors duration-300 ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </form>
          {error && (
            <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
          )}
        </div>

        <div className="md:flex md:flex-row flex-col justify-between gap-8">
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              All Category
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
              <table className="min-w-full text-left table-auto">
                <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300 font-medium">
                  <tr>
                    <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                      No
                    </th>
                    <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600">
                      Category Name
                    </th>
                    <th className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                      >
                        No Category
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat, i) => (
                      <tr
                        key={cat.id_category}
                        className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {i + 1}
                        </td>

                        <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-900 dark:text-white">
                          {editingCategoryId === cat.id_category ? (
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                              autoFocus
                            />
                          ) : (
                            cat.name
                          )}
                        </td>

                        <td className="px-5 py-3 border-b border-gray-200 dark:border-gray-600 text-center relative">
                          
                          {/* Tombol action untuk DESKTOP */}
                          <div className="hidden md:flex justify-center items-center space-x-4">
                            {editingCategoryId === cat.id_category ? (
                              <>
                                <button
                                  onClick={() => handleSaveClick(cat.id_category)}
                                  className="text-green-500 cursor-pointer hover:text-green-700 dark:text-green-400 dark:hover:text-green-500 transition"
                                >
                                  <FaSave className="inline-block text-lg" />
                                </button>
                                <button
                                  onClick={handleCancelClick}
                                  className="text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500 transition"
                                >
                                  <FaTimes className="inline-block text-lg" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditClick(cat)}
                                  className="text-blue-500 cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 transition"
                                >
                                  <FaPencilAlt className="inline-block text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(cat)}
                                  className="text-red-500 cursor-pointer hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                                >
                                  <FaRegTrashCan className="inline-block text-lg" />
                                </button>
                              </>
                            )}
                          </div>

                          <div className="md:hidden flex justify-center items-center">
                            <button
                              onClick={() => togglePopover(cat.id_category)} 
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                            >
                              <HiOutlineDotsVertical className="text-xl" />
                            </button>

                            {/* Popover / Dropdown Aksi Mobile */}
                            {activePopoverId === cat.id_category && ( 
                              <div
                                ref={popoverRef} 
                                className="absolute left-1/2 -translate-x-1/2 mt-2 w-14 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
                              >
                                {editingCategoryId !== cat.id_category ? (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(cat)}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                      <FaPencilAlt className="text-blue-500" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(cat)}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                      <FaRegTrashCan className="text-red-500" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleSaveClick(cat.id_category)}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                      <FaSave className="text-green-500" />
                                    </button>
                                    <button
                                      onClick={handleCancelClick}
                                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                      <FaTimes className="text-gray-500" />
                                    </button>
                                  </>
                                )}
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
          </div>

          {/* Sidebar Top 5 Kategori */}
          <div className="lg:w-1/3 mt-8 lg:mt-11">
            <div className="sticky top-6 bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Top 5 Category
              </h3>
              {topCategories.length > 0 ? (
                <ul className="space-y-3">
                  {topCategories.map((cat, index) => (
                    <li
                      key={cat.category}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-semibold capitalize text-gray-800 dark:text-gray-200">
                        {index + 1}. {cat.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                        {cat.count} news
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Statistics not available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* komponen ConfirmModal */}
      <Confirm
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setCategoryDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete Category"
        message={`Are you sure you want to delete the category "${categoryDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Category;        