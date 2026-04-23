import Episode from '../models/Episode.js';
import Podcast from '../models/Podcast.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all episodes for a podcast
// @route   GET /api/episodes/podcast/:podcastId
// @access  Public
export const getEpisodesByPodcast = async (req, res, next) => {
  try {
    const episodes = await Episode.find({ 
      podcast: req.params.podcastId,
      isPublished: true 
    }).sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: episodes.length,
      data: episodes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single episode
// @route   GET /api/episodes/:id
// @access  Public
export const getEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id).populate('podcast', 'title coverImage author');

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    res.status(200).json({
      success: true,
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload episode
// @route   POST /api/episodes
// @access  Private (Creator)
export const createEpisode = async (req, res, next) => {
  try {
    const { title, description, duration, podcastId, episodeNumber, season, isPublished } = req.body;
    
    // Find the podcast and check ownership
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    if (podcast.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add episode to this podcast' });
    }

    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({ success: false, message: 'Please upload an audio file' });
    }

    const audioFileUrl = `/uploads/audio/${req.files.audioFile[0].filename}`;
    const fileSize = req.files.audioFile[0].size;

    let thumbnailUrl = null;
    if (req.files.thumbnail) {
      thumbnailUrl = `/uploads/images/${req.files.thumbnail[0].filename}`;
    }

    const episode = await Episode.create({
      title,
      description,
      audioFile: audioFileUrl,
      duration: duration || 0,
      podcast: podcastId,
      episodeNumber,
      season,
      isPublished: isPublished === undefined ? true : isPublished,
      thumbnail: thumbnailUrl,
      fileSize,
      publishedAt: isPublished !== false ? Date.now() : undefined
    });

    // Add episode to podcast
    podcast.episodes.push(episode._id);
    await podcast.save();

    res.status(201).json({
      success: true,
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update episode
// @route   PUT /api/episodes/:id
// @access  Private (Creator)
export const updateEpisode = async (req, res, next) => {
  try {
    let episode = await Episode.findById(req.params.id).populate('podcast');

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    if (episode.podcast.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this episode' });
    }

    const updateData = { ...req.body };
    
    if (req.files) {
      if (req.files.audioFile) {
        updateData.audioFile = `/uploads/audio/${req.files.audioFile[0].filename}`;
        updateData.fileSize = req.files.audioFile[0].size;
      }
      if (req.files.thumbnail) {
        updateData.thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
      }
    }

    episode = await Episode.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete episode
// @route   DELETE /api/episodes/:id
// @access  Private (Creator)
export const deleteEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id).populate('podcast');

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    if (episode.podcast.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this episode' });
    }

    // Remove from podcast
    const podcast = await Podcast.findById(episode.podcast._id);
    podcast.episodes = podcast.episodes.filter(ep => ep.toString() !== episode._id.toString());
    await podcast.save();

    await episode.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment play count
// @route   POST /api/episodes/:id/play
// @access  Public
export const incrementPlayCount = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    episode.playCount += 1;
    await episode.save();

    res.status(200).json({
      success: true,
      data: { playCount: episode.playCount },
    });
  } catch (error) {
    next(error);
  }
};
