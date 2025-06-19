import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import NotFound from "../../components/NotFound/NotFound";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (title.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/news/search?title=${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to retrieve data");
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [title]);

  return (
    <div className="pt-4 md:px-32 px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Search Result:{" "}
        <span className="text-green-600 dark:text-green-400">"{title}"</span>
      </h1>

      {loading && (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      )}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <div className="w-full flex flex-col items-center justify-center text-center py-16">
          <div className="w-1/2 items-center justify-center flex dark:bg-gray-600 p-4 rounded-full">
            <NotFound />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {results.map((news) => (
          <div
            key={news.id_news}
            onClick={() =>
              navigate(`/searchdetail/${news.id_news}`, {
                state: { article: news },
              })
            }
            className="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:bg-gray-700/50 transition flex flex-col"
          >
            <img
              src={`${API_BASE_URL}${news.url_photo}`}
              alt={news.title}
              className="w-full h-48 object-cover mb-2 rounded"
            />
            <h2 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">
              {news.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {news.create_at
                ? new Date(news.create_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Tanggal tidak tersedia"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 flex-grow">
              {news.description}
            </p>
            <p className="text-green-600 dark:text-green-400 hover:underline text-sm mt-2 inline-block">
              Read More...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
