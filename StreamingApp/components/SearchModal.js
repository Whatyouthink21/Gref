import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaStar, FaPlay, FaClock, FaFilm, FaTv } from 'react-icons/fa';
import axios from 'axios';
import debounce from 'lodash.debounce';

const TMDB_KEY = 'a45420333457411e78d5ad35d6c51a2d';

export default function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);

  // Fetch trending on mount
  useEffect(() => {
    fetchTrending();
    loadRecentSearches();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}`
      );
      setTrending(response.data.results.slice(0, 10));
    } catch (error) {
      console.error('Trending fetch error:', error);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const searchDebounced = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`
        );
        
        const filtered = response.data.results.filter(item => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          item.backdrop_path
        );
        setResults(filtered.slice(0, 20));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    searchDebounced(query);
    return () => searchDebounced.cancel();
  }, [query, searchDebounced]);

  const handleSelect = (item) => {
    onSelect(item);
    
    // Save to recent searches
    const newRecent = [
      item,
      ...recentSearches.filter(s => s.id !== item.id && s.media_type !== item.media_type)
    ].slice(0, 10);
    
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.jpg';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -50 }}
        className="w-full max-w-4xl bg-netflixDark/95 rounded-xl overflow-hidden border border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Search Movies & TV Shows</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-netflix focus:ring-1 focus:ring-netflix"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-netflix border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-400">Searching...</p>
            </div>
          ) : query && results.length > 0 ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.media_type}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => handleSelect(item)}
                    className="flex items-center p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all group"
                  >
                    <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={getImageUrl(item.poster_path || item.backdrop_path)}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                      <div className="absolute top-1 left-1">
                        {item.media_type === 'movie' ? (
                          <FaFilm className="text-netflix" size={12} />
                        ) : (
                          <FaTv className="text-blue-400" size={12} />
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h4 className="text-white font-semibold truncate group-hover:text-netflix">
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        <FaStar className="text-yellow-400 text-xs mr-1" />
                        <span className="text-sm text-gray-300">
                          {item.vote_average?.toFixed(1)}
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-sm text-gray-400">
                          {item.media_type === 'movie' 
                            ? item.release_date?.split('-')[0]
                            : item.first_air_date?.split('-')[0]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {item.overview || 'No description available'}
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="ml-2 p-2 bg-netflix/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaPlay className="text-netflix" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : query && !loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-300 flex items-center">
                      <FaClock className="mr-2" /> Recent Searches
                    </h3>
                    <button
                      onClick={clearRecent}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item, index) => (
                      <motion.button
                        key={`recent-${index}`}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleSelect(item)}
                        className="px-4 py-2 bg-gray-900/50 rounded-full text-sm text-gray-300 hover:bg-netflix/20 hover:text-white transition-all"
                      >
                        {item.title || item.name}
                        <span className="ml-2 text-xs opacity-70">
                          {item.media_type === 'movie' ? 'Movie' : 'TV'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Now */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Trending Now</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {trending.map((item) => (
                    <motion.div
                      key={`trending-${item.id}`}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleSelect(item)}
                      className="relative rounded-lg overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title || item.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-white text-sm font-semibold truncate">
                            {item.title || item.name}
                          </h4>
                          <div className="flex items-center mt-1">
                            <FaStar className="text-yellow-400 text-xs mr-1" />
                            <span className="text-xs text-gray-300">
                              {item.vote_average?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full w-6 h-6 flex items-center justify-center">
                        {item.media_type === 'movie' ? (
                          <FaFilm className="text-netflix text-xs" />
                        ) : (
                          <FaTv className="text-blue-400 text-xs" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          <p className="text-center text-gray-400 text-sm">
            Search powered by <span className="text-netflix font-semibold">TMDB</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
