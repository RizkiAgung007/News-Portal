import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Comment from "../../components/Comments/Comment";
import { API_BASE_URL } from "../../config";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const NewsDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil artikel dari state, jika tidak ada, fetch ulang (logika dari SearchDetailPage)
  const { article: initialArticle } = location.state || {};
  const [article, setArticle] = useState(initialArticle);

  // Anda mungkin perlu menambahkan useParams jika URL memiliki ID untuk fetch
  // const { newsId } = useParams();

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [userLikeStatus, setUserLikeStatus] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedIdUsers = localStorage.getItem("id_users");

    if (storedToken && storedUsername && storedRole && storedIdUsers) {
      setToken(storedToken);
      setUserData({
        username: storedUsername,
        role: storedRole,
        id_users: Number(storedIdUsers),
      });
    } else {
      setToken(null);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) =>
        setUserData((prevData) => ({
          ...prevData,
          ...data,
          id_users: prevData
            ? prevData.id_users
            : Number(localStorage.getItem("id_users")),
        }))
      )
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!article) return;

    if (!token) {
      setLoadingLike(false);
      return;
    }

    // Gunakan identifier yang konsisten
    const articleIdentifier = article.url || article.id_news;
    if (!articleIdentifier) return;

    setLoadingLike(true);
    fetch(
      `${API_BASE_URL}/api/likes?id_news=${encodeURIComponent(
        articleIdentifier
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Failed to load like status")
      )
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

    const articleIdentifier = article.url || article.id_news;
    if (!articleIdentifier) {
      setLoadingLike(false);
      return alert("ID berita tidak ditemukan.");
    }

    // --> [PERBAIKAN LOGIKA KATEGORI] <--
    const categoryNameToSync =
      article.category || article.source?.name || "Eksternal";

    try {
      // Hanya sync jika ini adalah berita eksternal (memiliki 'url' tapi tidak 'id_news')
      if (article.url && !article.id_news) {
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
            category: categoryNameToSync,
          }),
        });
      }

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
      if (!res.ok) throw new Error("Failet to process request");

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
          Data Berita Tidak Tersedia.
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

  // --> [PERBAIKAN UTAMA] <--
  // Logika baru untuk mendapatkan nama kategori dari sumber manapun
  const categoryName =
    article?.category || article?.source?.name || "Eksternal";

  return (
    <div className="pt-6 md:px-32 px-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {article.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        {new Date(article.publishedAt || article.create_at).toLocaleString(
          "id-ID"
        )}
      </p>
      <img
        src={
          article.urlToImage ||
          (article.url_photo
            ? `${API_BASE_URL}${article.url_photo}`
            : "https://via.placeholder.com/800x450?text=No+Image")
        }
        alt={article.title}
        className="md:w-1/2 w-full h-auto mb-6 rounded-lg shadow-md"
      />

      <div className="prose md:w-[1000px] text-lg text-justify mb-4 dark:prose-invert dark:text-gray-200">
        {article.description || article.content || "Tidak ada konten."}
      </div>

      {categoryName && (
        <button
          onClick={() =>
            navigate(`/category/${encodeURIComponent(categoryName)}`)
          }
          className="text-sm mb-6 mt-4 font-semibold"
        >
          <span className="dark:text-gray-200">Category:</span>{" "}
          <span className="text-green-600 cursor-pointer dark:text-green-400 hover:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-600 transition-all mx-2 p-2 rounded-full">
            {categoryName}
          </span>
        </button>
      )}

      <div className="flex items-center space-x-6 my-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <button
          onClick={() => handleLikeDislike(true)}
          disabled={loadingLike || !token}
          className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded transition-colors duration-200 ${
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
          className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded transition-colors duration-200 ${
            userLikeStatus === false
              ? "bg-red-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          } hover:bg-red-600 dark:hover:bg-red-600 disabled:opacity-50`}
        >
          <FaThumbsDown />
          <span>{dislikeCount}</span>
        </button>
      </div>
      <Comment
        articleUrl={article.url || article.id_news}
        token={token}
        userData={userData}
      />
    </div>
  );
};

export default NewsDetail;
