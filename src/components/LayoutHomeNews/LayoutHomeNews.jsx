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

  if (loading) return <p className="text-center mt-10">Memuat berita...</p>
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>

  const mainArticle = mainArticles[0]
  const smallArticles = mainArticles.slice(1, 5)

  const handleClickArticle = (article) => {
    navigate(`/news/${encodeURIComponent(article.url)}`, { state: { article } })
  }

  const renderArticleGrid = (articles, title) => (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {articles.map((article) => (
          <div
            key={article.url}
            className="bg-white rounded shadow overflow-hidden cursor-pointer"
            onClick={() => handleClickArticle(article)}
          >
            <img
              src={article.urlToImage || 'https://via.placeholder.com/300x150?text=No+Image'}
              alt={article.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold">{article.title}</h4>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700">
                {article.description ? article.description.slice(0, 80) + '...' : 'Tidak ada deskripsi'}
              </p>
              <p className="text-blue-600 hover:underline text-sm mt-2 inline-block">Baca Selengkapnya</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Baris atas: besar kiri, kecil kanan */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Berita besar kiri */}
        {mainArticle && (
          <div
            className="lg:w-2/3 bg-white rounded shadow overflow-hidden cursor-pointer"
            onClick={() => handleClickArticle(mainArticle)}
          >
            <img
              src={mainArticle.urlToImage || 'https://via.placeholder.com/800x450?text=No+Image'}
              alt={mainArticle.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-3">{mainArticle.title}</h2>
              <p className="text-gray-600 text-sm mb-3">
                {new Date(mainArticle.publishedAt).toLocaleString()}
              </p>
              <p className="text-gray-700">{mainArticle.description || 'Tidak ada deskripsi'}</p>
              <p className="text-blue-600 mt-4 underline">Baca Selengkapnya</p>
            </div>
          </div>
        )}

        {/* Berita kecil kanan */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {smallArticles.map((article) => (
            <div
              key={article.url}
              className="flex gap-4 bg-white rounded shadow overflow-hidden cursor-pointer"
              onClick={() => handleClickArticle(article)}
            >
              <img
                src={article.urlToImage || 'https://via.placeholder.com/150?text=No+Image'}
                alt={article.title}
                className="w-28 h-28 object-cover flex-shrink-0"
              />
              <div className="p-3 flex flex-col justify-between">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</p>
                <p className="text-blue-600 underline text-sm mt-1">Baca</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Baris 3: Breaking */}
      {renderArticleGrid(breakingArticles, 'Breaking News')}

      {/* Baris 4: Latest */}
      {renderArticleGrid(latestArticles, 'Latest News')}
    </div>
  )
}

export default LayoutHomeNews
