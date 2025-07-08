import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaExternalLinkAlt } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { API_BASE_URL } from "../../../config";
import Loading from "../../../components/Loading/Loading";

const NewsView = () => {
  const [newsDetail, setNewsDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    const fetchNewsDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewsDetail(response.data);
      } catch (err) {
        setError("Failed to load news details. Maybe the news was not found.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, token]);

  if (loading)
    return (
      <Loading />
    );
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!newsDetail) return null;

  return (
    <div className="md:p-6">
      <div className="max-w-4xl mx-auto md:p-8">
        <div className="justify-between flex items-center">
          <button
            onClick={() => navigate("/admin/news")}
            className="p-3 block cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded transition"
          >
            <IoIosArrowRoundBack />
          </button>

          <button 
          onClick={() => navigate(`/admin/edit/${id}`)}
          className="p-3 block cursor-pointer rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <FaEdit />
          </button>
        </div>

        <div className="flex justify-between items-start mt-4">
          <h1 className="text-4xl font-bold md:w-[70%] text-gray-900 dark:text-gray-100 mb-4">
            {newsDetail.title}
          </h1>

          <div>
            <Link
              to={`/searchdetail/${newsDetail.id_news}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 dark:bg-green-500 dark:text-white text-gray-800 font-semibold py-2 px-4 rounded-lg dark:hover:bg-green-600 hover:bg-gray-200 transition-colors duration-200"
            >
              <FaExternalLinkAlt />
              <span className="md:inline hidden">Watch the News</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4">
          <span>
            Category:{" "}
            <strong className="text-green-600 dark:text-green-400">
              {newsDetail.category}
            </strong>
          </span>
          <span>|</span>
          <span>
            Create by: <strong>{newsDetail.create_by}</strong>
          </span>
          <span>|</span>
          <span>
            Date:{" "}
            <strong>
              {new Date(newsDetail.create_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </span>
        </div>

        <img
          src={`${API_BASE_URL}${newsDetail.url_photo}`}
          alt={newsDetail.title}
          className="w-full h-auto object-cover rounded-lg mb-6"
        />

        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-wrap text-justify">
          {
            newsDetail.description
            ? newsDetail.description.split(/\n\s*\n/).map((paragraph, index) => (
              <div
                key={index}
                className="my-8"
                style={{ 
                  textIndent: '3rem' 
                }}
              >
                {paragraph}
              </div>
            ))
            : "Not have content"
          }
        </div>
      </div>
    </div>
  );
};

export default NewsView;
