import React, { useEffect, useState } from 'react';
import { FaBullseye, FaUsers, FaHistory, FaCheckCircle, FaHeart } from 'react-icons/fa';
import { teamMembers } from './dummy';

const AboutUsPage = () => {
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
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 py-16">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">About Our News Portal</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Providing accurate, fast, and reliable information to enlighten and empower the Indonesian people.
          </p>
        </header>

        {/* Bagian Misi & Perjalanan Kami */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <FaBullseye className="text-4xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our mission is to be a primary source of independent and integrity-based information. We are committed to providing high-quality journalism that educates, inspires, and encourages constructive dialogue.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <FaHistory className="text-4xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our mission is to provide easy access to verified information. Founded in 2024, this News Portal was born from a simple idea. From a small team, we continue to grow thanks to the trust of our loyal readers.
            </p>
          </div>
        </div>
        
        {/* Bagian Nilai-nilai Kami (Tambahan Baru) */}
        <section className="text-center my-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">The Values We Uphold</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200 dark:border-gray-700">
              <FaCheckCircle className="text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Accuracy & Verivication</h3>
              <p className="text-gray-600 dark:text-gray-400">We uphold the truth. Every news article goes through a strict verification process before being published.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200 dark:border-gray-700">
              <FaUsers className="text-5xl text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Openness & Transparency</h3>
              <p className="text-gray-600 dark:text-gray-400">We adhere to the principle of transparency in reporting, providing the full context of every event.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md flex flex-col items-center border border-gray-200 dark:border-gray-700">
              <FaHeart className="text-5xl text-red-500 mb-4" /> 
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Innovation & Adaptation</h3>
              <p className="text-gray-600 dark:text-gray-400">We continue to innovate in the way we present news, ensuring you receive the best information.</p>
            </div>
          </div>
        </section>

        {/* Bagian Tim Kami */}
        <section className="text-center my-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">Behind the scenes, there is a highly dedicated professional team committed to providing you with the best journalism.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Mapping member */}
            {teamMembers.map(member => (
              <div key={member.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transform hover:-translate-y-2 transition-transform duration-300 border border-gray-200 dark:border-gray-700">
                <img 
                  src={member.imageUrl}
                  alt={`Foto ${member.name}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-green-500"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-green-600 dark:text-green-400 font-medium text-sm mb-3">{member.role}</p>
                <p className="text-base text-gray-700 dark:text-gray-300 mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center bg-green-600 dark:bg-green-800 text-white py-16 rounded-lg my-20 shadow-xl">
          <h2 className="text-4xl font-bold mb-6">Stay Informed With Us!</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Get the latest news delivered straight to your inbox. Subscribe now.!</p>
          <button className="bg-white cursor-pointer hover:scale-110 transition-transform text-green-700 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-100 duration-300 shadow-md">
            Subscribe
          </button>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;