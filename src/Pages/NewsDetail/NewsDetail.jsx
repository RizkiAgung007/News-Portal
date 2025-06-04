import React, { useEffect, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import Comment from '../../components/Comments/Comment'
import { API_BASE_URL } from '../../config'

const NewsDetail = () => {
  const location = useLocation()
  const { newsId } = useParams()
  const navigate = useNavigate()

  const article = location.state?.article
  const [userData, setUserData] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal autentikasi');
        return res.json();
      })
      .then(data => setUserData(data))
      .catch(() => {
        setToken(null)
        localStorage.removeItem('token')
      })
  }, [token])

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>Data berita tidak tersedia.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 mb-2">{new Date(article.publishedAt).toLocaleString()}</p>
      <img
        src={article.urlToImage || 'https://via.placeholder.com/800x450?text=No+Image'}
        alt={article.title}
        className="w-full h-auto mb-6"
      />
      <p className="mb-4">
        {article.content
          ? article.content.replace(/\[\+\d+ chars\]$/, '')
          : article.description || 'Tidak ada konten'}
      </p>

      <Comment
        newsId={article.url}  // pakai article.url sebagai unique news_url
        token={token}
        username={userData?.username}
      />
    </div>
  )
}

export default NewsDetail
