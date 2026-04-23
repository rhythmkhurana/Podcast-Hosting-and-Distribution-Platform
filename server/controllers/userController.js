import User from '../models/User.js';
import Podcast from '../models/Podcast.js';

// @desc    Get user profile (public)
// @route   GET /api/users/:id/profile
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    let updateData = { name, bio };

    if (req.file) {
      updateData.avatar = `/uploads/images/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get creator's public podcasts
// @route   GET /api/users/:id/podcasts
// @access  Public
export const getUserPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find({ author: req.params.id, status: 'active' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: podcasts.length,
      data: podcasts,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Upgrade current user's role to creator
// @route   PUT /api/users/become-creator
// @access  Private
export const becomeCreator = async (req, res, next) => {
  try {
    if (req.user.role === 'creator' || req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'You are already a creator.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: 'creator' },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
