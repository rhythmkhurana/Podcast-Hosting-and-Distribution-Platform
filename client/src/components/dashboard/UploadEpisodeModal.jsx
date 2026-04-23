import React, { useState, useRef } from 'react';
import { X, Upload, Music, Image as ImageIcon, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEpisode } from '../../api/episodeApi';

const UploadEpisodeModal = ({ isOpen, onClose, podcasts }) => {
  const queryClient = useQueryClient();
  const audioInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    podcastId: podcasts?.[0]?._id || '',
    episodeNumber: '',
    season: '1',
    isPublished: true
  });
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [duration, setDuration] = useState(0);

  const mutation = useMutation({
    mutationFn: createEpisode,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-podcasts']);
      onClose();
      setStep(1);
      setAudioFile(null);
      setThumbnail(null);
    }
  });

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.round(audio.duration));
      });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!audioFile) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('audioFile', audioFile);
    data.append('duration', duration);
    if (thumbnail) {
      data.append('thumbnail', thumbnail);
    }
    
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-4xl bg-surface/95 border border-white/10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header with Step Indicator */}
          <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-xl sm:text-3xl font-display tracking-tight text-white">
                {step === 1 ? 'Step 1: Details' : 'Step 2: Upload'}
              </h2>
              <div className="flex gap-2 mt-3">
                <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'bg-primary' : 'bg-primary/20'}`} />
                <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'bg-secondary' : 'bg-white/10'}`} />
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-textMuted hover:text-white">
              <X size={28} />
            </button>
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Episode Identity</label>
                        <input 
                          type="text" 
                          required
                          className="input-field text-xl font-display"
                          placeholder="What is the name of this episode?"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-3">The Story (Description)</label>
                        <textarea 
                          required
                          className="input-field min-h-[160px] resize-none"
                          placeholder="Describe what happens in this episode..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-3">Belongs to Podcast Series</label>
                        <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                          {podcasts?.map(p => (
                            <button
                              key={p._id}
                              type="button"
                              onClick={() => setFormData({...formData, podcastId: p._id})}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 group ${
                                formData.podcastId === p._id 
                                  ? 'bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(245,166,35,0.1)]' 
                                  : 'bg-white/5 border-white/5 hover:border-white/20'
                              }`}
                            >
                              <img src={p.coverImage.startsWith('http') ? p.coverImage : `http://localhost:5000${p.coverImage}`} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="text-xs font-bold truncate">{p.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-3">Season</label>
                          <input 
                            type="number" 
                            className="input-field"
                            placeholder="1"
                            value={formData.season}
                            onChange={(e) => setFormData({...formData, season: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-3">Episode #</label>
                          <input 
                            type="number" 
                            className="input-field"
                            placeholder="1"
                            value={formData.episodeNumber}
                            onChange={(e) => setFormData({...formData, episodeNumber: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      disabled={!formData.title || !formData.description || !formData.podcastId}
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-3 px-10 py-5 rounded-2xl text-lg group disabled:opacity-30 disabled:grayscale transition-all"
                    >
                      Continue to Upload <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Media Upload (The "Podcast" from gallery) */}
                    <div className="lg:col-span-3">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Select Audio File</label>
                      <div 
                        onClick={() => audioInputRef.current.click()}
                        className={`aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center bg-white/5 relative overflow-hidden group ${
                          audioFile ? 'border-secondary/50 bg-secondary/5' : 'border-white/10 hover:border-secondary/30'
                        }`}
                      >
                        <input 
                          ref={audioInputRef}
                          type="file" 
                          className="hidden" 
                          accept="audio/*" 
                          onChange={handleAudioChange}
                        />
                        {audioFile ? (
                          <div className="text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                              <Music className="text-secondary" size={40} />
                            </div>
                            <p className="font-display text-2xl text-white mb-2">{audioFile.name}</p>
                            <div className="flex items-center justify-center gap-4 text-textMuted font-mono text-sm">
                              <span>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                              <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center group-hover:scale-110 transition-transform duration-500">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/10 transition-colors">
                              <Upload className="text-textMuted group-hover:text-secondary transition-colors" size={48} />
                            </div>
                            <p className="text-2xl font-display text-white">Select Audio from Gallery</p>
                            <p className="text-textMuted mt-2">MP3, WAV, or OGG preferred</p>
                          </div>
                        )}
                        {audioFile && (
                          <div className="absolute top-4 right-4 bg-green-500 text-black p-1.5 rounded-full">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Optional Thumbnail */}
                    <div className="lg:col-span-2 space-y-6">
                      <label className="block text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-2">Visual Art (Optional)</label>
                      <div 
                        onClick={() => document.getElementById('ep-thumb').click()}
                        className="aspect-square rounded-[2rem] border border-white/10 hover:border-secondary/20 transition-all cursor-pointer flex flex-col items-center justify-center bg-white/2 relative overflow-hidden group"
                      >
                        {thumbnailPreview ? (
                          <>
                            <img src={thumbnailPreview} alt="Thumb" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <ImageIcon className="text-textMuted mb-3 mx-auto" size={32} />
                            <p className="text-xs font-bold uppercase tracking-widest text-textMuted">Upload Thumbnail</p>
                          </div>
                        )}
                      </div>
                      <input 
                        id="ep-thumb" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 px-8 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowLeft size={20} /> Back to Details
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={mutation.isPending || !audioFile}
                      className="flex-[2] py-5 px-8 rounded-2xl font-bold bg-secondary text-black hover:bg-secondary/90 transition-all shadow-[0_0_30px_rgba(0,212,200,0.3)] disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                      {mutation.isPending ? (
                        <>Publishing your story...</>
                      ) : (
                        <>Publish Episode <CheckCircle2 size={20} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mutation.isError && (
              <div className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
                <AlertCircle size={24} />
                <p className="font-medium">{mutation.error?.message || 'Failed to upload. Please try again.'}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadEpisodeModal;
