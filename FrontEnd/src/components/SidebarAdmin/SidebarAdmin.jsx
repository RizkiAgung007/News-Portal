import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlusSquare,
  FaUsersCog,
  FaTags,
  FaNewspaper,
  FaArchive,
  FaSignOutAlt,
  FaCogs,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const SidebarAdmin = ({
  isDesktopCollapsed,
  setDesktopCollapsed,
  isMobileOpen,
  setMobileOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { name: "Create", path: "/admin/create", icon: <FaPlusSquare /> },
    { name: "Users", path: "/admin/users", icon: <FaUsersCog /> },
    { name: "Category", path: "/admin/category", icon: <FaTags /> },
    { name: "News", path: "/admin/news", icon: <FaNewspaper /> },
    { name: "Review", path: "/admin/review", icon: <FaArchive />},
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col z-30 
                   bg-white text-gray-800 border-r border-gray-200
                   dark:bg-gray-800 dark:text-white dark:border-gray-700 
                   transition-all duration-300
                   ${isDesktopCollapsed ? "lg:w-20" : "lg:w-64"}
                   ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                   lg:translate-x-0`}
    >
      <div
        className={`p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${
          isDesktopCollapsed && "p-4"
        }`}
      >
        <Link to="/admin/dashboard" className="flex items-center space-x-3">
          <FaCogs className="text-3xl text-green-500 flex-shrink-0" />
          <span
            className={`text-xl font-semibold tracking-wider text-gray-800 dark:text-white whitespace-nowrap transition-opacity duration-200 ${
              isDesktopCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Admin Panel
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-500 dark:text-gray-400"
        >
        </button>
      </div>

      <nav className="flex-grow p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menus.map((menu) => {
            const isActive = location.pathname.startsWith(menu.path);
            return (
              <li key={menu.name}>
                <Link
                  to={menu.path}
                  title={menu.name}
                  onClick={() => setMobileOpen(false)} 
                  className={`flex items-center space-x-4 p-3 rounded-lg font-medium transition-all duration-200 ${
                    isDesktopCollapsed && ""
                  } ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  <span className="text-xl">{menu.icon}</span>
                  <span
                    className={`${isDesktopCollapsed ? "lg:hidden" : "block"}`}
                  >
                    {menu.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={() => setDesktopCollapsed(!isDesktopCollapsed)}
          title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="w-full hidden lg:flex items-center justify-center p-3 cursor-pointer bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {isDesktopCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-full flex items-center justify-center p-3 cursor-pointer bg-red-600/90 text-white rounded-lg hover:bg-red-600"
        >
          <FaSignOutAlt />
          <span className={`${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
