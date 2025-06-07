import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_KEY = import.meta.env.VITE_NEWS_API_KEY

const LayoutHomeNews = () => {
  const [mainArticles, setMainArticles] = useState([])
  const [breakingArticles, setBreakingArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // --- useEffect dan logika fetch Anda (TIDAK DIUBAH SAMA SEKALI) ---
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const [mainRes, breakingRes, latestRes] = await Promise.all([
          fetch(`https://newsapi.org/v2/everything?q=news&apiKey=${API_KEY}`),
          fetch(`https://newsapi.org/v2/everything?q=breaking%20news&apiKey=${API_KEY}`),
          fetch(`https://newsapi.org/v2/everything?q=latest&sortBy=publishedAt&apiKey=${API_KEY}`)
        ])

        const [mainData, breakingData, latestData] = await Promise.all([
          mainRes.json(),
          breakingRes.json(),
          latestRes.json()
        ])

        if (mainData.status === 'ok') setMainArticles(mainData.articles)
        if (breakingData.status === 'ok') setBreakingArticles(breakingData.articles.slice(0, 4))
        if (latestData.status === 'ok') setLatestArticles(latestData.articles.slice(0, 4))
      } catch (err) {
        setError('Gagal memuat berita.')
      } finally {
        setLoading(false)
      }
    }

    fetchAllArticles()
  }, [])
  
  // Tampilan loading dan error Anda (HANYA DITAMBAHKAN KELAS DARK)
  if (loading) return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">Memuat berita...</p>
  if (error) return <p className="text-center mt-10 text-red-600 dark:text-red-400">{error}</p>

  const mainArticle = mainArticles[0]
  const smallArticles = mainArticles.slice(1, 5)

  // Fungsi handleClickArticle Anda (TIDAK DIUBAH SAMA SEKALI)
  const handleClickArticle = (article) => {
    navigate(`/news/${encodeURIComponent(article.url)}`, { state: { article } })
  }

  // Fungsi renderArticleGrid Anda (HANYA DITAMBAHKAN KELAS DARK)
  const renderArticleGrid = (articles, title) => (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {articles.map((article, index) => (
          <div
            key={`${article.url}-${index}`}
            className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden cursor-pointer"
            onClick={() => handleClickArticle(article)}
          >
            <img
              src={article.urlToImage || 'https://via.placeholder.com/300x150?text=No+Image'}
              alt={article.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{article.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {article.description ? article.description.slice(0, 80) + '...' : 'Tidak ada deskripsi'}
              </p>
              <p className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">Baca Selengkapnya</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    // div pembungkus utama Anda (HANYA DITAMBAHKAN KELAS DARK)
    <div className="px-32 pt-12 space-y-10 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-8">
        {mainArticle && (
          <div
            className="lg:w-2/3 bg-white dark:bg-gray-800 rounded shadow overflow-hidden cursor-pointer"
            onClick={() => handleClickArticle(mainArticle)}
          >
            <img
              src={mainArticle.urlToImage || 'https://via.placeholder.com/800x450?text=No+Image'}
              alt={mainArticle.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{mainArticle.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {new Date(mainArticle.publishedAt).toLocaleString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">{mainArticle.description || 'Tidak ada deskripsi'}</p>
              <p className="text-blue-600 dark:text-blue-400 mt-4 underline">Baca Selengkapnya</p>
            </div>
          </div>
        )}

        <div className="lg:w-1/3 flex flex-col gap-6">
          {smallArticles.map((article, index) => (
            <div
              key={`${article.url}-${index}`}
              className="flex gap-4 bg-white dark:bg-gray-800 rounded shadow overflow-hidden cursor-pointer"
              onClick={() => handleClickArticle(article)}
            >
              <img
                src={article.urlToImage || 'https://via.placeholder.com/150?text=No+Image'}
                alt={article.title}
                className="w-28 h-28 object-cover flex-shrink-0"
              />
              <div className="p-3 flex flex-col justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{article.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</p>
                <p className="text-blue-600 dark:text-blue-400 underline text-sm mt-1">Baca</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {breakingArticles.length > 0 && renderArticleGrid(breakingArticles, 'Breaking News')}
      {latestArticles.length > 0 && renderArticleGrid(latestArticles, 'Latest News')}
    </div>
  )
}

export default LayoutHomeNews