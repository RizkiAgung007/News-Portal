import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FaSun, FaMoon, FaTachometerAlt } from "react-icons/fa";

const Navbar = ({ theme, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const avatarMenuRef = useRef();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // useEffect untuk menutup menu avatar jika user mengklik di luar elemen tersebut
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      ) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi untuk menangani pencarian ketika user menekan ikon cari
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?title=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  // Fungsi untuk mendeteksi tombol Enter saat mengetik di kolom pencarian
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // Fungsi untuk logout pengguna dan menghapus data dari localStorage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUsername("");
    setAvatarMenuOpen(false);
    navigate("/login");
  };

  // Fungsi untuk mengatur gaya NavLink berdasarkan apakah aktif atau tidak
  const navLinkStyles = ({ isActive }) =>
    `aktif text-lg text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition ${
      isActive ? "font-bold text-green-600 dark:text-green-400" : ""
    }`;

  return (
    <div className="pt-6 md:px-32 sticky top-0 z-50 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
      <Link
        to="/"
        className="text-xl font-bold text-gray-900 italic dark:text-gray-100"
      >
        News<span className="text-green-500">Lalin</span>
      </Link>

      <div className="relative lg:w-[640px] w-48 lg:mx-4">
        <input
          type="text"
          placeholder="Search News..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full lg:px-4 px-2 py-2 lg:pr-10 rounded-lg border border-gray-300 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500"
        />
        <CiSearch
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 cursor-pointer"
          data-testid="cisearch-icon"
        />
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-8 ml-6">
        <NavLink
          to="/about-us"
          className={navLinkStyles}
          data-testid="desktop-about-us-link"
        >
          About Us
        </NavLink>
        <NavLink
          to="/contact"
          className={navLinkStyles}
          data-testid="desktop-contact-link"
        >
          Contact
        </NavLink>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full cursor-pointer text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
          data-testid="desktop-toggle-theme-button"
        >
          {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>

        {/* Avatar dan dropdown */}
        <div className="relative" ref={avatarMenuRef}>
          <RxAvatar
            className="w-7 h-7 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            aria-label="Avatar"
          />
          {avatarMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
              data-testid="desktop-avatar-menu"
            >
              {username ? (
                <>
                  {localStorage.getItem("role") === "admin" && (
                    <button
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        navigate("/admin/dashboard");
                      }}
                      className="block w-full cursor-pointer text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      data-testid="desktop-dashboard-button"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full cursor-pointer text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    data-testid="desktop-profile-button"
                  >
                    Profile
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="block w-full cursor-pointer text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    data-testid="desktop-logout-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    navigate("/login");
                  }}
                  className="block w-full text-left px-4 py-2 text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  data-testid="desktop-login-button"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ikon Hamburger untuk mobile */}
      <div className="lg:hidden flex items-center ml-6">
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? (
            <HiOutlineX
              className="w-7 h-7 text-gray-700 dark:text-gray-300"
              data-testid="close-menu-icon"
            />
          ) : (
            <HiOutlineMenuAlt3
              className="w-7 h-7 text-gray-700 dark:text-gray-300"
              data-testid="open-menu-icon"
            />
          )}
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div
          className="absolute top-full right-0 w-full sm:w-60 bg-white dark:bg-gray-800 rounded-b-lg p-4 border-x border-b border-gray-200 dark:border-gray-700 shadow-lg flex flex-col gap-4 lg:hidden z-50"
          data-testid="mobile-menu" 
        >
          <NavLink
            to="/about-us"
            className={navLinkStyles}
            onClick={() => setMenuOpen(false)}
            data-testid="mobile-about-us-link"
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={navLinkStyles}
            onClick={() => setMenuOpen(false)}
            data-testid="mobile-contact-link"
          >
            Contact
          </NavLink>
          <hr className="border-gray-200 dark:border-gray-700" />

          {username ? (
            <>
              {localStorage.getItem("role") === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                  onClick={() => setMenuOpen(false)}
                  data-testid="mobile-dashboard-link"
                >
                  <FaTachometerAlt className="w-6 h-6" /> <span>Dashboard</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                onClick={() => setMenuOpen(false)}
                data-testid="mobile-profile-link"
              >
                <RxAvatar className="w-6 h-6" /> <span>Profile</span>
              </Link>
            </>
          ) : null}

          <button
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }} 
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
            data-testid="mobile-change-theme-button" 
          >
            {theme === "light" ? (
              <FaMoon className="w-6 h-6" />
            ) : (
              <FaSun className="w-6 h-6" />
            )}{" "}
            <span>Change Theme</span>
          </button>
          <hr className="border-gray-200 dark:border-gray-700" />
          {username ? (
            <button
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 text-left"
              data-testid="mobile-logout-button"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-green-600 dark:text-green-400"
              onClick={() => setMenuOpen(false)}
              data-testid="mobile-login-link"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
