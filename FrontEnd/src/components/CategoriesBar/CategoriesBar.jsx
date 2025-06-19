import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { FaChevronDown } from "react-icons/fa";

const CategoriesBar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const req = await fetch(`${API_BASE_URL}/api/category/public/all`);
        if (!req.ok) {
          throw new Error("Gagal mengambil daftar kategori");
        }
        const data = await req.json();
        setCategories(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderCategoryLink = (cat) => (
    <NavLink
      key={cat}
      to={`/category/${cat.toLowerCase()}`}
      className={({ isActive }) =>
        `text-sm md:text-base font-medium px-4 py-2 rounded-full transition-colors duration-300
        ${
          isActive
            ? "bg-green-600 text-white shadow"
            : "bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-green-500"
        }`
      }
    >
      {/* Membuat huruf pertama menjadi kapital */}
      {cat.charAt(0).toUpperCase() + cat.slice(1)}
    </NavLink>
  );

  return (
    <div className="relative w-full bg-white dark:bg-gray-800 border-b border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="w-full flex md:justify-center justify-start px-4 sm:px-6 lg:px-8 py-3 md:overflow-x-visible overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 whitespace-nowrap">
          {loading ? (
            <p className="text-sm text-gray-500">Memuat kategori...</p>
          ) : (
            <>
              {categories.map(renderCategoryLink)}
            </>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none md:hidden"></div>
    </div>
  );
};

export default CategoriesBar;
