import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import '@videojs/http-streaming';
import 'video.js/dist/video-js.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpand, FaCog, FaPlay, FaPause } from 'react-icons/fa';

export default function VideoPlayer({ 
  src, 
  title, 
  qualities = [], 
  onClose 
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    // Initialize player
    const player = videojs(videoRef.current, {
      controls: false,
      autoplay: true,
      preload: 'auto',
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          limitRenditionByPlayerDimensions: true,
        },
      },
    });

    playerRef.current = player;

    // Event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('timeupdate', () => {
      setCurrentTime(player.currentTime());
      setDuration(player.duration());
    });
    player.on('volumechange', () => setVolume(player.volume()));
    player.on('loadeddata', () => setIsLoading(false));
    player.on('error', () => {
      setError(player.error()?.message || 'Playback error');
    });

    // Load source
    player.src({
      src,
      type: 'application/x-mpegURL',
      withCredentials: false,
    });

    // Auto-hide controls
    let controlsTimer;
    const resetControlsTimer = () => {
      clearTimeout(controlsTimer);
      setShowControls(true);
      controlsTimer = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimer();
    const handleClick = () => {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    };

    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('click', handleClick);
    resetControlsTimer();

    return () => {
      clearTimeout(controlsTimer);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('click', handleClick);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  // Quality change
  useEffect(() => {
    if (!playerRef.current || selectedQuality === 'auto') return;
    
    const quality = qualities.find(q => q.quality === selectedQuality);
    if (quality?.url) {
      playerRef.current.src({
        src: quality.url,
        type: 'application/x-mpegURL',
      });
    }
  }, [selectedQuality, qualities]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (playerRef.current) {
      playerRef.current.currentTime(pos * duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        <div className="text-center p-8">
          <h2 className="text-2xl text-netflix mb-4">Playback Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="btn-netflix"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-netflix border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading stream...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element */}
      <div data-vjs-player className="h-full">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered w-full h-full"
        />
      </div>

      {/* Custom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 gradient-overlay flex flex-col justify-between p-6"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-white hover:text-netflix transition-colors"
              >
                <FaTimes size={24} />
              </button>
              
              <h2 className="text-xl font-bold text-white truncate max-w-md">
                {title}
              </h2>
              
              <div className="flex space-x-4">
                {qualities.length > 0 && (
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="bg-black/50 text-white px-3 py-1 rounded border border-gray-600"
                  >
                    <option value="auto">Auto</option>
                    {qualities.map((q, i) => (
                      <option key={i} value={q.quality}>
                        {q.quality}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-netflix transition-colors"
                >
                  <FaExpand size={20} />
                </button>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-20 h-20 bg-netflix/80 rounded-full flex items-center justify-center"
              >
                {isPlaying ? (
                  <FaPause size={30} className="text-white" />
                ) : (
                  <FaPlay size={30} className="text-white ml-1" />
                )}
              </motion.button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div 
                className="relative h-1 bg-gray-600 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="absolute h-full bg-netflix rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 w-3 h-3 bg-netflix rounded-full -translate-y-1/2"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button onClick={togglePlay}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <div className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      if (playerRef.current) {
                        playerRef.current.volume(vol);
                      }
                    }}
                    className="w-24"
                  />
                  <button>
                    <FaCog />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
