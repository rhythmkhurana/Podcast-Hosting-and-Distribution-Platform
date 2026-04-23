import express from 'express';
import {
  getPodcasts,
  getTrendingPodcasts,
  getFeaturedPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
  getMyPodcasts,
  generateRSS
} from '../controllers/podcastController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingPodcasts);
router.get('/featured', getFeaturedPodcasts);
router.get('/my/all', protect, authorize('creator', 'admin'), getMyPodcasts);
router.get('/:id/rss', generateRSS);

router.route('/')
  .get(getPodcasts)
  .post(protect, authorize('creator', 'admin'), upload.single('coverImage'), createPodcast);

router.route('/:id')
  .get(getPodcast)
  .put(protect, authorize('creator', 'admin'), upload.single('coverImage'), updatePodcast)
  .delete(protect, authorize('creator', 'admin'), deletePodcast);

export default router;
