import './App.css';
import Navbar from './components/Navbar/Navbar';
import CategoriesBar from './components/CategoriesBar/CategoriesBar';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NewsPage from './Pages/NewsPages/NewsPages';
import CategoryPage from './Pages/CategoryPage/CategoryPage';
import LoginPage from './Pages/Login/LoginPage';
import RegistPage from './Pages/Register/RegistPage';
import ProfilePage from './Pages/ProfilePage/ProfilePage';
import NewsDetail from './Pages/NewsDetail/NewsDetail';
import SearchPage from './Pages/SearchPage/SearchPage';
import Footer from './components/Footer/Footer';

// Komponen Admin
import AdminLayout from './Pages/AdminLayout/AdminLayout';
import Dashboard from './Pages/AdminLayout/Dashboard/Dashboard';
import Create from './Pages/AdminLayout/Create/Create';
import UserManagement from './Pages/AdminLayout/UserManagement/UserManagement';
import Category from './Pages/AdminLayout/Category/Category';
import News from './Pages/AdminLayout/News/News';
import SearchDetail from './Pages/SearchDetailPage/SearchDetailPage';
import CategoryPageNews from './Pages/CategoryPageNews/CategoryPageNews';
import AboutUsPage from './Pages/About/AboutUsPage';
import ContactPage from './Pages/Contact/ContactPage';

const AdminRoutes = ({ children }) => {
  const role = localStorage.getItem('role');
  return role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  const location = useLocation();
  const hideNavbarOnPaths = [
    '/login',
    '/register',
    '/profile',
    '/news/:id',
    '/admin',
    '/admin/dashboard',
    '/admin/create',
    '/admin/users',
    '/admin/category',
    '/admin/news',
  ];
  const hideUI = hideNavbarOnPaths.includes(location.pathname);

  return (
    <>
      {!hideUI && <Navbar />}
      {!hideUI && <CategoriesBar />}

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
          <Route path="category" element={<Category />} />
          <Route path="news" element={<News />} />
        </Route>

        <Route path="*" element={<p className="p-4">Halaman tidak ditemukan.</p>} />
      </Routes>

      {!hideUI && <Footer />}
    </>
  );
}

export default App;
