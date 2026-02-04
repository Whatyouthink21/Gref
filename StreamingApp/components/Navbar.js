import { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUser, FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './SearchModal';

export default function Navbar({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-netflixDark/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-8"
          >
            <h1 className="text-3xl font-bold text-netflix cursor-pointer">
              STREAMFLIX
            </h1>
            <div className="hidden md:flex space-x-6">
              {['Home', 'Movies', 'TV Shows', 'New & Popular', 'My List'].map((item) => (
                <motion.a
                  key={item}
                  whileHover={{ scale: 1.1, color: '#E50914' }}
                  className="text-netflixLight hover:text-netflix transition-colors cursor-pointer"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(true)}
              className="text-xl text-netflixLight hover:text-netflix transition-colors"
            >
              <FaSearch />
            </motion.button>

            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <FaBell className="text-xl text-netflixLight cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-netflix rounded-full"></span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <FaUser />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showSearch && (
          <SearchModal onClose={() => setShowSearch(false)} onSearch={onSearch} />
        )}
      </AnimatePresence>
    </>
  );
}
