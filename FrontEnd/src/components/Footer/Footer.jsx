import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const categories = [
  "Sport",
  "Health",
  "Science",
  "Technology",
  "Business",
  "Entertainment",
];

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          
          {/* Kolom Logo & Deskripsi */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Portal<span className="text-green-500">Berita</span>
            </h3>
            <p className="max-w-sm text-sm">
              Platform Anda untuk mendapatkan informasi terkini dan terpercaya
              dari berbagai penjuru dunia, disajikan dengan cepat dan akurat.
            </p>

            <div className="flex space-x-3 mt-6">
              <a href="#" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-blue-500 hover:text-white transition-all">
                <FaFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-sky-500 hover:text-white transition-all">
                <FaTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-pink-500 hover:text-white transition-all">
                <FaInstagram size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-600 hover:text-white transition-all">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Kolom Kategori */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
              Kategori
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${cat.toLowerCase()}`}
                    className="hover:text-green-500 dark:hover:text-green-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom Jelajahi */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
              Jelajahi
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about-us" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">
                  Kontak
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-green-500 dark:hover:text-green-400 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
              Langganan Newsletter
            </h4>
            <p className="text-sm mb-3">Dapatkan berita pilihan langsung di email Anda setiap pagi.</p>
            <form className="flex">
                <input type="email" placeholder="email@anda.com" className="w-full px-3 py-2 text-sm rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"/>
                <button className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600 font-semibold text-sm">
                    Daftar
                </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} <strong>PortalBerita</strong>. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;