import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPencilAlt, FaSave, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { API_BASE_URL } from "../../../config";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topCategories, setTopCategories] = useState([]); 
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingText, setEditingText] = useState(""); 

  // Membuat theme Dark Mode dan light  
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

  const fetchData = async () => {
    try {
      // Mengambil data semua kategori dari db dan statistik top 5
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

  useEffect(() => {
    fetchData();
  }, []);

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
        fetchData(); 
      } else if (res.status === 200) {
        alert("Category already exists");
      }
      setNewCategory("");
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id_category);
    setEditingText(category.name);
  };

  const handleCancelClick = () => {
    setEditingCategoryId(null);
    setEditingText("");
  };

  const handleSaveClick = async (id) => {
    if (!editingText.trim()) {
      alert("Nama kategori tidak boleh kosong.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/category/update/${id}`,
        { name: editingText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCancelClick(); 
      fetchData(); 
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Nama kategori tersebut sudah digunakan.");
      } else {
        console.error("Error updating category:", err);
        alert("Failed to update category");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/api/category/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(); 
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Manajemen Kategori
          </h1>
          <button
            onClick={toggleTheme}
            className="p-3 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Total kategori:{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">
            {categories.length}
          </span>
        </p>

        {/* Form untuk nambah kategori */}
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Tambah Kategori Baru
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Nama kategori baru"
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

        {/* Tampilan untuk tabel */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Semua Kategori
        </h2>
        <div className="md:flex md:flex-row flex-col justify-between gap-8">
          <div className="overflow-x-auto w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full text-left table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700/50 text-sm uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                    No
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
                    Nama Kategori
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                    >
                      Tidak ada kategori
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, i) => (
                    <tr
                      key={cat.id_category}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {i + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                        {editingCategoryId === cat.id_category ? (
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            autoFocus
                          />
                        ) : (
                          cat.name
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {editingCategoryId === cat.id_category ? (
                          <>
                            <button
                              onClick={() => handleSaveClick(cat.id_category)}
                              className="text-green-500 cursor-pointer hover:text-green-700 dark:text-green-400 dark:hover:text-green-500 transition mr-4"
                              title="Simpan"
                            >
                              <FaSave className="inline-block text-lg" />
                            </button>
                            <button
                              onClick={handleCancelClick}
                              className="text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500 transition"
                              title="Batal"
                            >
                              <FaTimes className="inline-block text-lg" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(cat)}
                              className="text-blue-500 cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 transition mr-4"
                              title="Edit Kategori"
                            >
                              <FaPencilAlt className="inline-block text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id_category)}
                              className="text-red-500 cursor-pointer hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                              title="Hapus Kategori"
                            >
                              <FaRegTrashCan className="inline-block text-lg" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-6 bg-white dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Top 5 Kategori
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
                        {cat.count} berita
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Statistik tidak tersedia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
