import Subscription from '../models/Subscription.js';
import Podcast from '../models/Podcast.js';

// @desc    Get my subscriptions
// @route   GET /api/subscriptions/my
// @access  Private
export const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate({
        path: 'podcast',
        select: 'title coverImage category author',
        populate: {
          path: 'author',
          select: 'name'
        }
      });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to podcast
// @route   POST /api/subscriptions/:podcastId
// @access  Private
export const subscribeToPodcast = async (req, res, next) => {
  try {
    const podcastId = req.params.podcastId;

    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    const existingSub = await Subscription.findOne({ user: req.user.id, podcast: podcastId });

    if (existingSub) {
      return res.status(400).json({ success: false, message: 'Already subscribed to this podcast' });
    }

    const subscription = await Subscription.create({
      user: req.user.id,
      podcast: podcastId,
    });

    podcast.subscribersCount += 1;
    await podcast.save();

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe from podcast
// @route   DELETE /api/subscriptions/:podcastId
// @access  Private
export const unsubscribeFromPodcast = async (req, res, next) => {
  try {
    const podcastId = req.params.podcastId;

    const subscription = await Subscription.findOne({ user: req.user.id, podcast: podcastId });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Not subscribed to this podcast' });
    }

    await subscription.deleteOne();

    const podcast = await Podcast.findById(podcastId);
    if (podcast) {
      podcast.subscribersCount = Math.max(0, podcast.subscribersCount - 1);
      await podcast.save();
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
