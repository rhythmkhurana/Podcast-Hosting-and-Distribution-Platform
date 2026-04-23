import Podcast from '../models/Podcast.js';
import RSS from 'rss';

// @desc    Get all podcasts (with filters, search, sort)
// @route   GET /api/podcasts
// @access  Public
export const getPodcasts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    
    let query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let podcastsQuery = Podcast.find(query).populate('author', 'name avatar');

    // Sorting
    if (sort === 'popular') {
      podcastsQuery = podcastsQuery.sort({ subscribersCount: -1 });
    } else if (sort === 'a-z') {
      podcastsQuery = podcastsQuery.sort({ title: 1 });
    } else {
      // Default: latest
      podcastsQuery = podcastsQuery.sort({ createdAt: -1 });
    }

    const podcasts = await podcastsQuery;

    res.status(200).json({
      success: true,
      count: podcasts.length,
      data: podcasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending podcasts
// @route   GET /api/podcasts/trending
// @access  Public
export const getTrendingPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find({ status: 'active' })
      .sort({ subscribersCount: -1 })
      .limit(10)
      .populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured podcasts (curated list, for now just random or highest subs)
// @route   GET /api/podcasts/featured
// @access  Public
export const getFeaturedPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find({ status: 'active' })
      .sort({ subscribersCount: -1 })
      .limit(5)
      .populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single podcast
// @route   GET /api/podcasts/:id
// @access  Public
export const getPodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate({
        path: 'episodes',
        match: { isPublished: true },
        options: { sort: { publishedAt: -1 } }
      });

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.status(200).json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create podcast
// @route   POST /api/podcasts
// @access  Private (Creator)
export const createPodcast = async (req, res, next) => {
  try {
    const { title, description, category, tags, language, isExplicit } = req.body;
    let coverImage = 'default_podcast.png';

    if (req.file) {
      coverImage = `/uploads/images/${req.file.filename}`;
    }

    const podcast = await Podcast.create({
      title,
      description,
      category,
      tags: tags ? JSON.parse(tags) : [],
      language,
      isExplicit,
      coverImage,
      author: req.user.id,
      rssUrl: `${process.env.CLIENT_URL}/api/podcasts/temp/rss`, // Temp, will update with real ID
    });

    podcast.rssUrl = `${process.env.CLIENT_URL}/api/podcasts/${podcast._id}/rss`;
    await podcast.save();

    res.status(201).json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update podcast
// @route   PUT /api/podcasts/:id
// @access  Private (Creator)
export const updatePodcast = async (req, res, next) => {
  try {
    let podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    // Ensure user is author
    if (podcast.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this podcast' });
    }

    const updateData = { ...req.body };
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }
    
    if (req.file) {
      updateData.coverImage = `/uploads/images/${req.file.filename}`;
    }

    podcast = await Podcast.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete podcast
// @route   DELETE /api/podcasts/:id
// @access  Private (Creator)
export const deletePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    if (podcast.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this podcast' });
    }

    await podcast.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get creator's own podcasts
// @route   GET /api/podcasts/my/all
// @access  Private (Creator)
export const getMyPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find({ author: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: podcasts.length,
      data: podcasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate RSS Feed for Podcast
// @route   GET /api/podcasts/:id/rss
// @access  Public
export const generateRSS = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'episodes',
        match: { isPublished: true },
        sort: { publishedAt: -1 }
      });

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    const feed = new RSS({
      title: podcast.title,
      description: podcast.description,
      feed_url: `${process.env.CLIENT_URL}/api/podcasts/${podcast._id}/rss`,
      site_url: `${process.env.CLIENT_URL}/podcast/${podcast._id}`,
      image_url: `${process.env.CLIENT_URL}${podcast.coverImage}`,
      author: podcast.author.name,
      language: podcast.language,
      pubDate: new Date().toUTCString(),
      custom_namespaces: {
        'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
      },
      custom_elements: [
        {'itunes:author': podcast.author.name},
        {'itunes:summary': podcast.description},
        {'itunes:owner': [
          {'itunes:name': podcast.author.name},
          {'itunes:email': podcast.author.email}
        ]},
        {'itunes:image': {
          _attr: {
            href: `${process.env.CLIENT_URL}${podcast.coverImage}`
          }
        }},
        {'itunes:category': [
          {_attr: {
            text: podcast.category
          }}
        ]},
        {'itunes:explicit': podcast.isExplicit ? 'yes' : 'no'}
      ]
    });

    podcast.episodes.forEach(episode => {
      feed.item({
        title: episode.title,
        description: episode.description,
        url: `${process.env.CLIENT_URL}/podcast/${podcast._id}/episode/${episode._id}`,
        guid: episode._id.toString(),
        date: episode.publishedAt,
        enclosure: {
          url: `${process.env.CLIENT_URL}${episode.audioFile}`,
          file: `${process.env.CLIENT_URL}${episode.audioFile}`,
          size: episode.fileSize || 0,
          type: 'audio/mpeg'
        },
        custom_elements: [
          {'itunes:title': episode.title},
          {'itunes:episodeType': 'full'},
          {'itunes:episode': episode.episodeNumber},
          {'itunes:season': episode.season},
          {'itunes:author': podcast.author.name},
          {'itunes:duration': episode.duration},
          {'itunes:explicit': podcast.isExplicit ? 'yes' : 'no'}
        ]
      });
    });

    const xml = feed.xml({ indent: true });

    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
};
