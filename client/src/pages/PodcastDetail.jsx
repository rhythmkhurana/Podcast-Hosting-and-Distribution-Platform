import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPodcastById } from '../api/podcastApi';
import { subscribeToPodcast, unsubscribeFromPodcast, getMySubscriptions } from '../api/subscriptionApi';
import useAuthStore from '../store/authStore';
import EpisodeRow from '../components/podcast/EpisodeRow';
import UploadEpisodeModal from '../components/dashboard/UploadEpisodeModal';
import { Heart, Globe, Play, Users, Hash, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PodcastDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: podcastData, isLoading } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => getPodcastById(id)
  });

  const { data: subsData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getMySubscriptions,
    enabled: isAuthenticated
  });

  const podcast = podcastData?.data;
  const isSubscribed = subsData?.data?.some(sub => sub.podcast._id === id);

  const subscribeMutation = useMutation({
    mutationFn: () => subscribeToPodcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['podcast', id]);
    }
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => unsubscribeFromPodcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['podcast', id]);
    }
  });

  const handleSubscribeToggle = () => {
    if (!isAuthenticated) return alert('Please login to subscribe');
    if (isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!podcast) {
    return <div className="text-center py-20 text-xl font-display text-textMuted">Podcast not found.</div>;
  }

  const coverUrl = podcast.coverImage.startsWith('http') ? podcast.coverImage : `http://localhost:5000${podcast.coverImage}`;

  return (
    <div className="-mt-8 pb-20">
      {/* Parallax Hero Header */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-b-3xl border-b border-white/10">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-30"
          style={{ backgroundImage: `url(${coverUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-surface shrink-0 relative group"
            >
              <img src={coverUrl} alt={podcast.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black">
                  <Play size={32} className="ml-2" />
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 pb-4"
            >
              <div className="flex items-center gap-2 mb-2 text-sm font-bold tracking-wider uppercase text-primary">
                <span>{podcast.category}</span>
                {podcast.isExplicit && <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs ml-2">EXPLICIT</span>}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display tracking-wide mb-4 drop-shadow-md">
                {podcast.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-textMuted font-medium mb-6">
                <span className="flex items-center gap-2 text-white">
                  <img 
                    src={podcast.author.avatar.startsWith('http') ? podcast.author.avatar : `http://localhost:5000${podcast.author.avatar}`} 
                    className="w-6 h-6 rounded-full object-cover"
                    alt={podcast.author.name}
                  />
                  {podcast.author.name}
                </span>
                <span className="flex items-center gap-1"><Users size={16} /> {podcast.subscribersCount} Subscribers</span>
                <span className="flex items-center gap-1"><Hash size={16} /> {podcast.episodes.length} Episodes</span>
                <span className="flex items-center gap-1 uppercase"><Globe size={16} /> {podcast.language}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSubscribeToggle}
                  disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded font-bold transition-all duration-300 ${
                    isSubscribed 
                      ? 'bg-surface border border-white/20 hover:bg-white/5 text-white'
                      : 'btn-primary'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isSubscribed ? (
                      <motion.div key="subbed" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <Heart size={20} className="fill-primary text-primary" /> Subscribed
                      </motion.div>
                    ) : (
                      <motion.div key="unsubbed" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <Heart size={20} /> Subscribe
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <a 
                  href={podcast.rssUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2.5 border border-white/10 rounded hover:bg-white/5 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <span className="text-[#f26522] font-bold tracking-wider">RSS</span> Feed
                </a>

                {isAuthenticated && user?.id === podcast.author._id && (
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded font-bold bg-secondary text-black hover:bg-secondary/80 transition-all shadow-[0_0_20px_rgba(0,212,200,0.2)]"
                  >
                    <Upload size={20} /> Upload Episode
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Episodes List */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-2xl font-display tracking-wide mb-6 flex items-center gap-3">
              Episodes <span className="text-sm font-sans bg-surface text-textMuted px-2 py-0.5 rounded">{podcast.episodes.length}</span>
            </h3>
            
            <div className="space-y-3">
              {podcast.episodes.length > 0 ? (
                podcast.episodes.map((episode, i) => (
                  <EpisodeRow 
                    key={episode._id} 
                    episode={episode} 
                    podcast={podcast}
                    index={i} 
                  />
                ))
              ) : (
                <div className="p-8 text-center glass-panel rounded-xl">
                  <p className="text-textMuted">No episodes available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: About */}
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-xl font-display tracking-wide mb-4 text-primary">About</h3>
            <p className="text-textMuted leading-relaxed text-sm whitespace-pre-wrap">
              {podcast.description}
            </p>
            
            {podcast.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {podcast.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface border border-white/5 rounded-full text-xs font-mono text-textMuted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-xl font-display tracking-wide mb-4">Meet the Host</h3>
            <div className="flex items-center gap-4">
              <img 
                src={podcast.author.avatar.startsWith('http') ? podcast.author.avatar : `http://localhost:5000${podcast.author.avatar}`} 
                className="w-14 h-14 rounded-full object-cover border border-white/10"
                alt={podcast.author.name}
              />
              <div>
                <p className="font-bold">{podcast.author.name}</p>
                <p className="text-sm text-textMuted line-clamp-2 mt-1">{podcast.author.bio || 'Podcast creator on WavCast.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UploadEpisodeModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        podcasts={[podcast]}
      />
    </div>
  );
};

export default PodcastDetail;