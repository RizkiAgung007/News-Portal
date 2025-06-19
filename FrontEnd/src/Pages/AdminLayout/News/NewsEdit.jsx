import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { API_BASE_URL } from "../../../config";
import { toast } from "react-toastify";

const EditNews = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [creator, setCreator] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Mengambil data melalui api ke db
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/category/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        } else {
          setError("Gagal memuat kategori");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat kategori");
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Mengambil data berita yang akan diedit by ID
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const newsData = res.data;
        setTitle(newsData.title);
        setDescription(newsData.description);
        setCategory(newsData.category);
        setCreator(newsData.create_by);
        setPreview(`${API_BASE_URL}${newsData.url_photo}`);
      })
      .catch((err) => {
        console.error("Gagal mengambil data berita", err);
        setError("Data berita tidak ditemukan.");
      });
  }, [id, token]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description || !category || !creator) {
      return setError("Title, Description, Category, and Author must be filled out.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("create_by", creator);
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/news/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message);
      setTimeout(() => navigate("/admin/news"), 2000);
      toast.success("Update success")
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the news.."
      );
      toast.error("An error occurred while updating the news.")
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Edit News
      </h1>
      <button
        onClick={() => navigate("/admin/news")}
        className="mb-6 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded transition"
      >
        <IoIosArrowRoundBack />
      </button>
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}
      {success && (
        <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            News Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            rows="10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          ></textarea>
        </div>
        <div className="flex justify-between gap-12">
          <div className="w-full">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id_category} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label
              htmlFor="create_by"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Create By
            </label>
            <input
              type="text"
              id="creator"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="photo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Upload Photo
          </label>
          <input
            type="file"
            id="photo"
            onChange={handlePhotoChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Photo Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-1/2 rounded-md shadow-md"
              />
            </div>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Update News
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNews;
