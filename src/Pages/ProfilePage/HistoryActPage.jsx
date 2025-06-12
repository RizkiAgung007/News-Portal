import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaCommentDots, FaExternalLinkAlt, FaUnlink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { PropagateLoader } from 'react-spinners'; // Ganti Loading dengan PropagateLoader jika itu yang Anda gunakan

const HistoryActPage = ({ type, data, isLoading, onClose }) => {
  const navigate = useNavigate();

  // [PERBAIKAN FINAL] Logika navigasi yang benar
  const handleItemClick = (item) => {
    // Memeriksa apakah article_id adalah URL eksternal
    const isExternal = typeof item.article_id === 'string' && item.article_id.startsWith('http');
    
    // Memeriksa apakah item adalah data yatim (berita internal yang sudah dihapus)
    const isOrphaned = !item.title && !isExternal;

    if (isOrphaned) {
      toast.warn("Detail untuk berita ini tidak lagi tersedia.");
      return;
    }

    if (isExternal) {
      // Jika eksternal, buka di tab baru
      window.open(item.article_id, '_blank', 'noopener,noreferrer');
    } else {
      // Jika internal, navigasi ke halaman detail yang benar
      navigate(`/searchdetail/${item.article_id}`);
    }
  };

  const isLikes = type === 'likes';
  const title = isLikes ? 'Riwayat Like' : 'Riwayat Komentar';
  const Icon = isLikes ? FaThumbsUp : FaCommentDots;
  const colorClass = isLikes ? 'text-green-600' : 'text-blue-600';

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Icon className={`mr-3 ${colorClass}`} />
          {title}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm font-semibold">Tutup</button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-10"><PropagateLoader color={isLikes ? "#22c55e" : "#3b82f6"}/></div>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-center italic py-4">Tidak ada aktivitas ditemukan.</p>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {data.map((item, index) => {
            const isExternal = typeof item.article_id === 'string' && item.article_id.startsWith('http');
            const isOrphaned = !item.title && !isExternal;
            const displayTitle = item.title || (isOrphaned ? "Berita Telah Dihapus" : "Berita Eksternal");

            const itemClasses = isOrphaned
              ? "p-3 bg-gray-100 rounded-lg opacity-60 cursor-not-allowed"
              : "p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all group";

            return (
              <li 
                key={index} 
                className={itemClasses}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    {isLikes ? (
                      <p className="font-semibold text-gray-800 truncate">
                        Menyukai: <span className="font-bold">{displayTitle}</span>
                      </p>
                    ) : (
                      <div className="text-gray-800">
                        <p className="font-semibold truncate">
                          Komentar pada: <span className="font-bold">{displayTitle}</span>
                        </p>
                        <p className="text-sm italic text-gray-600 mt-1 truncate">"{item.content}"</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.activity_date).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {isExternal && !isOrphaned && (
                    <FaExternalLinkAlt className="text-gray-400 ml-2 mt-1 flex-shrink-0 group-hover:text-blue-500"/>
                  )}
                  {isOrphaned && (
                    <FaUnlink className="text-gray-400 ml-2 mt-1 flex-shrink-0"/>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default HistoryActPage;