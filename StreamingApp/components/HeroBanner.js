import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';
import axios from 'axios';

const TMDB_KEY = 'a45420333457411e78d5ad35d6c51a2d';

export default function HeroBanner({ onPlay }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMovie();
  }, []);

  const fetchTrendingMovie = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_KEY}`
      );
      
      const movies = response.data.results;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      
      // Fetch movie details
      const details = await axios.get(
        `https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${TMDB_KEY}`
      );
      
      setMovie({ ...randomMovie, ...details.data });
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-r from-gray-800 to-gray-900 animate-pulse"></div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie?.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 h-full flex items-center px-6 md:px-12"
      >
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4"
          >
            {movie?.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-4 mb-6"
          >
            <div className="flex items-center space-x-2">
              <FaStar className="text-yellow-400" />
              <span className="text-white font-semibold">
                {movie?.vote_average?.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">{movie?.release_date?.split('-')[0]}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">{movie?.runtime} min</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-200 text-lg mb-8 line-clamp-3"
          >
            {movie?.overview}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPlay(movie)}
              className="btn-netflix flex items-center space-x-2"
            >
              <FaPlay />
              <span>Play Now</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline flex items-center space-x-2"
            >
              <FaInfoCircle />
              <span>More Info</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
