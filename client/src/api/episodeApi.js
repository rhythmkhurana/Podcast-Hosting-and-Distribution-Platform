import api from './axios';

export const getEpisodesByPodcast = async (podcastId) => {
  const { data } = await api.get(`/episodes/podcast/${podcastId}`);
  return data;
};

export const createEpisode = async (episodeData) => {
  const { data } = await api.post('/episodes', episodeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateEpisode = async (id, episodeData) => {
  const { data } = await api.put(`/episodes/${id}`, episodeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deleteEpisode = async (id) => {
  const { data } = await api.delete(`/episodes/${id}`);
  return data;
};

export const incrementPlayCount = async (id) => {
  const { data } = await api.post(`/episodes/${id}/play`);
  return data;
};
