import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";

// Mengambil API key dari env
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const LayoutHomeNews = () => {
  const [mainArticles, setMainArticles] = useState([]);
  const [breakingArticles, setBreakingArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi async untuk mengambil semua artikel dari API
    const fetchAllArticles = async () => {
      try {
        // Mengambil 3 jenis artikel secara paralel
        const [mainRes, breakingRes, latestRes] = await Promise.all([
          fetch(`https://newsapi.org/v2/everything?q=news&apiKey=${API_KEY}`),
          fetch(`https://newsapi.org/v2/everything?q=breaking%20news&apiKey=${API_KEY}`),
          fetch(
            `https://newsapi.org/v2/everything?q=latest&sortBy=publishedAt&apiKey=${API_KEY}`
          ),
        ]);

        // Parsing hasil response ke bentuk JSON
        const [mainData, breakingData, latestData] = await Promise.all([
          mainRes.json(),
          breakingRes.json(),
          latestRes.json(),
        ]);

        // Set data ke state jika response sukses
        if (mainData.status === "ok") setMainArticles(mainData.articles);
        if (breakingData.status === "ok")
          setBreakingArticles(breakingData.articles.slice(0, 4)); // Menampilkan 4 berita breaking news
        if (latestData.status === "ok")
          setLatestArticles(latestData.articles.slice(0, 4)); // Menampilkan 4 berita terbaru
      } catch (err) {
        setError("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    // Panggil fungsi untuk fetch artikel
    fetchAllArticles();
  }, []);

  // Tampilkan pesan loading jika data masih loading
  if (loading)
    return (
      <Loading />
    );

  // Tampilkan pesan error jika ada kesalahan saat fetch data
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 dark:text-red-400">
        {error}
      </p>
    );

  // Ambil artikel utama (pertama) dan sisanya untuk tampilan kecil
  const mainArticle = mainArticles[0];
  const smallArticles = mainArticles.slice(1, 5);

  // Fungsi untuk menangani klik artikel, arahkan ke halaman detail
  const handleClickArticle = (article) => {
    navigate(`/news/${encodeURIComponent(article.url)}`, {
      state: { article },
    });
  };

  // Fungsi untuk render grid artikel berdasarkan daftar artikel dan judul section
  const renderArticleGrid = (articles, title) => (
    <div>
      <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {articles.map((article, index) => (
          <div
            key={`${article.url}-${index}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col"
            onClick={() => handleClickArticle(article)}
          >
            <img
              src={
                article.urlToImage ||
                "https://via.placeholder.com/300x150?text=No+Image"
              }
              alt={article.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 my-2">
                {new Date(article.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 flex-grow">
                {article.description
                  ? article.description
                  : "No Description"}
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-2 inline-block">
                Read More...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tampilan utama komponen
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 space-y-12 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-8">
        {mainArticle && (
          <div
            className="lg:w-2/3 group bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-300"
            onClick={() => handleClickArticle(mainArticle)}
          >
            <div className="overflow-hidden">
                <img
                    src={
                    mainArticle.urlToImage ||
                    "https://via.placeholder.com/800x450?text=No+Image"
                    }
                    alt={mainArticle.title}
                    className="w-full h-96 object-cover transform transition-transform duration-500 ease-in-out"
                />
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">
                {mainArticle.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {new Date(mainArticle.publishedAt).toLocaleString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-base">
                {mainArticle.description || "No Description"}
              </p>
              <p className="text-green-600 dark:text-green-400 mt-4 font-bold">
                Read More...
              </p>
            </div>
          </div>
        )}

        {/* Artikel kecil di samping artikel utama */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {smallArticles.map((article, index) => (
            <div
              key={`${article.url}-${index}`}
              className="group flex gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => handleClickArticle(article)}
            >
              <img
                src={
                  article.urlToImage ||
                  "https://via.placeholder.com/150?text=No+Image"
                }
                alt={article.title}
                className="w-28 h-28 object-cover flex-shrink-0"
              />
              <div className="p-3 flex flex-col justify-center">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 text-sm">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(article.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* [PERBAIKAN] Menambahkan garis pemisah antar seksi */}
      <hr className="border-gray-200 dark:border-gray-700 my-6"/>

      {/* Tampilkan breaking news dan latest news jika ada */}
      {breakingArticles.length > 0 &&
        renderArticleGrid(breakingArticles, "Breaking News")}
      
      <hr className="border-gray-200 dark:border-gray-700 my-6"/>
      
      {latestArticles.length > 0 &&
        renderArticleGrid(latestArticles, "Latest News")}
    </div>
  );
};

export default LayoutHomeNews;