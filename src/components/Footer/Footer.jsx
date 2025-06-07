import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

// Kategori yang sama dengan yang ada di CategoriesBar Anda untuk konsistensi
const categories = [
  "sport",
  "health",
  "science",
  "technology",
  "business",
  "entertainment",
];

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Kolom 1: Logo dan Deskripsi Singkat */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Portal Berita</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              Platform Anda untuk mendapatkan informasi terkini dan terpercaya dari berbagai penjuru dunia, disajikan dengan cepat dan akurat.
            </p>
          </div>

          {/* Kolom 2: Kategori */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Kategori</h4>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className="hover:text-green-500 dark:hover:text-green-400 transition-colors">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Jelajahi */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Jelajahi</h4>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Ikuti Kami */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

        </div>

        {/* Bagian Bawah Footer: Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Portal Berita. Semua Hak Cipta Dilindungi.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;