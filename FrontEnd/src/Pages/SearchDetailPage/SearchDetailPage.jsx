import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Comment from "../../components/Comments/Comment";
import { API_BASE_URL } from "../../config";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import Loading from "../../components/Loading/Loading";

const SearchDetail = () => {
  const location = useLocation();
  const { newsId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(location.state?.article || null);
  const [loading, setLoading] = useState(!article);
  const [error, setError] = useState(null);

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
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Gagal autentikasi")
      )
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
    if (article) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/news/${newsId}`)
      .then((res) => {
        if (!res.ok) throw new Error("News Not Found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [newsId, article]);

  useEffect(() => {
    if (!article || !token) {
      setLoadingLike(false);
      return;
    }
    const articleIdentifier = article.url || article.id_news || newsId;
    if (!articleIdentifier) return;
    setLoadingLike(true);
    fetch(
      `${API_BASE_URL}/api/likes?id_news=${encodeURIComponent(
        articleIdentifier
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch like status");
        return res.json();
      })
      .then((data) => {
        setUserLikeStatus(data.userLikeStatus);
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
      })
      .catch(console.error)
      .finally(() => setLoadingLike(false));
  }, [article, token, newsId]);

  const handleLikeDislike = async (action) => {
    if (!token) {
      alert("Please log in first to give a like or dislike.");
      return;
    }
    setLoadingLike(true);
    const articleIdentifier = article.url || article.id_news || newsId;
    const isTogglingOff = userLikeStatus === action;
    const method = isTogglingOff ? "DELETE" : "POST";

    let body = { id_news: articleIdentifier };
    if (method === "POST" || method === "DELETE") {
      body.value = action;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/likes`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memproses permintaan");
      }

      const statusRes = await fetch(
        `${API_BASE_URL}/api/likes?id_news=${encodeURIComponent(
          articleIdentifier
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }
  if (!article)
    return (
      <div className="p-10 text-center text-gray-600 dark:text-gray-400">
        News data is not available.
      </div>
    );

  return (
    <div className="pt-6 md:px-32 px-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {article.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        {article.create_at
          ? new Date(article.create_at).toLocaleString("id-ID")
          : article.publishedAt
          ? new Date(article.publishedAt).toLocaleString("id-ID")
          : "Date not available"}
      </p>
      <img
        src={
          article.url_photo
            ? `${API_BASE_URL}${article.url_photo}`
            : article.urlToImage ||
              "https://via.placeholder.com/800x450?text=No+Image"
        }
        alt={article.title}
        className="md:w-1/2 w-full h-auto mb-6 rounded-lg shadow-md"
      />

      <div className="prose md:w-[1000px] text-lg max-w-none mb-4 dark:prose-invert dark:text-gray-200">
        {article.content
          ? article.content.replace(/\[\+\d+ chars\]$/, "")
          : article.description || "Tidak ada konten"}
      </div>

      {article.category && (
        <button
          onClick={() =>
            navigate(`/category/${encodeURIComponent(article.category)}`)
          }
          className="text-sm mb-6 mt-4 font-semibold"
        >
          <span className="dark:text-gray-200">Category:</span>{" "}
          <span className="text-green-600 cursor-pointer dark:text-green-400 hover:text-gray-200 bg-gray-200 hover:bg-gray-600 transition-all mx-2 p-2 rounded-full">
            {article.category}
          </span>
        </button>
      )}

      <div className="flex items-center space-x-6 mb-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <button
          disabled={loadingLike || !token}
          onClick={() => handleLikeDislike(true)}
          className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded transition-colors duration-200 ${
            userLikeStatus === true
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          } hover:bg-green-600 dark:hover:bg-green-600 disabled:opacity-50`}
        >
          <FaThumbsUp />
          <span>{likeCount}</span>
        </button>
        <button
          disabled={loadingLike || !token}
          onClick={() => handleLikeDislike(false)}
          className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded transition-colors duration-200 ${
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
        articleUrl={article.url || article.id_news || newsId}
        token={token}
        userData={userData}
      />
    </div>
  );
};

export default SearchDetail;
