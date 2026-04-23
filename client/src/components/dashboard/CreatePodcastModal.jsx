import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPodcast } from '../../api/podcastApi';

const CATEGORIES = [
  'Technology', 'True Crime', 'Education', 'Comedy', 
  'Business', 'Health', 'Society', 'Sports'
];

const CreatePodcastModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    tags: '',
    language: 'English',
    isExplicit: false
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const mutation = useMutation({
    mutationFn: createPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-podcasts']);
      onClose();
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        data.append(key, JSON.stringify(formData[key].split(',').map(t => t.trim())));
      } else {
        data.append(key, formData[key]);
      }
    });
    if (coverImage) {
      data.append('coverImage', coverImage);
    }
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-2xl font-display tracking-wide">Create New Podcast</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-textMuted uppercase tracking-wider">Cover Image</label>
                <div 
                  onClick={() => document.getElementById('podcast-cover').click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden bg-white/5 group"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={32} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <Upload size={40} className="mx-auto mb-4 text-textMuted group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium">Click to upload cover art</p>
                      <p className="text-xs text-textMuted mt-2">Recommended: 1400x1400px (JPG/PNG)</p>
                    </div>
                  )}
                </div>
                <input 
                  id="podcast-cover" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>

              {/* Right Column: Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Podcast Title</label>
                  <input 
                    type="text" 
                    required
                    className="input-field w-full"
                    placeholder="The Future of Tech"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Category</label>
                  <select 
                    className="input-field w-full"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Language</label>
                  <input 
                    type="text" 
                    className="input-field w-full"
                    placeholder="English"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  required
                  className="input-field w-full min-h-[120px]"
                  placeholder="Tell your listeners what your show is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  placeholder="tech, coding, web3"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <input 
                  type="checkbox" 
                  id="explicit"
                  className="w-5 h-5 rounded border-white/10 bg-background text-primary focus:ring-primary/20"
                  checked={formData.isExplicit}
                  onChange={(e) => setFormData({...formData, isExplicit: e.target.checked})}
                />
                <label htmlFor="explicit" className="text-sm font-medium">This podcast contains explicit content</label>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-primary text-black hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Creating...' : 'Create Podcast'}
              </button>
            </div>

            {mutation.isError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertCircle size={20} />
                <p className="text-sm">{mutation.error?.message || 'Failed to create podcast'}</p>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePodcastModal;
