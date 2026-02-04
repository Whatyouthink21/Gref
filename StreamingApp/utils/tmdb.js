export const TMDB_KEY = 'a45420333457411e78d5ad35d6c51a2d';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const ENDPOINTS = {
  TRENDING: `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_KEY}`,
  POPULAR_MOVIES: `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_KEY}`,
  POPULAR_TV: `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_KEY}`,
  TOP_RATED: `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_KEY}`,
  UPCOMING: `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_KEY}`,
  NOW_PLAYING: `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_KEY}`,
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return '/backdrop-placeholder.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};
