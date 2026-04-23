import React, { useEffect, useRef, useState } from 'react';
import usePlayerStore from '../../store/playerStore';
import WaveformVisualizer from './WaveformVisualizer';
import { formatDuration } from '../../utils/formatDuration';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const GlobalAudioPlayer = () => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const { 
    currentEpisode, 
    podcast, 
    isPlaying, 
    togglePlay, 
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    speed,
    setSpeed,
    playNext,
    clearPlayer
  } = usePlayerStore();

  const location = useLocation();

  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const isChangingEpisode = useRef(false);

  // Stop playing and close player when navigating away from podcast pages
  useEffect(() => {
    if (currentEpisode && !location.pathname.startsWith('/podcast')) {
      clearPlayer();
    }
  }, [location.pathname, currentEpisode, clearPlayer]);

  // Handle source change + auto-play when episode changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentEpisode || !audio) return;

    const src = currentEpisode.audioFile.startsWith('http')
      ? currentEpisode.audioFile
      : `http://localhost:5000${currentEpisode.audioFile}`;

    // Pause whatever was playing before
    audio.pause();
    isChangingEpisode.current = true;
    setIsBuffering(true);

    // Set new source
    audio.src = src;
    audio.load();

    // Play once enough data is buffered
    const tryPlay = () => {
      isChangingEpisode.current = false;
      setIsBuffering(false);
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error('Play failed:', e);
          setIsPlaying(false);
        });
    };

    // If already buffered (e.g. cached), play immediately
    if (audio.readyState >= 3) {
      tryPlay();
    } else {
      audio.addEventListener('canplay', tryPlay, { once: true });
    }

    setPlayCountIncremented(false);

    return () => {
      audio.removeEventListener('canplay', tryPlay);
    };
  }, [currentEpisode]); // eslint-disable-line

  // Handle manual play/pause (only when user presses the button, not on episode change)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isChangingEpisode.current) return;

    if (isPlaying) {
      audio.play().catch(e => {
        console.error('Resume failed:', e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]); // eslint-disable-line



  // Update volume & speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, isMuted, speed]);

  // Handle time update & play count increment
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Increment play count after 30 seconds
      if (time > 30 && !playCountIncremented && currentEpisode) {
        setPlayCountIncremented(true);
        api.post(`/episodes/${currentEpisode._id}/play`).catch(console.error);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (amount) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  if (!currentEpisode) return null;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-0 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 pointer-events-auto border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />

        {/* Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 shrink-0">
          <img 
            src={currentEpisode.thumbnail || podcast?.coverImage} 
            alt="thumbnail" 
            className="w-12 h-12 rounded object-cover border border-white/10"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150/1A1A1A/F5A623?text=WavCast' }}
          />
          <div className="min-w-0">
            <h4 className="text-white text-sm font-bold truncate">{currentEpisode.title}</h4>
            <p className="text-textMuted text-xs truncate">{podcast?.title}</p>
          </div>
        </div>

        {/* Controls & Waveform */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="flex items-center gap-6 mb-2">
            <button onClick={() => skip(-15)} className="text-textMuted hover:text-white transition-colors" title="Rewind 15s">
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              disabled={isBuffering}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,166,35,0.4)] disabled:opacity-80 disabled:hover:scale-100"
            >
              {isBuffering ? <Loader2 size={20} className="animate-spin text-black" /> : (isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-1" />)}
            </button>
            <button onClick={() => skip(30)} className="text-textMuted hover:text-white transition-colors" title="Forward 30s">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="w-full flex items-center gap-3 relative">
            <span className="text-xs text-textMuted font-mono w-10 text-right">{formatDuration(currentTime)}</span>
            
            {/* Combined Waveform and Progress Bar */}
            <div className="flex-1 relative h-12 group cursor-pointer" onClick={handleProgressClick} ref={progressBarRef}>
              <WaveformVisualizer />
              
              {/* Progress Overlay */}
              <div 
                className="absolute inset-0 bg-black/40 border-r border-primary pointer-events-none"
                style={{ width: `${100 - progressPercent}%`, right: 0, left: 'auto' }}
              ></div>
              
              {/* Scrubber Knob (visible on hover) */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              ></div>
            </div>

            <span className="text-xs text-textMuted font-mono w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex items-center justify-end gap-4 w-1/4 shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-xs font-mono font-bold text-textMuted hover:text-white px-2 py-1 rounded bg-surface border border-white/10"
            >
              {speed}x
            </button>
            
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-surface border border-white/10 rounded shadow-xl py-1 z-50 flex flex-col"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button 
                      key={s}
                      onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                      className={`px-4 py-1 text-xs font-mono text-left hover:bg-white/5 ${s === speed ? 'text-primary' : 'text-white'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 w-24">
            <button onClick={() => setIsMuted(!isMuted)} className="text-textMuted hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalAudioPlayer;
