import React from 'react'
import { NavLink } from 'react-router-dom'

const categories = [
  "sport",
  "health",
  "science",
  "technology",
  "business",
  "entertainment",
  "kesehatan"
]

const CategoriesBar = () => {
  return (
    // [PERBAIKAN] Menambahkan background & border + dark mode pada container utama
    <div className="w-full flex justify-center px-4 py-3 overflow-x-auto bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="flex gap-4 whitespace-nowrap">
        {categories.map(cat => (
          <NavLink
            key={cat}
            to={`/category/${cat}`}
            className={({ isActive }) =>
              `text-sm md:text-base font-medium px-4 py-2 rounded-full transition
              ${isActive 
                ? 'bg-green-600 text-white' // Gaya saat aktif tidak perlu diubah, sudah kontras
                // [PERBAIKAN] Menambahkan warna untuk mode terang & gelap pada state tidak aktif
                : 'bg-gray-200 text-gray-800 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-green-500'
              }`
            }
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </NavLink>
        ))}
      </div>  
    </div>
  )
}

export default CategoriesBar