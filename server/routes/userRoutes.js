import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getUserPodcasts,
  becomeCreator
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/:id/profile', getUserProfile);
router.get('/:id/podcasts', getUserPodcasts);

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/become-creator', protect, becomeCreator);

export default router;
