import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // --- Logika Anda (Tidak Diubah Sama Sekali) ---
  useEffect(() => {
    if (title.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/news/search?title=${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
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
  // --- End of Logika Anda ---

  return (
    // [PERBAIKAN] Menambahkan kelas dark: pada div pembungkus utama
    <div className="pt-4 px-32 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Hasil Pencarian:{" "}
        <span className="text-green-600 dark:text-green-400">"{title}"</span>
      </h1>

      {/* [PERBAIKAN] Menambahkan kelas dark: pada teks status */}
      {loading && (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      )}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          Tidak ada hasil ditemukan.
        </p>
      )}

      {/* [PERBAIKAN] Menambahkan kelas dark: pada kartu berita */}
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
            <p className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">
              Baca Selengkapnya
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
