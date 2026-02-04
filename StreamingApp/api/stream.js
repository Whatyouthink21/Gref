export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url, headers } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    // Proxy the video stream with headers
    const streamResponse = await fetch(url, {
      headers: headers || {},
      timeout: 30000
    });

    if (!streamResponse.ok) {
      throw new Error(`Stream failed: ${streamResponse.status}`);
    }

    // Set appropriate headers for video streaming
    res.setHeader('Content-Type', streamResponse.headers.get('content-type') || 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const stream = streamResponse.body;
    stream.pipe(res);

  } catch (error) {
    console.error('Stream error:', error);
    return res.status(500).json({ 
      error: error.message || 'Stream failed' 
    });
  }
}
