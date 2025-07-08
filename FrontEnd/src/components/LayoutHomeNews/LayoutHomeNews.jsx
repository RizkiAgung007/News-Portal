import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { GNEWS_API_KEY, NEWSDATA_API_KEY } from "../../api"; 

// Fungsi untuk mendefaultkan format artikel dari sumber yang berbeda
const standardizeArticle = (article, sourceApi) => {
  if (sourceApi === 'gnews') {
    return {
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.image,
      publishedAt: article.publishedAt,
      sourceName: article.source.name,
    };
  }
  
  if (sourceApi === 'newsdata') {
    return {
      title: article.title,
      description: article.description,
      url: article.link, 
      imageUrl: article.image_url, 
      publishedAt: article.pubDate, 
      sourceName: article.category,
    };
  }
  
  return null; 
};

const LayoutHomeNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNews = async () => {
      if (!GNEWS_API_KEY || !NEWSDATA_API_KEY) {
        setError("Satu atau lebih API Key tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        // Memanggil kedua API secara bersamaan
        const [gnewsRes, newsdataRes] = await Promise.all([
          fetch(`https://gnews.io/api/v4/top-headlines?country=id&lang=id&apikey=${GNEWS_API_KEY}`),
          fetch(`https://newsdata.io/api/1/latest?country=id&apikey=${NEWSDATA_API_KEY}`)
        ]);

        const gnewsData = await gnewsRes.json();
        const newsdataData = await newsdataRes.json();

        // Olah dan standarkan data dari GNews
        const gnewsArticles = gnewsData.articles
          ? gnewsData.articles.map(article => standardizeArticle(article, 'gnews'))
          : [];

        // Olah dan standarkan data dari NewsData.io
        const newsdataArticles = newsdataData.results
          ? newsdataData.results.map(article => standardizeArticle(article, 'newsdata'))
          : [];
        
        // Menggabungkan kedua hasil
        const combinedArticles = [...gnewsArticles, ...newsdataArticles].filter(Boolean); 
        
        // Hapus duplikat berdasarkan URL
        const uniqueArticles = Array.from(new Map(combinedArticles.map(item => [item['url'], item])).values());

        // Acak urutan berita agar lebih dinamis
        uniqueArticles.sort(() => Math.random() - 0.5);

        setArticles(uniqueArticles);

      } catch (err) {
        setError("Failed to load news from one of the sources.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  if (loading) return <Loading loading={loading} />;
  
  if (error) return (
    <p className="text-center mt-10 text-red-600 dark:text-red-400">
      Error: {error}
    </p>
  );

  const mainArticle = articles[0];
  const smallArticles = articles.slice(1, 5);
  const breakingArticles = articles.slice(5, 9);
  const latestArticles = articles.slice(10, 14);

  const handleClickArticle = (article) => {
    navigate(`/news/${encodeURIComponent(article.url)}`, {
      state: { article },
    });
  };

  const renderArticleGrid = (articlesToRender, title) => (
    <div>
      <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {articlesToRender.map((article, index) => (
          <div
            key={`${article.url}-${index}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col"
            onClick={() => handleClickArticle(article)}
          >
            <img
              src={article.imageUrl || "https://via.placeholder.com/300x150?text=No+Image"}
              alt={article.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 my-2">
                {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 flex-grow">
                {article.description || "No Description"}
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
                  mainArticle.imageUrl ||
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
                {new Date(mainArticle.publishedAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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

        <div className="lg:w-1/3 flex flex-col gap-6">
          {smallArticles.map((article, index) => (
            <div
              key={`${article.url}-${index}`}
              className="group flex gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => handleClickArticle(article)}
            >
              <img
                src={
                  article.imageUrl ||
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
                  {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 my-6" />

      {breakingArticles.length > 0 &&
        renderArticleGrid(breakingArticles, "Breaking News")}

      <hr className="border-gray-200 dark:border-gray-700 my-6" />

      {latestArticles.length > 0 &&
        renderArticleGrid(latestArticles, "Latest News")}
        
    </div>
  );
};

export default LayoutHomeNews;