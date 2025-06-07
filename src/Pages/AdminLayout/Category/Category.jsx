import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaRegTrashCan } from "react-icons/fa6";
import { API_BASE_URL } from '../../../config';
import { FaSun, FaMoon } from 'react-icons/fa'; // Ditambahkan

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- [DITAMBAHKAN] LOGIKA DARK MODE ---
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  // --- END OF LOGIKA DARK MODE ---

  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
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
        // Ambil ulang daftar kategori untuk memastikan data sinkron
        fetchCategories();
      } else if (res.status === 200) {
        alert('Category already exists');
      }
      setNewCategory('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/category/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(prev => prev.filter(cat => cat.id_category !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    }
  };

  return (
    // [PERBAIKAN] Mengubah div ini menjadi kartu yang konsisten
    <div className="">
      
      {/* [DITAMBAHKAN] Wrapper untuk judul dan tombol agar sejajar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Manajemen Kategori</h1>
        <button onClick={toggleTheme} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Total kategori: <span className="font-semibold text-green-600 dark:text-green-400">{categories.length}</span>
      </p>

      {/* Bagian Form */}
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tambah Kategori Baru</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
            className={`rounded-md px-6 py-2 text-white font-semibold transition-colors duration-300
                ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
            {loading ? 'Menambah...' : 'Tambah'}
            </button>
        </form>
        {error && <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>}
      </div>


      {/* Bagian Tabel */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Semua Kategori</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-100 dark:bg-gray-700/50 text-sm uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">No</th>
              <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Nama Kategori</th>
              <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500 dark:text-gray-400 italic">Tidak ada kategori</td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr
                  key={cat.id_category}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{i + 1}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{cat.name}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleDelete(cat.id_category)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                      title="Delete Category"
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
    </div>
  );
};

export default Category;