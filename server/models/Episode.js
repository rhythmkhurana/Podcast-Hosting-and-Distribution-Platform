import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  audioFile: {
    type: String,
    required: [true, 'Please add an audio file'],
  },
  duration: {
    type: Number,
    default: 0, // in seconds
  },
  podcast: {
    type: mongoose.Schema.ObjectId,
    ref: 'Podcast',
    required: true,
  },
  episodeNumber: {
    type: Number,
  },
  season: {
    type: Number,
  },
  transcript: {
    type: String,
  },
  playCount: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  thumbnail: {
    type: String,
  },
  fileSize: {
    type: Number,
  }
}, { timestamps: true });

const Episode = mongoose.model('Episode', episodeSchema);
export default Episode;
