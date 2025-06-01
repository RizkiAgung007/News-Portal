import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const API_KEY = import.meta.env.VITE_NEWS_API_KEY

const CategoryPage = () => {
  const { categoryName } = useParams()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true)
      try {
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${categoryName}&apiKey=${API_KEY}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.status === 'ok') {
          setArticles(data.articles)
        } else {
          setArticles([])
        }
      } catch (error) {
        console.error('Gagal memuat berita:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryArticles()
  }, [categoryName])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 capitalize">Berita {categoryName}</h2>
      {loading ? (
        <p>Memuat berita...</p>
      ) : articles.length === 0 ? (
        <p>Berita tidak ditemukan.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <div key={article.url || i} className="bg-white p-4 rounded shadow">
              <img
                src={article.urlToImage || "https://via.placeholder.com/400x200?text=No+Image"}
                alt={article.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2">{article.title}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(article.publishedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {article.description ? article.description.slice(0, 120) + '...' : 'Tidak ada deskripsi'}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                Baca Selengkapnya
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPage
