import express from 'express';
import {
  getMySubscriptions,
  subscribeToPodcast,
  unsubscribeFromPodcast
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMySubscriptions);
router.post('/:podcastId', subscribeToPodcast);
router.delete('/:podcastId', unsubscribeFromPodcast);

export default router;
