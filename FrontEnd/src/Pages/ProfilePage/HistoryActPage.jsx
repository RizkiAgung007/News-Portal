import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaCommentDots, FaExternalLinkAlt, FaUnlink, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading'; 
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

const HistoryActPage = ({ type, data, isLoading, onClose, onLoadMore, hasMore, isMoreLoading }) => {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    const isExternal = typeof item.article_id === 'string' && item.article_id.startsWith('http');
    const isOrphaned = !item.title && !isExternal;

    if (isOrphaned) {
      toast.warn("Detail untuk berita ini tidak lagi tersedia.");
      return;
    }

    if (isExternal) {
      window.open(item.article_id, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/searchdetail/${item.article_id}`);
    }
  };

  const isLikes = type === 'likes';
  const title = isLikes ? 'Likes' : 'Comments';
  const Icon = isLikes ? FaThumbsUp : FaCommentDots;
  const colorClass = isLikes ? 'text-green-500' : 'text-blue-500';

  return (
    <div className="mt-6 border-t dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Icon className={`mr-3 ${colorClass}`} />
          {title}
        </h2>
        {onClose && (
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-sm font-semibold">Close</button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-10"><Loading /></div>
      ) : data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center italic py-4">No Activity Found.</p>
      ) : (
        <>
          <ul className="space-y-3 max-h-96 lg:max-h-[26rem] overflow-y-auto no-scrollbar pr-2">
            {data.map((item) => {
              const isExternal = typeof item.article_id === 'string' && item.article_id.startsWith('http');
              const isOrphaned = !item.title && !isExternal;
              const displayTitle = item.title || (isOrphaned ? "Berita telah dihapus" : "Berita Eksternal");

              const itemClasses = isOrphaned
                ? "p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg opacity-60 cursor-not-allowed"
                : "p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group";

              return (
                <li 
                  key={item.id_like || item.id_comment || item.article_id}
                  className={itemClasses}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex justify-between items-start gap-2 no-scrollbar">
                    <div className="flex-1 min-w-0">
                      {isLikes ? (
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          Like: <span className="font-bold">{displayTitle}</span>
                        </p>
                      ) : (
                        <div className="text-gray-800 dark:text-gray-200">
                          <p className="font-semibold truncate">
                            Comment on: <span className="font-bold">{displayTitle}</span>
                          </p>
                          <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-1 truncate">"{item.content}"</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(item.activity_date), { addSuffix: true, locale: enUS })}
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
          
          <div className="mt-4 text-center">
            {isMoreLoading && (
              <Loading />
            )}
            {hasMore && !isMoreLoading && (
              <button
                onClick={onLoadMore}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Load More...
              </button>
            )}
            {!hasMore && !isLoading && data.length > 5 && (
               <p className="text-sm text-gray-400 dark:text-gray-500">Has displayed all history.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryActPage;