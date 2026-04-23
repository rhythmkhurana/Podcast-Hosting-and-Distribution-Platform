import api from './axios';

export const getPodcasts = async (params) => {
  const { data } = await api.get('/podcasts', { params });
  return data;
};

export const getTrendingPodcasts = async () => {
  const { data } = await api.get('/podcasts/trending');
  return data;
};

export const getFeaturedPodcasts = async () => {
  const { data } = await api.get('/podcasts/featured');
  return data;
};

export const getPodcastById = async (id) => {
  const { data } = await api.get(`/podcasts/${id}`);
  return data;
};

export const createPodcast = async (podcastData) => {
  const { data } = await api.post('/podcasts', podcastData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const getMyPodcasts = async () => {
  const { data } = await api.get('/podcasts/my/all');
  return data;
};

export const updatePodcast = async (id, podcastData) => {
  const { data } = await api.put(`/podcasts/${id}`, podcastData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deletePodcast = async (id) => {
  const { data } = await api.delete(`/podcasts/${id}`);
  return data;
};
