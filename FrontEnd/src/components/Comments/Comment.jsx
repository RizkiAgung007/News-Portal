import React, { useEffect, useState, } from "react";
import { Link } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { API_BASE_URL } from "../../config";
import Confirm from "../../components/Modal/Confirm"; 
import { toast } from "react-toastify";

const Comment = ({ articleUrl, token, userData }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const newsUrl = articleUrl;

  // Debugging logs untuk userData
  // console.log("userData dari props (Comment.jsx):", userData);
  // if (userData) {
  //   console.log("Tipe userData.id_users:", typeof userData.id_users);
  //   console.log("Nilai userData.id_users:", userData.id_users);
  // }

  // Fungsi untuk mengambil daftar komentar berdasarkan URL artikel
  const fetchComments = () => {
    fetch(
      `${API_BASE_URL}/api/comments?news_url=${encodeURIComponent(newsUrl)}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch comments");
        }
        return res.json();
      })
      .then((data) => {
        setComments(data);
        // console.log("Fetch comments", data);
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Failed to retrieve comments");
      });
  };

  useEffect(() => {
    fetchComments();
  }, [newsUrl]);

  // Fungsi untuk pengiriman komentar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return toast.warning("Comments cannot be empty");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, news_url: newsUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to post comment");
      }

      setContent("");
      fetchComments(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return; 

    setLoading(true);
    setError(null);
    setConfirmModalOpen(false); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentToDelete.id_comment}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete comment");
      }

      setComments(
        comments.filter((comment) => comment.id_comment !== commentToDelete.id_comment)
      );
      toast.success("Comment successfully deleted!");
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
      setCommentToDelete(null); 
    }
  };

  // Jika user belum login, menampilkan pesan agar login terlebih dahulu
  if (!token) {
    return (
      <div className="mt-8 p-4 border rounded bg-yellow-50 dark:bg-gray-800 text-yellow-800 dark:text-white">
        You must <strong><Link to="/login">login</Link></strong> to send comment.
      </div>
    );
  }

  // Tampilan utama komponen komentar
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
        Comment
      </h2>

      {/* Form untuk input komentar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full border rounded p-2 mb-2 dark:text-gray-200"
          rows={3}
          placeholder="Write your comments..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Comment"}
        </button>
      </form>

      {/* Menampilkan pesan error jika ada */}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Daftar komentar yang sudah ada */}
      <div>
        {comments.length === 0 && (
          <p className="dark:text-gray-400">No comments yet.</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id_comment}
            className="border-b pb-4 border-gray-200 dark:border-gray-700 mt-4"
          >
            <div className="flex items-center space-x-3 py-4 mb-1">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {comment.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold dark:text-gray-200">
                {comment.username}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(comment.create_at).toLocaleString()}
              </span>
              {/* Kondisi untuk menampilkan tombol hapus */}
              {userData &&
                Number(userData.id_users) === Number(comment.id_user) && (
                  <button
                    onClick={() => handleDeleteClick(comment)} 
                    className="ml-auto cursor-pointer text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                    disabled={loading}
                  >
                    <FaRegTrashCan />
                  </button>
                )}
            </div>
            <p className="dark:text-gray-200">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* Komponen ConfirmModal */}
      <Confirm
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setCommentToDelete(null); 
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Comment"
        message={`Are you sure you want to delete this comment?:\n"${commentToDelete ? commentToDelete.content : ''}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Comment;