import express from 'express';
import {
  getEpisodesByPodcast,
  getEpisode,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  incrementPlayCount
} from '../controllers/episodeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/podcast/:podcastId', getEpisodesByPodcast);
router.post('/:id/play', incrementPlayCount);

router.route('/')
  .post(
    protect, 
    authorize('creator', 'admin'), 
    upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), 
    createEpisode
  );

router.route('/:id')
  .get(getEpisode)
  .put(
    protect, 
    authorize('creator', 'admin'), 
    upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), 
    updateEpisode
  )
  .delete(protect, authorize('creator', 'admin'), deleteEpisode);

export default router;
