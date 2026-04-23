import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getTrendingPodcasts, getFeaturedPodcasts } from '../api/podcastApi';
import useAuthStore from '../store/authStore';
import PodcastCard from '../components/podcast/PodcastCard';
import { motion } from 'framer-motion';
import { Play, Mic } from 'lucide-react';
import getMediaUrl from '../utils/getMediaUrl';

const CATEGORIES = [
  'Technology', 'True Crime', 'Education', 'Comedy', 
  'Business', 'Health', 'Society', 'Sports'
];

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleStartPodcasting = () => {
    if (!isAuthenticated) return navigate('/register');
    if (user?.role === 'creator' || user?.role === 'admin') return navigate('/dashboard');
    return navigate('/profile'); // listener → profile has "Become a Creator" CTA
  };

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['podcasts', 'trending'],
    queryFn: getTrendingPodcasts
  });

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['podcasts', 'featured'],
    queryFn: getFeaturedPodcasts
  });

  const featuredCreator = featured?.data?.[0];

  return (
    <div className="-mt-8">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-white/10 rounded-b-3xl">
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(circle at center, #F5A623 0%, transparent 60%)',
            mixBlendMode: 'screen'
          }}></div>
          {/* Animated Waveform Background using SVG */}
          <svg className="absolute bottom-0 w-full h-1/2 opacity-30 text-primary animate-pulse-wave" preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,229.3C960,245,1056,203,1152,176C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-display tracking-widest text-white mb-6 uppercase drop-shadow-lg">
              Your Voice.<br/><span className="text-primary">Your World.</span>
            </h1>
            <p className="text-xl md:text-2xl text-textMuted mb-10 max-w-2xl mx-auto font-sans">
              Discover raw, unfiltered conversations and broadcast your own to the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/discover')}
                className="btn-primary flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
              >
                <Play fill="currentColor" size={20} />
                Start Listening
              </button>
              <button 
                onClick={handleStartPodcasting}
                className="btn-outline text-lg w-full sm:w-auto justify-center flex items-center gap-2"
              >
                <Mic size={20} />
                Start Podcasting
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 mt-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map(category => (
            <button 
              key={category}
              onClick={() => navigate(`/discover?category=${encodeURIComponent(category)}`)}
              className="px-6 py-2 rounded-full border border-white/10 bg-surface/50 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all duration-300 text-sm font-medium"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 border-t border-white/5 relative">
        <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-display tracking-wide uppercase">Trending Now</h2>
          <Link to="/discover?sort=popular" className="text-secondary hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            View All
          </Link>
        </div>

        {trendingLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {trending?.data?.map(podcast => (
              <div key={podcast._id} className="min-w-[280px] w-[280px] snap-start">
                <PodcastCard podcast={podcast} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Creator Spotlight */}
      {featuredCreator && (
        <section className="py-20">
          <div className="glass-panel rounded-3xl overflow-hidden relative border border-secondary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent"></div>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-12 flex flex-col justify-center relative z-10">
                <div className="text-secondary text-sm font-bold uppercase tracking-widest mb-4">Creator Spotlight</div>
                <h2 className="text-5xl font-display tracking-wide mb-4 text-white">
                  {featuredCreator.title}
                </h2>
                <p className="text-textMuted mb-8 text-lg">
                  {featuredCreator.description}
                </p>
                
                <div className="flex items-center gap-4 mb-8">
                  <img 
                    src={getMediaUrl(featuredCreator.author.avatar)} 
                    alt={featuredCreator.author.name}
                    className="w-16 h-16 rounded-full border-2 border-secondary object-cover"
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + featuredCreator.author.name + '&background=random' }}
                  />
                  <div>
                    <div className="font-bold text-lg">{featuredCreator.author.name}</div>
                    <div className="text-secondary text-sm">Host & Creator</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/podcast/${featuredCreator._id}`)}
                  className="btn-secondary self-start"
                >
                  Listen Now
                </button>
              </div>
              
              <div className="md:w-1/2 relative min-h-[400px]">
                <img 
                  src={getMediaUrl(featuredCreator.coverImage)} 
                  alt={featuredCreator.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/800x800/1A1A1A/00D4C8?text=Featured' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;