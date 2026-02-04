const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, year, tmdbId, mediaType = 'movie', season = 1, episode = 1, server = 'myflixerzupcloud' } = req.body;
    
    if (!title || !tmdbId) {
      return res.status(400).json({ error: 'Title and TMDB ID required' });
    }

    // Get encrypted data
    const qs = new URLSearchParams({ 
      title, 
      mediaType, 
      year: String(year), 
      tmdbId: String(tmdbId) 
    });
    
    if (mediaType === 'tv') { 
      qs.set('seasonId', String(season)); 
      qs.set('episodeId', String(episode)); 
    }

    const apiUrl = `https://api.videasy.net/${server}/sources-with-title?${qs}`;
    const encryptedResponse = await fetch(apiUrl, { 
      headers: { 'User-Agent': UA },
      timeout: 15000 
    });

    if (!encryptedResponse.ok) throw new Error('Videasy API failed');
    const encryptedText = await encryptedResponse.text();

    // Decrypt
    const decryptResponse = await fetch('https://enc-dec.app/api/dec-videasy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: encryptedText, id: String(tmdbId) }),
      timeout: 15000
    });

    const decryptedData = await decryptResponse.json();
    let parsedData = typeof decryptedData === 'string' ? JSON.parse(decryptedData) : decryptedData;
    
    // Sort by quality
    const sortedSources = (parsedData.sources || []).sort((a, b) => {
      const qualityOrder = { '1080p': 3, '720p': 2, '480p': 1, '360p': 0 };
      return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
    });

    const stream = sortedSources[0];
    if (!stream?.url) throw new Error('No stream found');

    return res.status(200).json({
      url: stream.url,
      headers: { 
        origin: 'https://videasy.net', 
        referer: 'https://videasy.net/',
        'User-Agent': UA 
      },
      type: stream.type || 'hls',
      quality: stream.quality,
      title: parsedData.title || title,
      allQualities: sortedSources.map(s => ({ quality: s.quality, url: s.url })),
      success: true,
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch stream',
      success: false 
    });
  }
}
