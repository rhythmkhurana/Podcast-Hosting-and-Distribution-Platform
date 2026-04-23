import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import PageWrapper from './components/layout/PageWrapper';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GlobalAudioPlayer from './components/player/GlobalAudioPlayer';

// Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import PodcastDetail from './pages/PodcastDetail';
import EpisodePlayer from './pages/EpisodePlayer';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PageWrapper />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="podcast/:id" element={<PodcastDetail />} />
          <Route path="podcast/:podcastId/episode/:id" element={<EpisodePlayer />} />
          
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected Routes - All Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Protected Routes - Creators & Admins */}
          <Route element={<ProtectedRoute allowedRoles={['creator', 'admin']} />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      {/* Global Persistent Player */}
      <GlobalAudioPlayer />
    </Router>
  );
}

export default App;
