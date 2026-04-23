import React from 'react';
import { PlayCircle, PauseCircle, Clock, Calendar } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import { formatDuration } from '../../utils/formatDuration';
import { formatDate } from '../../utils/formatDate';

const EpisodeRow = ({ episode, podcast, index }) => {
  const { currentEpisode, isPlaying, setEpisode, togglePlay } = usePlayerStore();

  const isCurrentEpisode = currentEpisode?._id === episode._id;

  const handlePlayClick = () => {
    if (isCurrentEpisode) {
      togglePlay();
    } else {
      setEpisode(episode, podcast);
    }
  };

  return (
    <div 
      onClick={handlePlayClick}
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:bg-surface/80 cursor-pointer ${
      isCurrentEpisode ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-surface/30'
    }`}>
      
      {/* Play Button & Number */}
      <div className="w-12 h-12 shrink-0 flex items-center justify-center relative">
        <span className={`text-textMuted font-mono text-sm group-hover:opacity-0 transition-opacity ${isCurrentEpisode ? 'opacity-0' : 'opacity-100'}`}>
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <button 
          onClick={handlePlayClick}
          className={`absolute inset-0 flex items-center justify-center rounded-full text-primary transition-all duration-300 ${
            isCurrentEpisode ? 'opacity-100 shadow-[0_0_15px_rgba(245,166,35,0.3)]' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCurrentEpisode && isPlaying ? (
            <PauseCircle size={40} className="fill-background" />
          ) : (
            <PlayCircle size={40} className="fill-background" />
          )}
        </button>
      </div>

      {/* Episode Details */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-lg font-bold truncate transition-colors ${isCurrentEpisode ? 'text-primary' : 'text-white group-hover:text-primary/90'}`}>
          {episode.title}
        </h4>
        <p className="text-sm text-textMuted line-clamp-1 mt-1">
          {episode.description}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm text-textMuted shrink-0 font-mono">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          {formatDate(episode.publishedAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          {formatDuration(episode.duration)}
        </div>
      </div>
    </div>
  );
};

export default EpisodeRow;
