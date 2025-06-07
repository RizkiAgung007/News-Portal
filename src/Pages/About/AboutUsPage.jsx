import React, { useEffect, useState } from 'react';
import { FaBullseye, FaUsers, FaHistory } from 'react-icons/fa';

// Data tim fiktif untuk contoh
const teamMembers = [
  {
    name: "Andi Wijaya",
    role: "Founder & Editor-in-Chief",
    imageUrl: "https://i.pravatar.cc/150?u=andi",
    bio: "Dengan pengalaman lebih dari 15 tahun di dunia jurnalisme, Andi memimpin visi redaksi untuk menyajikan berita yang berimbang dan mendalam."
  },
  {
    name: "Citra Lestari",
    role: "Lead Journalist",
    imageUrl: "https://i.pravatar.cc/150?u=citra",
    bio: "Spesialis liputan investigasi dengan fokus pada isu sosial dan teknologi. Karyanya telah memenangkan berbagai penghargaan."
  },
  {
    name: "Budi Santoso",
    role: "Head of Technology",
    imageUrl: "https://i.pravatar.cc/150?u=budi",
    bio: "Bertanggung jawab atas platform teknologi yang cepat dan aman, memastikan pengalaman membaca terbaik untuk Anda."
  },
];

const AboutUsPage = () => {
  // Logika untuk sinkronisasi tema saat halaman dimuat
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto px-6 py-16">
        
        {/* Bagian Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Tentang Portal Berita</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Menyajikan informasi yang akurat, cepat, dan terpercaya untuk mencerahkan dan memberdayakan masyarakat Indonesia.
          </p>
        </header>

        {/* Bagian Misi & Sejarah */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <FaBullseye className="text-4xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Misi Kami</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Misi kami adalah menjadi sumber informasi utama yang independen dan berintegritas. Kami berkomitmen untuk menyajikan jurnalisme berkualitas tinggi yang mendidik, menginspirasi, dan mendorong dialog yang konstruktif.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <FaHistory className="text-4xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Perjalanan Kami</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Didirikan pada tahun 2024, Portal Berita lahir dari gagasan sederhana: menyediakan akses mudah terhadap informasi yang telah diverifikasi. Dari tim kecil, kami terus berkembang berkat kepercayaan para pembaca setia.
            </p>
          </div>
        </div>
        
        {/* Bagian Tim */}
        <section className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tim Kami</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">Di balik layar, ada tim profesional yang berdedikasi.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map(member => (
              <div key={member.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <img 
                  src={member.imageUrl} // Ganti dengan gambar tim Anda
                  alt={`Foto ${member.name}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-green-500"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-green-600 dark:text-green-400 font-medium">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;