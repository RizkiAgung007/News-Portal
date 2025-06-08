import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

const Comment = ({ articleUrl, token, username }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newsUrl = articleUrl;

  // Ambil komentar dari backend
  const fetchComments = () => {
    fetch(
      `${API_BASE_URL}/api/comments?news_url=${encodeURIComponent(newsUrl)}`
    )
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setError("Gagal mengambil komentar"));
  };

  useEffect(() => {
    fetchComments();
  }, [newsUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Komentar tidak boleh kosong");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, news_url: newsUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengirim komentar");
      }

      setContent("");
      fetchComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mt-8 p-4 border rounded bg-yellow-50 text-yellow-800">
        Kamu harus <strong>login</strong> untuk mengirim komentar.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Komentar</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder="Tulis komentar kamu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Komentar"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div>
        {comments.length === 0 && <p>Belum ada komentar.</p>}
        {comments.map(({ id_comment, username, content, create_at }) => (
          <div key={id_comment} className="border-b pb-4">
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold">{username}</span>
              <span className="text-gray-500 text-sm">
                {new Date(create_at).toLocaleString()}
              </span>
            </div>
            <p>{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
