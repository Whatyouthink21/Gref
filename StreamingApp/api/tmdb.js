const TMDB_API_KEY = 'a45420333457411e78d5ad35d6c51a2d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { endpoint = 'trending/movie/day', page = 1, query = '' } = req.query;
    let url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`;
    
    if (query) {
      url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    }

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return res.status(200).json({
      success: true,
      data,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    });

  } catch (error) {
    console.error('TMDB API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
