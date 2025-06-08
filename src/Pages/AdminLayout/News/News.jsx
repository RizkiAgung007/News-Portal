import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaSun, FaMoon } from "react-icons/fa"; // Ditambahkan

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- [DITAMBAHKAN] LOGIKA DARK MODE ---
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
  // --- END OF LOGIKA DARK MODE ---

  // Logika fetch Anda (tidak diubah)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat berita");
        setLoading(false);
      });
  }, []);

  // Logika handleDelete Anda (tidak diubah)
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        throw new Error("Gagal menghapus berita");
      }
      setNews((prevNews) => prevNews.filter((item) => item.id_news !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  // Tampilan loading dan error Anda (tidak diubah)
  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    // [PERBAIKAN] Mengubah div ini menjadi kartu yang konsisten
    <div className="">
      {/* [DITAMBAHKAN] Wrapper untuk judul dan tombol agar sejajar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Manajemen Berita
        </h1>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Total Berita:{" "}
        <strong className="text-green-600 dark:text-green-400">
          {news.length}
        </strong>
      </p>

      {/* Tabel dengan styling dark mode */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[600px] table-auto text-left">
          <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300">
            <tr>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-center font-medium">
                No
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-center font-medium">
                News
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-center font-medium">
                Category
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-center font-medium">
                Created At
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-center font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {news.map((item, index) => (
              <tr
                key={item.id_news}
                className="odd:bg-white even:bg-green-50 hover:bg-green-100 dark:odd:bg-gray-800 dark:even:bg-gray-800/50 dark:hover:bg-gray-700/60 transition-colors duration-200"
              >
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">
                  {index + 1}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-400">
                  {item.category}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-400">
                  {new Date(item.create_at).toLocaleDateString()}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center justify-center text-xl">
                  {/* Di sini Anda bisa menambahkan tombol Edit jika perlu */}
                  {/* <Link to={`/admin/edit/${item.id_news}`} className="text-blue-500 hover:text-blue-700 transition mr-4"><FaEdit /></Link> */}
                  <button
                    onClick={() => handleDelete(item.id_news)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                    aria-label="Delete News"
                  >
                    <FaRegTrashCan />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default News;
