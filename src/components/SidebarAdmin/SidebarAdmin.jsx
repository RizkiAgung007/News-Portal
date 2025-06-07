import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaPlusSquare, 
  FaUsersCog, 
  FaTags, 
  FaNewspaper, 
  FaSignOutAlt,
  FaCogs
} from "react-icons/fa";


const SidebarAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "Create", path: "/admin/create", icon: <FaPlusSquare /> },
    { name: "Users", path: "/admin/users", icon: <FaUsersCog /> },
    { name: "Category", path: "/admin/category", icon: <FaTags /> },
    { name: "News", path: "/admin/news", icon: <FaNewspaper /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    // [PERBAIKAN] Kelas warna sekarang menggunakan prefix 'dark:' secara langsung
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col z-10 
                   bg-white text-gray-800 border-r border-gray-200
                   dark:bg-gray-800 dark:text-white dark:border-gray-700 
                   transition-colors duration-300">
      
      {/* Header Sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/admin/dashboard" className="flex items-center space-x-3">
          <FaCogs className="text-3xl text-green-500" />
          <span className="text-2xl font-semibold tracking-wider text-gray-800 dark:text-white">
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Menu Utama */}
      <nav className="flex-grow p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menus.map((menu) => {
            const isActive = location.pathname.startsWith(menu.path);
            return (
              <li key={menu.name}>
                <Link
                  to={menu.path}
                  // [PERBAIKAN] Logika kelas disederhanakan dengan dark:
                  className={`flex items-center space-x-4 p-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-green-600 text-white shadow-lg" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  <span className="text-xl">{menu.icon}</span>
                  <span>{menu.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tombol Logout di Bagian Bawah */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-red-600/90 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaSignOutAlt />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;