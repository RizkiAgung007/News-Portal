import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import PageNotFound from "../../components/NotFound/NotFound";
import Loading from "../../components/Loading/Loading";
import { NEWS_API_KEY, NEWSDATA_API_KEY, GNEWS_API_KEY } from "../../api";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAllArticles = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [
        fetch(`${API_BASE_URL}/api/news/category/${categoryName}`).then(res => res.ok ? res.json() : []),
        fetch(`https://newsapi.org/v2/top-headlines?category=${categoryName}&apiKey=${NEWS_API_KEY}`).then(res => res.ok ? res.json() : null),
        fetch(`https://newsdata.io/api/1/latest?country=id&apikey=${NEWSDATA_API_KEY}&category=${categoryName}`).then(res => res.ok ? res.json() : null),
        fetch(`https://gnews.io/api/v4/top-headlines?apikey=${GNEWS_API_KEY}&lang=id&category=${categoryName}`).then(res => res.ok ? res.json() : null)
      ];

      const [dbData, newsApiData, newsDataIoData, gnewsData] = await Promise.all(promises);

      const dbArticles = Array.isArray(dbData)
        ? dbData.map((item) => ({
            ...item,
            url: item.id_news,
            source: "db",
          }))
        : [];

      const apiArticles = newsApiData && newsApiData.status === "ok"
        ? newsApiData.articles.map((article) => ({ 
            ...article,
            category: categoryName, 
            source: "api" 
          }))
        : [];

      const apiResults = newsDataIoData && newsDataIoData.status === "success"
        ? newsDataIoData.results.map((result) => ({
            title: result.title,
            description: result.description,
            url: result.link,
            urlToImage: result.image_url,
            publishedAt: result.pubDate,
            category: categoryName,
            source: "api",
          }))
        : [];
      
      const gnewsArticles = gnewsData && gnewsData.articles
        ? gnewsData.articles.map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.publishedAt,
            source: { name: article.source.name },
            category: categoryName,
          }))
        : [];

      const combined = [...dbArticles, ...apiArticles, ...apiResults, ...gnewsArticles];
      const uniqueArticles = Array.from(new Map(combined.map(item => [item.title, item])).values());
      
      setArticles(uniqueArticles);

    } catch (err) {
      console.error("Failed to retrieve data:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchAllArticles();
  }, [fetchAllArticles]);

  const handleArticleClick = (article) => {
    const detailPage = article.source === "db" ? 'searchdetail' : 'newsdetail';
    const identifier = article.source === "db" ? article.id_news : encodeURIComponent(article.url);
    
    navigate(`/${detailPage}/${identifier}`, { state: { article } });
  };

  return (
    <div className="pt-4 md:px-32 px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 capitalize text-gray-900 dark:text-gray-100">
        News <span className="text-green-600 dark:text-green-400">"{categoryName}"</span>
      </h2>
      {loading ? (
        <Loading />
      ) : articles.length === 0 ? (
        <PageNotFound />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <div
              key={article.url || article.id_news || i}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleArticleClick(article)}
            >

              <img
                src={
                  article.url_photo
                    ? `${API_BASE_URL}${article.url_photo}`
                    : article.urlToImage || "https://placehold.co/400x200?text=No+Image"
                }
                alt={article.title}
                className="w-full h-40 object-cover rounded"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200?text=Image+Error" }}
              />
              <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(article.publishedAt || article.create_at).toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
                {article.description || "No Description"}
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-2 inline-block font-medium">
                Read More...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;