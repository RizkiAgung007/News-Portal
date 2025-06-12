import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaSun, FaMoon, FaEye } from "react-icons/fa"; 
import { toast } from "react-toastify";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // State untuk menangani pergantian theme
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

  // Menangani toggle untuk theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Mengamil API melalui endpoint pada databade 
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

  // Menangani tombol untuk delete by id
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
      toast.success("News has deleted")
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = async (id) => {
    navigate(`/admin/edit/${id}`)
  }

  const handleView = async (id) => {
    navigate(`/admin/view/${id}`)
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          News Management
        </h1>

        {/* Tombol theme */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Total News:{" "}
        <strong className="text-green-600 dark:text-green-400">
          {news.length}
        </strong>
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[600px] table-auto text-left">
          <thead className="bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-300">
            <tr>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 font-medium">
                No
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 font-medium">
                News
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 font-medium">
                Category
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 font-medium">
                Created At
              </th>
              <th className="p-3 border-b border-gray-300 dark:border-gray-600 font-medium">
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
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {index + 1}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 w-96 font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400">
                  {item.category}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400">
                  {new Date(item.create_at).toLocaleDateString()}
                </td>
                <td className="p-3 border-b border-gray-200 dark:border-gray-700 justify-center text-xl space-x-4">
                  <button
                    onClick={() => handleDelete(item.id_news)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 cursor-pointer transition"
                  >
                    <FaRegTrashCan />
                  </button>
                  <button
                    onClick={() => handleEdit(item.id_news)}
                    className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-500 cursor-pointer transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleView(item.id_news)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 cursor-pointer transition"
                  >
                    <FaEye />
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
