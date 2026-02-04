import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, type = 'movie', onSelect }) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      setIsMoved(rowRef.current.scrollLeft > 0);
      setShowLeft(rowRef.current.scrollLeft > 0);
      setShowRight(
        rowRef.current.scrollLeft < 
        rowRef.current.scrollWidth - rowRef.current.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies?.length) return null;

  return (
    <div className="relative group py-8">
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white mb-4 ml-6"
      >
        {title}
      </motion.h2>

      <div className="relative">
        {/* Left Arrow */}
        <AnimatePresence>
          {showLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-r-full flex items-center justify-center text-white border border-gray-700"
            >
              <FaChevronLeft size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Movies Row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth px-6"
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-shrink-0 w-48">
              <MovieCard
                movie={movie}
                type={type}
                onClick={onSelect}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <AnimatePresence>
          {showRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-l-full flex items-center justify-center text-white border border-gray-700"
            >
              <FaChevronRight size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
