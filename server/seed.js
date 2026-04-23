import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Podcast from './models/Podcast.js';
import Episode from './models/Episode.js';
import Subscription from './models/Subscription.js';
import connectDB from './config/db.js';

dotenv.config();

// Fixed ObjectIds — so URLs never change across server restarts
const IDS = {
  users: {
    creator1: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
    creator2: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaab'),
    listener1: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaac'),
  },
  podcasts: {
    techTalk:    new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb01'),
    futureWeb:   new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb02'),
    trueCrime:   new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb03'),
    startup:     new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb04'),
    learnFast:   new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb05'),
    health:      new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb06'),
    society:     new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb07'),
    sports:      new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbb08'),
  },
  episodes: {
    react19:     new mongoose.Types.ObjectId('cccccccccccccccccccccc01'),
    zustand:     new mongoose.Types.ObjectId('cccccccccccccccccccccc02'),
    mystery:     new mongoose.Types.ObjectId('cccccccccccccccccccccc03'),
    learning:    new mongoose.Types.ObjectId('cccccccccccccccccccccc04'),
    nutrition:   new mongoose.Types.ObjectId('cccccccccccccccccccccc05'),
    socialMedia: new mongoose.Types.ObjectId('cccccccccccccccccccccc06'),
    nba:         new mongoose.Types.ObjectId('cccccccccccccccccccccc07'),
    webTrends:   new mongoose.Types.ObjectId('cccccccccccccccccccccc08'),
    founders:    new mongoose.Types.ObjectId('cccccccccccccccccccccc09'),
  },
};

const AUDIO = {
  s1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  s2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  s3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
};

export const seedData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Podcast.deleteMany();
    await Episode.deleteMany();
    await Subscription.deleteMany();

    // Create a permanent test user for the USER
    const testUserExists = await User.findOne({ email: 'rhythmkhuranaofficial@gmail.com' });
    if (!testUserExists) {
      await User.create({
        name: 'Rhythm Khurana',
        email: 'rhythmkhuranaofficial@gmail.com',
        password: 'password123',
        role: 'creator'
      });
      console.log('Test user created: rhythmkhuranaofficial@gmail.com / password123');
    }

    // Create Users with fixed IDs
    await User.create([
      {
        _id: IDS.users.creator1,
        name: 'Creator One',
        email: 'creator1@wavcast.com',
        password: 'password123',
        role: 'creator',
        bio: 'Tech enthusiast and podcaster.',
      },
      {
        _id: IDS.users.creator2,
        name: 'Creator Two',
        email: 'creator2@wavcast.com',
        password: 'password123',
        role: 'creator',
        bio: 'True crime investigator and storyteller.',
      },
      {
        _id: IDS.users.listener1,
        name: 'Listener One',
        email: 'listener1@wavcast.com',
        password: 'password123',
        role: 'listener',
      },
    ]);

    // Create Episodes with fixed IDs
    await Episode.create([
      { _id: IDS.episodes.react19,     title: 'Introduction to React 19',           description: 'What is new in React 19.',                     audioFile: AUDIO.s1, duration: 372,  podcast: IDS.podcasts.techTalk,  episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.zustand,     title: 'Understanding Zustand',              description: 'State management made easy.',                   audioFile: AUDIO.s2, duration: 420,  podcast: IDS.podcasts.techTalk,  episodeNumber: 2, season: 1 },
      { _id: IDS.episodes.webTrends,   title: 'Web Trends in 2025',                 description: 'The future of the web.',                        audioFile: AUDIO.s3, duration: 540,  podcast: IDS.podcasts.futureWeb, episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.mystery,     title: 'The Mystery of the Missing Code',    description: 'A developer goes missing...',                   audioFile: AUDIO.s1, duration: 900,  podcast: IDS.podcasts.trueCrime, episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.founders,    title: 'Building a Product from Scratch',    description: 'Founders share their stories.',                 audioFile: AUDIO.s2, duration: 780,  podcast: IDS.podcasts.startup,   episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.learning,    title: 'Top 10 Learning Strategies',         description: 'How to learn efficiently.',                     audioFile: AUDIO.s3, duration: 600,  podcast: IDS.podcasts.learnFast, episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.nutrition,   title: 'Nutrition Basics',                   description: 'What you need to know about your diet.',        audioFile: AUDIO.s2, duration: 850,  podcast: IDS.podcasts.health,    episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.socialMedia, title: 'The Impact of Social Media',         description: 'How social media shapes our society.',          audioFile: AUDIO.s1, duration: 1200, podcast: IDS.podcasts.society,   episodeNumber: 1, season: 1 },
      { _id: IDS.episodes.nba,         title: 'NBA Playoffs Preview',               description: 'Who will win the championship?',                audioFile: AUDIO.s3, duration: 1500, podcast: IDS.podcasts.sports,    episodeNumber: 1, season: 1 },
    ]);

    // Create Podcasts with fixed IDs and pre-linked episodes
    await Podcast.create([
      {
        _id: IDS.podcasts.techTalk,
        title: 'Tech Talk Daily',
        description: 'Your daily dose of tech news and developer insights.',
        category: 'Technology',
        author: IDS.users.creator1,
        subscribersCount: 1,
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.react19, IDS.episodes.zustand],
      },
      {
        _id: IDS.podcasts.futureWeb,
        title: 'Future Web',
        description: 'Exploring web development trends and the future of the internet.',
        category: 'Technology',
        author: IDS.users.creator1,
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.webTrends],
      },
      {
        _id: IDS.podcasts.trueCrime,
        title: 'True Crime Stories',
        description: 'Unsolved mysteries and deep investigative dives.',
        category: 'True Crime',
        author: IDS.users.creator2,
        coverImage: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.mystery],
      },
      {
        _id: IDS.podcasts.startup,
        title: 'Startup Journey',
        description: 'Interviews with founders and entrepreneurs.',
        category: 'Business',
        author: IDS.users.creator1,
        coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.founders],
      },
      {
        _id: IDS.podcasts.learnFast,
        title: 'Learn Fast',
        description: 'Educational bits on the go.',
        category: 'Education',
        author: IDS.users.creator2,
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.learning],
      },
      {
        _id: IDS.podcasts.health,
        title: 'Healthy Mind & Body',
        description: 'Tips for a healthier, happier life.',
        category: 'Health',
        author: IDS.users.creator1,
        coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.nutrition],
      },
      {
        _id: IDS.podcasts.society,
        title: 'Society Today',
        description: 'Deep dives into modern culture and society.',
        category: 'Society',
        author: IDS.users.creator2,
        coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.socialMedia],
      },
      {
        _id: IDS.podcasts.sports,
        title: 'Sports Weekly',
        description: 'Weekly recap of all things sports.',
        category: 'Sports',
        author: IDS.users.creator1,
        coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        episodes: [IDS.episodes.nba],
      },
    ]);

    // Create Subscriptions
    await Subscription.create([
      { user: IDS.users.listener1, podcast: IDS.podcasts.techTalk },
    ]);

    console.log('✅ Seed data imported with fixed IDs');
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
  }
};

// Allow standalone execution
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  connectDB().then(async () => {
    await seedData();
    process.exit();
  });
}
