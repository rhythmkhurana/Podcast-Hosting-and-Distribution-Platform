import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import helmet from 'helmet';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';

// Route files
import authRoutes from './routes/authRoutes.js';
import podcastRoutes from './routes/podcastRoutes.js';
import episodeRoutes from './routes/episodeRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/audio', 'uploads/images'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Connect to database
connectDB().then(async () => {
  const { seedData } = await import('./seed.js');
  const { default: Podcast } = await import('./models/Podcast.js');
  const count = await Podcast.countDocuments();
  if (count === 0) {
    console.log('Database is empty. Seeding mock data...');
    await seedData();
  }
});

const app = express();

// Set security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Sanitize data to prevent NoSQL injection (Express 5 compatible)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  next();
});

// Prevent XSS attacks
app.use(xss());

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://podcast-hosting-and-distribution-pl-xi.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);

// Routes placeholders
app.get('/', (req, res) => {
  res.json({ success: true, message: 'WAVCAST API is running' });
});

// Error Middleware placeholder
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    console.error(`Error: ${err.message}`);
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
