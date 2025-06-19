import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import Loading from "../../components/Loading/Loading";
import NotFound from "../../components/NotFound/NotFound"

const CategoryPageNews = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/news?category=${encodeURIComponent(category)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load news");
        return res.json();
      })
      .then((data) => {
        setNewsList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p><Loading /> "{category}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }

  if (newsList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p><NotFound /> "{category}".</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Berita kategori: {category}</h1>
      <ul className="space-y-4">
        {newsList.map((news) => (
          <li
            key={news.id_news || news.id || news.url}
            className="border p-4 rounded hover:shadow cursor-pointer"
            onClick={() => navigate(`/news/${news.id_news || news.id}`)}
          >
            <h2 className="text-xl font-semibold">{news.title}</h2>
            <p className="text-gray-600 text-sm">
              {news.create_at
                ? new Date(news.create_at).toLocaleString()
                : news.publishedAt
                ? new Date(news.publishedAt).toLocaleString()
                : "Date no available"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPageNews;
