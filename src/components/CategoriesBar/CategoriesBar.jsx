import React from 'react'
import { NavLink } from 'react-router-dom'

const categories = [
  "sport",
  "health",
  "science",
  "technology",
  "business",
  "entertainment"
]

const CategoriesBar = () => {
  return (
    <div className="w-full flex justify-center px-4 py-3 overflow-x-auto">
      <div className="flex gap-4 whitespace-nowrap">
        {categories.map(cat => (
          <NavLink
            key={cat}
            to={`/category/${cat}`}
            className={({ isActive }) =>
            `text-sm md:text-base font-medium px-4 py-2 rounded-full transition
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-blue-500 hover:text-white'}`
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
