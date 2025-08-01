import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import Loading from "../../../components/Loading/Loading";
import { IoIosArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";

const ViewReview = () => {
  const [reviewDetail, setReviewDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id || !token) {
      if (!token) {
        toast.error("You must be logged in as an admin to view this page..");
        navigate("/login");
      } else {
        setError("ID ulasan tidak ditemukan.");
      }
      setLoading(false);
      return;
    }

    const fetchReviewDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/review/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviewDetail(response.data);
      } catch (err) {
        console.error("Error fetching review detail:", err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            setError("No reviews found.");
            toast.error("No reviews found.");
            navigate("/admin/reviews");
          } else if (err.response.status === 403) {
            setError("Access denied.");
            toast.error("Access denied.");
            navigate("/login");
          } else {
            setError("Failed to load review details.");
            toast.error("Failed to load review details.");
          }
        } else {
          setError("A network error occurred.");
          toast.error("A network error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReviewDetail();
  }, [id, token, navigate]);

  if (loading) return <Loading />;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!reviewDetail)
    return (
      <p className="p-6 text-gray-500 text-center">
        Review details are not available.
      </p>
    );

  return (
    <div className="md:p-6 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full mx-auto md:p-8">
        {/* Header dan Tombol Kembali */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/admin/review")}
            className="p-3 block cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded transition"
          >
            <IoIosArrowRoundBack />
          </button>
        </div>

        {/* Detail Ulasan */}
        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-2">
            Review Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Username:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {reviewDetail.username || "Tidak Tersedia"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Email:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {reviewDetail.email}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Subject Message:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {reviewDetail.subject}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Create At:
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {new Date(reviewDetail.create_at).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-2">
            Message
          </h2>
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-wrap text-justify">
            {reviewDetail.message
              ? reviewDetail.message.split(/\n\s*\n/).map((paragraph, index) => (
                <div
                  key={index}
                  className="my-8"
                  style={{
                    textIndent: "3rem",
                  }}
                >
                  {paragraph}
                </div>
              ))
              : "Not have content"}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ViewReview;
