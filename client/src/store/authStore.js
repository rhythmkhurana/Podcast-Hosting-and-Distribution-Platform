import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      set({ 
        user: response.data.user, 
        isAuthenticated: true,
        accessToken: response.data.accessToken 
      });
      // Attach token to subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      set({ 
        user: response.data.user, 
        isAuthenticated: true,
        accessToken: response.data.accessToken 
      });
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ user: null, isAuthenticated: false, accessToken: null });
      delete api.defaults.headers.common['Authorization'];
    }
  },

  checkAuth: async () => {
    try {
      // First try to use the existing refresh token cookie to get a new access token
      const response = await api.post('/auth/refresh-token');
      const { accessToken } = response.data;
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Then fetch user data
      const meResponse = await api.get('/auth/me');
      
      set({ 
        user: meResponse.data.user, 
        isAuthenticated: true, 
        accessToken,
        isLoading: false 
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, accessToken: null, isLoading: false });
    }
  },

  becomeCreator: async () => {
    try {
      const response = await api.put('/users/become-creator');
      set({ user: response.data.data });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to upgrade account';
    }
  },
}));

// Setup Axios interceptor to automatically handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      try {
        const response = await api.post('/auth/refresh-token');
        const { accessToken } = response.data;
        useAuthStore.setState({ accessToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.setState({ user: null, isAuthenticated: false, accessToken: null });
        delete api.defaults.headers.common['Authorization'];
        // Redirect logic can be handled in a component or hook listening to the store
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default useAuthStore;
