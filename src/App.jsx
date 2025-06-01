import './App.css'
import Navbar from './components/Navbar/Navbar'
import CategoriesBar from './components/CategoriesBar/CategoriesBar'
import { Routes, Route, useLocation } from 'react-router-dom'
import NewsPage from './Pages/NewsPages/NewsPages'
import CategoryPage from './Pages/CategoryPage/CategoryPage'
import LoginPage from './Pages/Login/LoginPage'
import RegistPage from './Pages/Register/RegistPage'
import ProfilePage from './Pages/ProfilePage/ProfilePage'
import NewsDetail from './Pages/NewsDetail/NewsDetail'

function App() {
  const location = useLocation();
  const hideNavbarOnPaths = ['/login', '/register', '/profile']; 
  const hideUI = hideNavbarOnPaths.includes(location.pathname);

  return (
    <>
      {!hideUI && <Navbar />}
      {!hideUI && <CategoriesBar />}
      <Routes>
        <Route path="/" element={<NewsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistPage />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="*" element={<p className="p-4">Halaman tidak ditemukan.</p>} />
      </Routes>
    </>
  );
}

export default App;
