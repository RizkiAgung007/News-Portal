import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

const Comment = ({ articleUrl, token, username }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // Menyimpan URL artikel yang akan digunakan untuk mengambil atau mengirim komentar
  const newsUrl = articleUrl;

  // Fungsi untuk mengambil daftar komentar berdasarkan URL artikel
  const fetchComments = () => {
    fetch(
      `${API_BASE_URL}/api/comments?news_url=${encodeURIComponent(newsUrl)}`
    )
      .then((res) => res.json())
      .then((data) => setComments(data)) // Menyimpan hasil komentar ke dalam state
      .catch(() => setError("Gagal mengambil komentar")); // Menangani error saat fetch gagal
  };

  // Mengambil komentar setiap kali URL artikel berubah
  useEffect(() => {
    fetchComments();
  }, [newsUrl]);

  // Fungsi untuk pengiriman komentar
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi agar komentar tidak boleh kosong
    if (!content.trim()) return alert("Komentar tidak boleh kosong");

    setLoading(true);
    setError(null);

    try {
      // Mengirim komentar ke endpoint API
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Menggunakan token autentikasi
        },
        body: JSON.stringify({ content, news_url: newsUrl }), // Data yang dikirim ke server
      });

      // Jika response gagal, lempar error
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengirim komentar");
      }

      // Reset form dan ambil ulang komentar setelah berhasil dikirim
      setContent("");
      fetchComments();
    } catch (err) {
      // Menangani error saat pengiriman gagal
      setError(err.message);
    } finally {
      // Set status loading ke false setelah proses selesai
      setLoading(false);
    }
  };

  // Jika user belum login(tidak ada token), menampilkan pesan agar login terlebih dahulu
  if (!token) {
    return (
      <div className="mt-8 p-4 border rounded bg-yellow-50 text-yellow-800">
        Kamu harus <strong>login</strong> untuk mengirim komentar.
      </div>
    );
  }

  // Tampilan utama komponen komentar
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Komentar</h2>

      {/* Form untuk input komentar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full border rounded p-2 mb-2 dark:text-gray-200"
          rows={3}
          placeholder="Tulis komentar kamu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Komentar"}
        </button>
      </form>

      {/* Menampilkan pesan error jika ada */}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Daftar komentar yang sudah ada */}
      <div>
        {comments.length === 0 && <p>Belum ada komentar.</p>}
        {comments.map(({ id_comment, username, content, create_at }) => (
          <div key={id_comment} className="border-b pb-4 border-gray-200">
            <div className="flex items-center space-x-3 py-4 mb-1">
              {/* Avatar huruf pertama username */}
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold dark:text-gray-200">{username}</span>
              <span className="text-gray-500 text-sm">
                {/* Tanggal komentar ditampilkan dalam format lokal */}
                {new Date(create_at).toLocaleString()}
              </span>
            </div>
            {/* Isi komentar */}
            <p className="dark:text-gray-200">{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
