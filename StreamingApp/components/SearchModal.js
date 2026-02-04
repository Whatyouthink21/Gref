import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaStar, FaPlay } from 'react-icons/fa';
import axios from 'axios';
import debounce from 'lodash.debounce';

const TMDB_KEY = 'a45420333457411e78d5ad35d6c51a2d';

export default function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchDebounced = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        
        const filtered = response.data.results.filter(item => 
          item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(filtered);
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
    onClose();
    
    // Save to recent searches
    const newRecent = [
      item,
      ...recentSearches.filter(s => s.id !== item.id
