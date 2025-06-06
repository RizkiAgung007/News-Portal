import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { FaSun, FaMoon } from 'react-icons/fa';

const Create = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    create_by: '',
    photo: null,
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/category/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        } else {
          setError('Gagal memuat kategori');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat kategori');
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('create_by', form.create_by);
    formData.append('photo', form.photo);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/news`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert('Berita berhasil dibuat!');
        e.target.reset(); 
        setForm({ title: '', description: '', category: '', create_by: '', photo: null });
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error saat submit: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Buat Berita Baru</h2>
        <button onClick={toggleTheme} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Judul Berita</label>
          <input
            id="title" type="text" name="title" value={form.title} onChange={handleChange}
            placeholder="Masukkan judul berita" required
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
          <textarea
            id="description" name="description" value={form.description} onChange={handleChange}
            placeholder="Masukkan deskripsi berita" required rows={6}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
            <select
              id="category" name="category" value={form.category} onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id_category} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="create_by" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Penulis</label>
            <input
              id="create_by" type="text" name="create_by" value={form.create_by} onChange={handleChange}
              placeholder="Masukkan nama penulis" required
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="photo" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Foto</label>
          <input
            id="photo" type="file" name="photo" accept="image/*" onChange={handleChange}
            required
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <div className="text-right">
          <button
            type="submit" disabled={submitting}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg transition-colors disabled:bg-green-400"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Berita'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create;