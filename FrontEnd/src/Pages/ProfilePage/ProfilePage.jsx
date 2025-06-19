import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { RxExit, RxPencil1 } from "react-icons/rx";
import { FaThumbsUp, FaCommentDots, FaKeybase } from "react-icons/fa";
import { toast } from "react-toastify";
import HistoryActPage from "./HistoryActPage";
import Loading from "../../components/Loading/Loading";
import Confirm from "../../components/Modal/Confirm";
const ProfilePage = () => {
  // State untuk info utama
  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [stats, setStats] = useState({ totalLikes: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  // State terpisah untuk riwayat di mobile
  const [mobileHistory, setMobileHistory] = useState({
    type: null,
    data: [],
    isLoading: false,
    isMoreLoading: false,
    currentPage: 1,
    totalPages: 1,
  });

  // State terpisah untuk riwayat di desktop
  const [desktopLikes, setDesktopLikes] = useState({
    data: [],
    isLoading: true,
    isMoreLoading: false,
    currentPage: 1,
    totalPages: 1,
  });
  const [desktopComments, setDesktopComments] = useState({
    data: [],
    isLoading: true,
    isMoreLoading: false,
    currentPage: 1,
    totalPages: 1,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchAllData = async (token) => {
      setLoading(true);
      try {
        const [profileRes, statsRes, likesRes, commentsRes] = await Promise.all(
          [
            fetch(`${API_BASE_URL}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/auth/activity-stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/auth/activity/likes?limit=10`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/auth/activity/comments?limit=10`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]
        );

        if (!profileRes.ok || !statsRes.ok || !likesRes.ok || !commentsRes.ok)
          throw new Error("Failed to retrieve all profile data.");

        const profileData = await profileRes.json();
        const statsData = await statsRes.json();
        const likesResult = await likesRes.json();
        const commentsResult = await commentsRes.json();

        setUsername(profileData.username);
        setCreatedAt(
          new Date(profileData.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setStats(statsData);
        setDesktopLikes({
          data: likesResult.data,
          isLoading: false,
          ...likesResult.pagination,
        });
        setDesktopComments({
          data: commentsResult.data,
          isLoading: false,
          ...commentsResult.pagination,
        });
      } catch (error) {
        toast.error(
          error.message || "Your session has expired, please log back in."
        );
        handleLogout(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData(token);
  }, [navigate, token]);

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("You have successfully logged out");
  };

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const fetchMobileHistory = async (type, page = 1) => {
    if (page === 1)
      setMobileHistory({
        type,
        data: [],
        isLoading: true,
        isMoreLoading: false,
        currentPage: 1,
        totalPages: 1,
      });
    else setMobileHistory((prev) => ({ ...prev, isMoreLoading: true }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/activity/${type}?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load history");
      setMobileHistory((prev) => ({
        ...prev,
        data: page === 1 ? result.data : [...prev.data, ...result.data],
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
        isLoading: false,
        isMoreLoading: false,
      }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMobileHistoryClick = (type) => {
    if (mobileHistory.type === type)
      setMobileHistory({
        type: null,
        data: [],
        isLoading: false,
        isMoreLoading: false,
        currentPage: 1,
        totalPages: 1,
      });
    else fetchMobileHistory(type, 1);
  };

  const handleDesktopLoadMore = async (type) => {
    const isLikes = type === "likes";
    const currentHistory = isLikes ? desktopLikes : desktopComments;
    const setHistory = isLikes ? setDesktopLikes : setDesktopComments;

    if (
      currentHistory.currentPage >= currentHistory.totalPages ||
      currentHistory.isMoreLoading
    )
      return;

    setHistory((prev) => ({ ...prev, isMoreLoading: true }));
    try {
      const nextPage = currentHistory.currentPage + 1;
      const res = await fetch(
        `${API_BASE_URL}/api/auth/activity/${type}?page=${nextPage}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load history");
      setHistory((prev) => ({
        ...prev,
        data: [...prev.data, ...result.data],
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
        isMoreLoading: false,
      }));
    } catch (error) {
      toast.error(error.message);
      setHistory((prev) => ({ ...prev, isMoreLoading: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gray-900 flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 w-full flex justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <RxExit
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 w-7 h-7 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300 z-10"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-16">
          <div className="lg:col-span-3">
            <div className="space-y-10">
              <div className="text-center lg:text-left pt-8">
                <h1 className="text-4xl sm:text-5xl font-bold dark:text-gray-100">
                  Halo, <span className="ml-2 text-green-500">{username}</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Joined since {createdAt}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  Activity Statistic
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <FaThumbsUp className="text-green-500 text-2xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {stats.totalLikes}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Likes Given
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FaCommentDots className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white">
                        {stats.totalComments}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Comment Made
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="w-full cursor-pointer flex justify-center items-center gap-2 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all duration-300"
                >
                  <RxPencil1 /> Edit Profil & Password
                </button>
                <div className="md:hidden flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleMobileHistoryClick("likes")}
                    className="w-full cursor-pointer flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 font-medium transition"
                  >
                    <FaThumbsUp /> Likes
                  </button>
                  <button
                    onClick={() => handleMobileHistoryClick("comments")}
                    className="w-full cursor-pointer flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 font-medium transition"
                  >
                    <FaCommentDots /> Comments
                  </button>
                </div>
              </div>

              <div className="lg:hidden w-full">
                {mobileHistory.type && (
                  <HistoryActPage
                    type={mobileHistory.type}
                    data={mobileHistory.data}
                    isLoading={mobileHistory.isLoading}
                    isMoreLoading={mobileHistory.isMoreLoading}
                    hasMore={
                      mobileHistory.currentPage < mobileHistory.totalPages
                    }
                    onLoadMore={() =>
                      handleMobileHistoryClick(
                        mobileHistory.type,
                        mobileHistory.currentPage + 1
                      )
                    }
                    onClose={() => handleMobileHistoryClick(mobileHistory.type)}
                  />
                )}
              </div>

              <div className="text-center pb-8">
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-red-700 text-red-600 rounded-lg hover:bg-red-500 hover:text-white dark:hover:text-white font-medium transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <Confirm
            isOpen={logoutModal}
            onClose={() => setLogoutModal(false)} 
            onConfirm={doLogout} 
            title="Logout Confirm"
            message="Are you sure you want to log out of your acount? "
            confirmText="Yes, Logout"
          />

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-8 space-y-8">
              <HistoryActPage
                type="likes"
                data={desktopLikes.data}
                isLoading={desktopLikes.isLoading}
                isMoreLoading={desktopLikes.isMoreLoading}
                hasMore={desktopLikes.currentPage < desktopLikes.totalPages}
                onLoadMore={() => handleDesktopLoadMore("likes")}
                onClose={null}
              />
              <HistoryActPage
                type="comments"
                data={desktopComments.data}
                isLoading={desktopComments.isLoading}
                isMoreLoading={desktopComments.isMoreLoading}
                hasMore={
                  desktopComments.currentPage < desktopComments.totalPages
                }
                onLoadMore={() => handleDesktopLoadMore("comments")}
                onClose={null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
