import { motion } from 'framer-motion';
import { FaPlay, FaStar, FaInfoCircle } from 'react-icons/fa';

export default function MovieCard({ movie, type = 'movie', onClick, index }) {
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.1, 
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      className="movie-card group"
      onClick={() => onClick(movie)}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={imageUrl} 
          alt={movie.title || movie.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-white font-bold">
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-300 text-sm">
              {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}
            </span>
          </div>
          
          <h3 className="text-white font-semibold text-lg truncate">
            {movie.title || movie.name}
          </h3>
          
          <div className="flex space-x-2 mt-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-netflix text-white p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onClick(movie);
              }}
            >
              <FaPlay />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 text-white p-2 rounded-full"
            >
              <FaInfoCircle />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
