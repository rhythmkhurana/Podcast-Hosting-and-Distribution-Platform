import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getMySubscriptions } from '../api/subscriptionApi';
import PodcastCard from '../components/podcast/PodcastCard';
import { Settings, Save, Mic, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, becomeCreator } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgraded, setUpgraded] = useState(false);

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getMySubscriptions,
    enabled: true,
  });

  const subscriptions = subsData?.data || [];

  const handleBecomeCreator = async () => {
    setUpgrading(true);
    setUpgradeError('');
    try {
      await becomeCreator();
      setUpgraded(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setUpgradeError(typeof err === 'string' ? err : 'Something went wrong.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-background to-secondary/20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end mt-12">
          <div className="relative">
            <img 
              src={user?.avatar?.startsWith('http') ? user.avatar : `http://localhost:5000${user?.avatar}`} 
              alt={user?.name}
              className="w-32 h-32 rounded-2xl border-4 border-surface object-cover bg-surface"
              onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=F5A623&color=000' }}
            />
            {isEditing && (
              <button className="absolute bottom-2 right-2 bg-primary text-black p-1.5 rounded-lg shadow-lg">
                <Settings size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display tracking-wide">{user?.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                user?.role === 'creator' 
                  ? 'bg-primary/20 border-primary/30 text-primary' 
                  : 'bg-surface border-white/10 text-textMuted'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-textMuted mb-4">{user?.email}</p>
            {user?.bio && <p className="max-w-xl text-sm">{user.bio}</p>}
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-outline self-start md:self-end text-sm"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="glass-panel p-8 rounded-2xl mb-8">
          <h3 className="text-xl font-display mb-6">Edit Profile</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-textMuted mb-1">Name</label>
              <input type="text" className="input-field" defaultValue={user?.name} />
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-1">Bio</label>
              <textarea className="input-field min-h-[100px]" defaultValue={user?.bio}></textarea>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Become a Creator — only show for listeners */}
      {user?.role === 'listener' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-secondary/5"
        >
          <div className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Mic size={32} className="text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-display tracking-wide mb-1">Start Your Podcast</h2>
              <p className="text-textMuted text-sm">
                Upgrade your account to Creator to publish podcasts, upload episodes, and grow your audience — all for free, no new account needed.
              </p>
              {upgradeError && (
                <p className="text-red-400 text-sm mt-2">{upgradeError}</p>
              )}
            </div>
            <button
              onClick={handleBecomeCreator}
              disabled={upgrading || upgraded}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 shrink-0 ${
                upgraded
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'btn-primary'
              }`}
            >
              {upgraded ? (
                <><CheckCircle size={18} /> Upgraded! Redirecting...</>
              ) : upgrading ? (
                <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Upgrading...</>
              ) : (
                <>Become a Creator <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Subscriptions */}
      <div>
        <h2 className="text-3xl font-display tracking-wide mb-6">Your Subscriptions</h2>
        
        {subsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl text-textMuted">
            You haven't subscribed to any podcasts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map(sub => (
              <PodcastCard key={sub.podcast._id} podcast={sub.podcast} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;