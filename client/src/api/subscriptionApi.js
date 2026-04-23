import api from './axios';

export const getMySubscriptions = async () => {
  const { data } = await api.get('/subscriptions/my');
  return data;
};

export const subscribeToPodcast = async (podcastId) => {
  const { data } = await api.post(`/subscriptions/${podcastId}`);
  return data;
};

export const unsubscribeFromPodcast = async (podcastId) => {
  const { data } = await api.delete(`/subscriptions/${podcastId}`);
  return data;
};
