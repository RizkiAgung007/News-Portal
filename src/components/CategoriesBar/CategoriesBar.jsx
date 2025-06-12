import React from "react";
import { NavLink } from "react-router-dom";

const categories = [
  "sport",
  "health",
  "science",
  "technology",
  "business",
  "entertainment",
  "kesehatan",
];

const CategoriesBar = () => {
  return (
    <div className="relative w-full bg-white dark:bg-gray-800 border-b border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="w-full flex md:justify-center justify-start px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 whitespace-nowrap">
          {categories.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat}`}
              className={({ isActive }) =>
                `text-sm md:text-base font-medium px-4 py-2 rounded-full transition-colors duration-300
                 ${
                   isActive
                     ? "bg-green-600 text-white shadow" 
                     : "bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-green-500"
                 }`
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </NavLink>
          ))}
        </div>
      </div>

      {/* [BARU] Efek gradasi di sisi kanan sebagai petunjuk visual "bisa di-scroll" */}
      {/* Efek ini disembunyikan di layar besar (lg) karena semua item kemungkinan besar muat */}
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none lg:hidden"></div>
    </div>
  );
};

export default CategoriesBar;