import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Users } from 'lucide-react';

const PodcastCard = ({ podcast }) => {
  return (
    <div className="group relative bg-surface border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(245,166,35,0.15)] transition-all duration-300">
      <div className="aspect-square w-full relative overflow-hidden">
        <img 
          src={podcast.coverImage.startsWith('http') ? podcast.coverImage : `http://localhost:5000${podcast.coverImage}`} 
          alt={podcast.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/1A1A1A/F5A623?text=WavCast' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">
            {podcast.category}
          </div>
          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_15px_rgba(245,166,35,0.5)]">
            <PlayCircle size={24} className="text-black ml-1" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <Link to={`/podcast/${podcast._id}`}>
          <h3 className="font-display tracking-wide text-xl text-white truncate hover:text-primary transition-colors">
            {podcast.title}
          </h3>
        </Link>
        <p className="text-sm text-textMuted mt-1 truncate">By {podcast.author?.name}</p>
        
        <div className="mt-4 flex items-center justify-between text-xs text-textMuted border-t border-white/5 pt-3">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
            {podcast.episodes?.length || 0} Episodes
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {podcast.subscribersCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;
