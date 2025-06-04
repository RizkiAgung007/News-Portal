import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RxAvatar } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();
  const avatarMenuRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    setAvatarMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="container mx-auto sticky top-0 z-50 flex justify-between items-center border-b border-gray-300 p-4 bg-white">
      {/* Logo */}
      <Link to="/" className="lg:text-xl text-[16px] font-bold hover:text-blue-700 transition">
        Portal Berita
      </Link>

      {/* Search bar */}
      <div className="relative lg:w-[640px] w-32 lg:mx-4">
        <input 
          type="text" 
          placeholder="Search News....." 
          className="lg:w-[640px] lg:px-4 px-2 py-2 lg:pr-10 rounded border border-gray-300 text-black outline-none"
        />
        <CiSearch className="absolute lg:right-3 left-40 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-6 ml-6 relative" ref={avatarMenuRef}>
        <h1 className="lg:text-xl cursor-pointer hover:text-blue-700 transition">About Us</h1>
        <h1 className="lg:text-xl cursor-pointer hover:text-blue-700 transition">Contact</h1>

        {/* Avatar dan dropdown */}
        <div className="relative">
          <RxAvatar 
            className="w-6 h-6 cursor-pointer text-gray-700 hover:text-blue-700 transition" 
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} 
          />
          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg py-2 z-50">
              <button 
                onClick={() => {
                  setAvatarMenuOpen(false);
                  navigate('/profile');
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              {username && (
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hamburger icon for mobile */}
      <div className="lg:hidden flex items-center ml-6">
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? (
            <HiOutlineX className="w-7 h-7 text-gray-700" />
          ) : (
            <HiOutlineMenuAlt3 className="w-7 h-7 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg p-4 flex flex-col gap-3 lg:hidden z-50">
          <h1 className="cursor-pointer hover:text-blue-700 transition" onClick={() => setMenuOpen(false)}>About Us</h1>
          <h1 className="cursor-pointer hover:text-blue-700 transition" onClick={() => setMenuOpen(false)}>Contact</h1>
          <div className="relative" ref={avatarMenuRef}>
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="flex items-center gap-2 hover:text-blue-700 transition w-full"
            >
              <RxAvatar className="w-6 h-6 text-gray-700" />
              <span>Profile</span>
            </button>
            {avatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg py-2 z-50">
                <button 
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                {username && (
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
