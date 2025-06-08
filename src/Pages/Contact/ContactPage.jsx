import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Logika untuk sinkronisasi tema saat halaman dimuat
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulasi pengiriman form
    setTimeout(() => {
      alert(`Terima kasih, ${formData.name}! Pesan Anda telah kami terima.`);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Punya pertanyaan, masukan, atau kritik? Kami siap mendengarkan.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
          {/* Kolom Kiri: Informasi Kontak & Peta */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Informasi Kontak
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="flex items-start">
                  <FaMapMarkerAlt className="w-5 h-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <span>
                    Jalan Jenderal Sudirman Kav. 52-53, Bintaro, Tangerang
                    Selatan, Banten 15224, Indonesia
                  </span>
                </p>
                <p className="flex items-center">
                  <FaEnvelope className="w-5 h-5 mr-3 text-green-500" />
                  <span>redaksi@portalberita.com</span>
                </p>
                <p className="flex items-center">
                  <FaPhone className="w-5 h-5 mr-3 text-green-500" />
                  <span>(021) 555-0123</span>
                </p>
              </div>
            </div>
            {/* Peta (Ganti dengan embed Google Maps Anda) */}
            <div className="h-64 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.011993510563!2d106.7864338147864!3d-6.262177795466858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1a2613e316d%3A0x2474bb442525697d!2sBintaro%20Jaya%20Xchange%20Mall!5e0!3m2!1sen!2sid!4v1672895690123!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Kantor"
              ></iframe>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Kontak */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Subjek Pesan
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Pesan Anda
              </label>
              <textarea
                name="message"
                id="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 text-base font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:bg-green-400"
            >
              {submitting ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
