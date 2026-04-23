import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPodcasts, deletePodcast } from '../api/podcastApi';
import { deleteEpisode } from '../api/episodeApi';
import { LayoutDashboard, Mic, PlaySquare, BarChart3, Plus, Upload, Trash2, Edit2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import getMediaUrl from '../utils/getMediaUrl';
import usePlayerStore from '../store/playerStore';
import CreatePodcastModal from '../components/dashboard/CreatePodcastModal';
import UploadEpisodeModal from '../components/dashboard/UploadEpisodeModal';

const OverviewTab = ({ podcasts }) => {
  const totalEpisodes = podcasts?.reduce((acc, p) => acc + (p.episodes?.length || 0), 0) || 0;
  const totalSubscribers = podcasts?.reduce((acc, p) => acc + (p.subscribersCount || 0), 0) || 0;
  const totalPlays = podcasts?.reduce((acc, p) => {
    return acc + (p.episodes?.reduce((sum, ep) => sum + (ep.playCount || 0), 0) || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Plays', value: totalPlays, icon: PlaySquare, color: 'text-secondary' },
          { label: 'Total Subscribers', value: totalSubscribers, icon: Mic, color: 'text-primary' },
          { label: 'Total Episodes', value: totalEpisodes, icon: LayoutDashboard, color: 'text-white' },
          { label: 'Avg Duration', value: '---', icon: BarChart3, color: 'text-textMuted' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <p className="text-textMuted text-sm font-medium">{stat.label}</p>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-4xl font-display tracking-widest">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="glass-panel p-6 rounded-xl min-h-[300px] flex items-center justify-center">
        <div className="text-center text-textMuted">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
          <p>Analytics Chart Placeholder</p>
          <p className="text-sm">(Recharts implementation goes here)</p>
        </div>
      </div>
    </div>
  );
};

const PodcastsTab = ({ podcasts, onNewPodcast, onDeletePodcast }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display tracking-wide">My Podcasts</h3>
        <button 
          onClick={onNewPodcast}
          className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm"
        >
          <Plus size={16} /> New Podcast
        </button>
      </div>

      <div className="grid gap-4">
        {podcasts?.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl text-textMuted">
            You haven't created any podcasts yet.
          </div>
        ) : (
          podcasts?.map(podcast => (
            <div key={podcast._id} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 group">
              <img 
                src={getMediaUrl(podcast.coverImage)} 
                alt={podcast.title} 
                className="w-20 h-20 md:w-16 md:h-16 rounded-lg object-cover shadow-lg"
              />
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{podcast.title}</h4>
                <p className="text-sm text-textMuted">{podcast.category} • {podcast.subscribersCount} subscribers • {podcast.episodes?.length || 0} episodes</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-primary transition-all">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDeletePodcast(podcast._id, podcast.title)}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EpisodesTab = ({ podcasts, onUploadEpisode, onDeleteEpisode }) => {
  const { setEpisode } = usePlayerStore();
  const allEpisodes = podcasts?.flatMap(p => 
    p.episodes?.map(ep => ({ ...ep, podcastTitle: p.title, podcastObj: p })) || []
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display tracking-wide">Episodes</h3>
        <button 
          onClick={onUploadEpisode}
          className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm bg-secondary shadow-[0_0_15px_rgba(0,212,200,0.3)] hover:shadow-[0_0_25px_rgba(0,212,200,0.6)]"
        >
          <Upload size={16} /> Upload Episode
        </button>
      </div>
      <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-textMuted uppercase tracking-wider text-xs">Title</th>
                <th className="p-4 font-medium text-textMuted uppercase tracking-wider text-xs hidden md:table-cell">Podcast</th>
                <th className="p-4 font-medium text-textMuted uppercase tracking-wider text-xs text-center">Plays</th>
                <th className="p-4 font-medium text-textMuted uppercase tracking-wider text-xs hidden sm:table-cell">Date</th>
                <th className="p-4 font-medium text-textMuted uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allEpisodes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-textMuted">
                    <div className="flex flex-col items-center gap-3">
                      <PlaySquare size={40} className="opacity-10" />
                      <p>No episodes uploaded yet.</p>
                      {podcasts?.length > 0 && (
                        <button onClick={onUploadEpisode} className="text-secondary text-xs font-bold uppercase tracking-widest hover:underline">
                          Upload your first episode
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                allEpisodes.map(episode => (
                  <tr key={episode._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setEpisode(episode, episode.podcastObj)}
                          className="w-8 h-8 rounded bg-surface border border-white/10 flex items-center justify-center group-hover:border-secondary/50 transition-colors"
                        >
                          <Play size={12} className="text-secondary" />
                        </button>
                        <span className="font-medium group-hover:text-white transition-colors">{episode.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-textMuted hidden md:table-cell">{episode.podcastTitle}</td>
                    <td className="p-4 text-center">
                      <span className="bg-surface px-2 py-1 rounded-full text-xs font-mono text-secondary">
                        {episode.playCount || 0}
                      </span>
                    </td>
                    <td className="p-4 text-textMuted hidden sm:table-cell text-xs">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {episode.createdAt ? new Date(episode.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {episode.createdAt ? new Date(episode.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:text-primary transition-colors"><Edit2 size={14} /></button>
                        <button 
                          onClick={() => onDeleteEpisode(episode._id, episode.title)}
                          className="p-1.5 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-podcasts'],
    queryFn: getMyPodcasts
  });

  const podcasts = data?.data || [];
  const queryClient = useQueryClient();

  const deletePodcastMutation = useMutation({
    mutationFn: deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-podcasts']);
    }
  });

  const deleteEpisodeMutation = useMutation({
    mutationFn: deleteEpisode,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-podcasts']);
    }
  });

  const handleDeletePodcast = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will delete all episodes within it.`)) {
      deletePodcastMutation.mutate(id);
    }
  };

  const handleDeleteEpisode = (id, title) => {
    if (window.confirm(`Are you sure you want to delete episode "${title}"?`)) {
      deleteEpisodeMutation.mutate(id);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'podcasts', label: 'My Podcasts', icon: Mic },
    { id: 'episodes', label: 'Episodes', icon: PlaySquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display tracking-tight mb-2 text-primary drop-shadow-sm">Creator Dashboard</h1>
          <p className="text-textMuted text-lg max-w-xl">Manage your content, monitor growth, and connect with your audience.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPodcastModalOpen(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Plus size={20} /> New Podcast
          </button>
          <button 
            onClick={() => setIsEpisodeModalOpen(true)}
            disabled={podcasts.length === 0}
            className="btn-primary flex items-center gap-2 bg-secondary shadow-[0_0_20px_rgba(0,212,200,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} /> Upload Episode
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="glass-panel rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all text-sm font-bold uppercase tracking-widest whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(245,166,35,0.1)]' 
                    : 'text-textMuted hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {activeTab === 'overview' && <OverviewTab podcasts={podcasts} />}
              {activeTab === 'podcasts' && (
                <PodcastsTab 
                  podcasts={podcasts} 
                  onNewPodcast={() => setIsPodcastModalOpen(true)} 
                  onDeletePodcast={handleDeletePodcast}
                />
              )}
              {activeTab === 'episodes' && (
                <EpisodesTab 
                  podcasts={podcasts} 
                  onUploadEpisode={() => setIsEpisodeModalOpen(true)} 
                  onDeleteEpisode={handleDeleteEpisode}
                />
              )}
              {activeTab === 'analytics' && (
                <div className="glass-panel p-12 rounded-3xl text-center text-textMuted border border-white/5">
                  <BarChart3 size={64} className="mx-auto mb-6 opacity-10" />
                  <h3 className="text-2xl font-display mb-2 text-white">Analytics Coming Soon</h3>
                  <p className="max-w-md mx-auto">We're building detailed insights to help you understand your listeners and grow your reach.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CreatePodcastModal 
        isOpen={isPodcastModalOpen} 
        onClose={() => setIsPodcastModalOpen(false)} 
      />
      
      <UploadEpisodeModal 
        isOpen={isEpisodeModalOpen} 
        onClose={() => setIsEpisodeModalOpen(false)} 
        podcasts={podcasts}
      />
    </div>
  );
};

export default Dashboard;