import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";
import { IoIosArrowRoundBack } from "react-icons/io";

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userLikes, setUserLikes] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [likesPage, setLikesPage] = useState(1);
  const [likesTotalPages, setLikesTotalPages] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserDetailsAndStats = async () => {
      if (!token) {
        toast.error(
          "You must log in as an admin to view this page."
        );
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          setError(err.response.data.message);
          toast.error(err.response.data.message);
        } else {
          setError("Failed to load user details. Please try again.");
          toast.error("Failed to load user details.");
        }
        if (
          axios.isAxiosError(err) &&
          err.response &&
          (err.response.status === 404 || err.response.status === 403)
        ) {
          navigate("/admin/users");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchUserDetailsAndStats();
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/activity/likes/${userId}?page=${likesPage}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserLikes(res.data.data);
        setLikesTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching user likes:", err);
      }
    };
    fetchUserLikes();
  }, [userId, token, likesPage]);

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/activity/comments/${userId}?page=${commentsPage}&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserComments(res.data.data);
        setCommentsTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching user comments:", err);
      }
    };
    fetchUserComments();
  }, [userId, token, commentsPage]);

  const handleLikesPageChange = (newPage) => {
    if (newPage > 0 && newPage <= likesTotalPages) {
      setLikesPage(newPage);
    }
  };

  const handleCommentsPageChange = (newPage) => {
    if (newPage > 0 && newPage <= commentsTotalPages) {
      setCommentsPage(newPage);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <p>{error}</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to User Management
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 text-gray-500 text-center">
        <p>User details are not available.</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <div className="md:p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center my-8">
          <div className="text-center">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-3 block cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded transition"
            >
              <IoIosArrowRoundBack />
            </button>
          </div>
        </div>

        {/* Informasi Dasar Pengguna */}
        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-green-500 border-b border-gray-300 dark:border-gray-600 pb-2">
            My Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                ID User:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {userData.id_users}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Username:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {userData.username}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Create At:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {new Date(userData.create_at).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </section>

        {/* Statistik Aktivitas */}
        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-green-500 border-b border-gray-300 dark:border-gray-600 pb-2">
            Activity Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Total Likes:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {userData.totalLikes}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Total Comment:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {userData.totalComments}
              </p>
            </div>
          </div>
        </section>

        {/* Riwayat Likes */}
        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-green-500 border-b border-gray-300 dark:border-gray-600 pb-2">
            Likes History
          </h2>
          <div>
            {userLikes.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 italic">
                This user has not liked any news yet.
              </p>
            ) : (
              <>
                <ul className="list-disc pl-5 space-y-3 text-base">
                  {userLikes.map((like) => (
                    <li
                      key={like.id}
                      className="text-gray-800 dark:text-gray-200 leading-relaxed"
                    >
                      Likes Article "
                      <span className="font-semibold">
                        {like.title || "Judul Tidak Tersedia"}
                      </span>
                      " on{" "}
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(like.activity_date).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
                {likesTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => handleLikesPageChange(likesPage - 1)}
                      disabled={likesPage === 1}
                      className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {likesPage} from {likesTotalPages}
                    </span>
                    <button
                      onClick={() => handleLikesPageChange(likesPage + 1)}
                      disabled={likesPage === likesTotalPages}
                      className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Riwayat Komentar */}
        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-green-500 border-b border-gray-300 dark:border-gray-600 pb-2">
            Comment History
          </h2>
          <div>
            {userComments.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 italic">
                This user has not commented yet.
              </p>
            ) : (
              <>
                <ul className="list-disc pl-5 space-y-3 text-base">
                  {userComments.map((comment) => (
                    <li
                      key={comment.id_comment}
                      className="text-gray-800 dark:text-gray-200 leading-relaxed"
                    >
                      Comments on article "
                      <span className="font-semibold">
                        {comment.title || "Judul Tidak Tersedia"}
                      </span>
                      ": "<span className="italic">{comment.content}</span>"
                      on{" "}
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(comment.activity_date).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {commentsTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => handleCommentsPageChange(commentsPage - 1)}
                      disabled={commentsPage === 1}
                      className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {commentsPage} from {commentsTotalPages}
                    </span>
                    <button
                      onClick={() => handleCommentsPageChange(commentsPage + 1)}
                      disabled={commentsPage === commentsTotalPages}
                      className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewUser;
