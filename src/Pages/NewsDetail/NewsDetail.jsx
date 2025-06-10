import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Comment from "../../components/Comments/Comment";
import { API_BASE_URL } from "../../config";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const NewsDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { article } = location.state || {};

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [userLikeStatus, setUserLikeStatus] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUserData(data))
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!article || !token) {
      setLoadingLike(false);
      return;
    }
    const articleIdentifier = article.url;

    setLoadingLike(true);
    fetch(
      `${API_BASE_URL}/api/likes?id_news=${encodeURIComponent(
        articleIdentifier
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setUserLikeStatus(data.userLikeStatus);
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
      })
      .catch(console.error)
      .finally(() => setLoadingLike(false));
  }, [article, token]);

  const handleLikeDislike = async (action) => {
    if (!token) return alert("Silakan login terlebih dahulu.");
    setLoadingLike(true);

    const articleIdentifier = article.url;

    try {
      await fetch(`${API_BASE_URL}/api/news/sync-external`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: article.url,
          title: article.title,
          description: article.description,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          category: article.source?.name || "Eksternal",
        }),
      });

      const isTogglingOff = userLikeStatus === action;
      const method = isTogglingOff ? "DELETE" : "POST";
      let body = { id_news: articleIdentifier };
      if (method === "POST") body.value = action;

      const res = await fetch(`${API_BASE_URL}/api/likes`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal memproses permintaan");

      const statusRes = await fetch(
        `${API_BASE_URL}/api/likes?id_news=${encodeURIComponent(
          articleIdentifier
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newData = await statusRes.json();

      setUserLikeStatus(newData.userLikeStatus);
      setLikeCount(newData.likeCount);
      setDislikeCount(newData.dislikeCount);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingLike(false);
    }
  };
  
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center bg-gray-50 dark:bg-gray-900 min-h-screen">
        <p className="text-xl text-gray-800 dark:text-gray-100">
          Data berita tidak tersedia.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Ini bisa terjadi jika Anda mengakses halaman ini secara langsung.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="pt-6 px-32 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {article.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        {new Date(article.publishedAt).toLocaleString("id-ID")}
      </p>
      <img
        src={
          article.urlToImage ||
          "https://via.placeholder.com/800x450?text=No+Image"
        }
        alt={article.title}
        className="w-1/2 h-auto mb-6 rounded-lg shadow-md"
      />

      <div className="prose max-w-none mb-4 dark:prose-invert">
        {article.description || "Tidak ada konten."}
      </div>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
      </a>

      <div className="flex items-center space-x-6 my-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <button
          onClick={() => handleLikeDislike(true)}
          disabled={loadingLike || !token}
          className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors duration-200 ${
            userLikeStatus === true
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          } hover:bg-green-600 dark:hover:bg-green-600 disabled:opacity-50`}
        >
          <FaThumbsUp />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => handleLikeDislike(false)}
          disabled={loadingLike || !token}
          className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors duration-200 ${
            userLikeStatus === false
              ? "bg-red-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          } hover:bg-red-600 dark:hover:bg-red-600 disabled:opacity-50`}
        >
          <FaThumbsDown />
          <span>{dislikeCount}</span>
        </button>
      </div>
      <Comment articleUrl={article.url} token={token} userData={userData} />
    </div>
  );
};

export default NewsDetail;
