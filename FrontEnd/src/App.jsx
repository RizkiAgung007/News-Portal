import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import CategoriesBar from "./components/CategoriesBar/CategoriesBar";
import { Routes, Route, useLocation, Navigate, matchPath } from "react-router-dom";
import NewsPage from "./Pages/NewsPages/NewsPages";
import CategoryPage from "./Pages/CategoryPage/CategoryPage";
import LoginPage from "./Pages/Login/LoginPage";
import RegistPage from "./Pages/Register/RegistPage";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import NewsDetail from "./Pages/NewsDetail/NewsDetail";
import SearchPage from "./Pages/SearchPage/SearchPage";
import NotFound from "./components/NotFound/NotFound";
import Footer from "./components/Footer/Footer";

// Komponen Admin
import AdminLayout from "./Pages/AdminLayout/AdminLayout";
import Dashboard from "./Pages/AdminLayout/Dashboard/Dashboard";
import Create from "./Pages/AdminLayout/Create/Create";
import UserManagement from "./Pages/AdminLayout/UserManagement/UserManagement";
import Category from "./Pages/AdminLayout/Category/Category";
import News from "./Pages/AdminLayout/News/News";
import NewsEdit from "./Pages/AdminLayout/News/NewsEdit";
import NewsView from "./Pages/AdminLayout/News/NewsView";
import SearchDetail from "./Pages/SearchDetailPage/SearchDetailPage";
import CategoryPageNews from "./Pages/CategoryPageNews/CategoryPageNews";
import AboutUsPage from "./Pages/About/AboutUsPage";
import ContactPage from "./Pages/Contact/ContactPage";
import { useTheme } from "./components/Theme/Theme";
import { ToastContainer } from "react-toastify";
import EditProfile from "./Pages/ProfilePage/EditProfile";
import ViewUser from "./Pages/AdminLayout/UserManagement/ViewUser";
import Review from "./Pages/AdminLayout/Review/Review";
import ViewReview from "./Pages/AdminLayout/Review/ViewReview";

const AdminRoutes = ({ children }) => {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" />;
};

function App() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const pathsToHideUI = [
    "/login",
    "/register",
    "/profile",
    // "/news/:id",
    "/admin",
    "/admin/dashboard",
    "/admin/create",
    "/admin/users",
    "/admin/users/view/:userId",
    "/admin/category",
    "/admin/news",
    "/admin/edit/:id",
    "/admin/view/:id",
    "/admin/review",
    "/admin/review/view/:id",
    "/profile/edit"
    // "*"
  ];

  const hideUI = pathsToHideUI.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  return (
    <>
      {!hideUI && <Navbar toggleTheme={toggleTheme} theme={theme} />}
      {!hideUI && <CategoriesBar />}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />

      <Routes>
        <Route path="/" element={<NewsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/newsdetail/:newsId" element={<NewsDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/searchdetail/:newsId" element={<SearchDetail />} />
        <Route path="/content-detail/:newsId" element={<SearchDetail />} />
        <Route path="/category/:category" element={<CategoryPageNews />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/searchdetail/:newsid" element={<SearchDetail />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        <Route
          path="/admin"
          element={
            <AdminRoutes>
              <AdminLayout />
            </AdminRoutes>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<Create />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/view/:userId" element={<ViewUser />} />
          <Route path="category" element={<Category />} />
          <Route path="news" element={<News />} />
          <Route path="edit/:id" element={<NewsEdit />} />
          <Route path="edit" element={<NewsEdit />} />
          <Route path="view/:id" element={<NewsView />} />
          <Route path="searchdetail/:id" element={<SearchDetail />} />
          <Route path="review" element={<Review />} />
          <Route path="review/view/:id" element={<ViewReview />} />
        </Route>

        <Route path="*" element={<NotFound />}
        />
      </Routes>

      {!hideUI && <Footer />}
    </>
  );
}

export default App;
