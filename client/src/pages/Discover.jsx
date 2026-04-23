import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getPodcasts } from '../api/podcastApi';
import useDebounce from '../hooks/useDebounce';
import PodcastCard from '../components/podcast/PodcastCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All', 'Technology', 'True Crime', 'Education', 'Comedy', 
  'Business', 'Health', 'Society', 'Sports'
];

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'latest';

  const { data, isLoading } = useQuery({
    queryKey: ['podcasts', { category: currentCategory, search: debouncedSearch, sort: currentSort }],
    queryFn: () => getPodcasts({
      category: currentCategory !== 'All' ? currentCategory : undefined,
      search: debouncedSearch || undefined,
      sort: currentSort
    })
  });

  // Update URL params when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }, [debouncedSearch, setSearchParams]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category !== 'All') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    setSearchParams(params);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-8">
        <div className="sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-xl font-display tracking-wide">
            <Filter size={20} className="text-primary" />
            Filters
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-textMuted mb-3 uppercase tracking-wider">Categories</h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`text-left px-4 py-2 rounded transition-colors text-sm font-medium ${
                      currentCategory === category 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'text-textMain hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar: Search & Sort */}
        <div className="glass-panel p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-20 z-40 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
            <input 
              type="text" 
              placeholder="Search podcasts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface/80 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SlidersHorizontal size={18} className="text-textMuted" />
            <select 
              value={currentSort}
              onChange={handleSortChange}
              className="bg-surface border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-auto appearance-none"
            >
              <option value="latest">Latest Updates</option>
              <option value="popular">Most Popular</option>
              <option value="a-z">A - Z</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20 bg-surface/30 rounded-xl border border-white/5">
            <Search className="mx-auto h-12 w-12 text-textMuted mb-4 opacity-50" />
            <h3 className="text-xl font-display tracking-wide mb-2">No podcasts found</h3>
            <p className="text-textMuted">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {data?.data?.map((podcast, i) => (
              <div 
                key={podcast._id} 
                className={`${i % 2 !== 0 ? 'sm:mt-8' : ''}`} // Asymmetric offset layout
              >
                <PodcastCard podcast={podcast} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;