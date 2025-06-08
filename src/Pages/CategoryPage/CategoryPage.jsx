import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGIKA ANDA, TIDAK DIUBAH SAMA SEKALI ---
  useEffect(() => {
    const fetchAllArticles = async () => {
      setLoading(true);

      try {
        const dbRes = await fetch(
          `${API_BASE_URL}/api/news/category/${categoryName}`
        );
        const dbData = dbRes.ok ? await dbRes.json() : [];

        const dbArticles = Array.isArray(dbData)
          ? dbData.map((item) => ({
              id_news: item.id_news,
              title: item.title,
              description: item.description,
              url_photo: item.url_photo,
              create_at: item.create_at,
              source: "db",
              category: item.category,
            }))
          : [];

        const apiRes = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&category=${categoryName}&apiKey=${API_KEY}`
        );
        const apiData = await apiRes.json();

        const apiArticles =
          apiData.status === "ok"
            ? apiData.articles.map((article) => ({
                ...article,
                source: "api",
              }))
            : [];

        const combined = [...dbArticles, ...apiArticles];
        setArticles(combined);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllArticles();
  }, [categoryName]);

  const handleArticleClick = (article) => {
    if (article.source === "api") {
      navigate(`/newsdetail/${encodeURIComponent(article.url)}`, {
        state: { article },
      });
    } else {
      navigate(`/searchdetail/${article.id_news}`, { state: { article } });
    }
  };
  // --- END OF LOGIKA ANDA ---

  return (
    // [PERBAIKAN] Menambahkan kelas dark: pada div pembungkus utama
    <div className="pt-4 px-32 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 capitalize text-gray-900 dark:text-gray-100">
        Berita {categoryName}
      </h2>

      {/* [PERBAIKAN] Menambahkan kelas dark: pada teks status */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Memuat berita...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Berita tidak ditemukan.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            // [PERBAIKAN] Menambahkan kelas dark: pada setiap kartu
            <div
              key={article.url || article.id_news || i}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleArticleClick(article)}
            >
              <img
                src={
                  article.source === "db"
                    ? article.url_photo
                      ? `${API_BASE_URL}${article.url_photo}`
                      : "https://via.placeholder.com/400x200?text=No+Image"
                    : article.urlToImage ||
                      "https://via.placeholder.com/400x200?text=No+Image"
                }
                alt={article.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100">
                {article.title}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {article.create_at
                  ? new Date(article.create_at).toLocaleString("id-ID")
                  : article.publishedAt
                  ? new Date(article.publishedAt).toLocaleString("id-ID")
                  : ""}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
                {article.description
                  ? article.description.slice(0, 120) + "..."
                  : "Tidak ada deskripsi"}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block underline font-medium">
                Baca Selengkapnya
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
