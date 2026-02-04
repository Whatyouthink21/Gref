import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import VideoPlayer from '../components/VideoPlayer';
import SearchModal from '../components/SearchModal';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TMDB_KEY = 'a45420333457411e78d5ad35d6c51a2d';

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState({
    trending: [],
    popularMovies: [],
    popularTV: [],
    topRated: [],
    upcoming: []
  });

  // Fetch all movie data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        { key: 'trending', url: `trending/all/day?api_key=${TMDB_KEY}` },
        { key: 'popularMovies', url: `movie/popular?api_key=${TMDB_KEY}` },
        { key: 'popularTV', url: `tv/popular?api_key=${TMDB_KEY}` },
        { key: 'topRated', url: `movie/top_rated?api_key=${TMDB_KEY}` },
        { key: 'upcoming', url: `movie/upcoming?api_key=${TMDB_KEY}` },
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => 
          axios.get(`https://api.themoviedb.org/3/${endpoint.url}`)
        )
      );

      const newData = {};
      responses.forEach((response, index) => {
        newData[endpoints[index].key] = response.data.results || [];
      });

      setMovieData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMovie = async (movie) => {
    setSelectedMovie(movie);
    
    try {
      // Fetch stream from Videasy API
      const response = await fetch('/api/videasy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: movie.title || movie.name,
          year: (movie.release_date || movie.first_air_date)?.split('-')[0],
          tmdbId: movie.id,
          mediaType: movie.media_type || (movie.title ? 'movie' : 'tv')
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        setSelectedMovie(prev => ({ ...prev, streamData: data }));
        setShowPlayer(true);
      } else {
        alert('Stream not available. Please try another title.');
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      alert('Error loading stream. Please try again.');
    }
  };

  const handleSearchSelect = (item) => {
    handlePlayMovie(item);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflixDark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-netflix border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading StreamFlix...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>StreamFlix - Watch Movies & TV Shows Free</title>
        <meta name="description" content="Stream unlimited movies and TV shows for free" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-netflixDark">
        {/* Navbar */}
        <Navbar onSearch={() => setShowSearch(true)} />

        {/* Hero Banner */}
        <HeroBanner onPlay={handlePlayMovie} />

        {/* Movie Rows */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative -mt-32 z-10"
        >
          {movieData.trending.length > 0 && (
            <MovieRow
              title="Trending Now"
              movies={movieData.trending}
              onSelect={handlePlayMovie}
            />
          )}

          {movieData.popularMovies.length > 0 && (
            <MovieRow
              title="Popular Movies"
              movies={movieData.popularMovies}
              onSelect={handlePlayMovie}
            />
          )}

          {movieData.popularTV.length > 0 && (
            <MovieRow
              title="Popular TV Shows"
              movies={movieData.popularTV}
              onSelect={handlePlayMovie}
            />
          )}

          {movieData.topRated.length > 0 && (
            <MovieRow
              title="Top Rated"
              movies={movieData.topRated}
              onSelect={handlePlayMovie}
            />
          )}

          {movieData.upcoming.length > 0 && (
            <MovieRow
              title="Coming Soon"
              movies={movieData.upcoming}
              onSelect={handlePlayMovie}
            />
          )}
        </motion.main>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-gray-800 mt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-netflix mb-8">StreamFlix</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-400">
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">About Us</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Account</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">Twitter</a></li>
                  <li><a href="#" className="hover:text-white">Facebook</a></li>
                  <li><a href="#" className="hover:text-white">Instagram</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              <p>© 2024 StreamFlix. This is a demo project. Content from TMDB and Videasy.</p>
              <p className="mt-2">Made for educational purposes only.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {showPlayer && selectedMovie?.streamData && (
          <VideoPlayer
            src={selectedMovie.streamData.url}
            title={selectedMovie.title || selectedMovie.name}
            qualities={selectedMovie.streamData.allQualities || []}
            onClose={() => {
              setShowPlayer(false);
              setSelectedMovie(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <SearchModal
            onClose={() => setShowSearch(false)}
            onSelect={handleSearchSelect}
          />
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </>
  );
}
