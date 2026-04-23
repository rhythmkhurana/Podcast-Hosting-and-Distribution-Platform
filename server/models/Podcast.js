import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  tags: {
    type: [String],
    default: [],
  },
  language: {
    type: String,
    default: 'en',
  },
  coverImage: {
    type: String,
    default: 'default_podcast.png',
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  episodes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Episode',
  }],
  subscribersCount: {
    type: Number,
    default: 0,
  },
  isExplicit: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'active',
  },
  rssUrl: {
    type: String,
  }
}, { timestamps: true });

const Podcast = mongoose.model('Podcast', podcastSchema);
export default Podcast;
