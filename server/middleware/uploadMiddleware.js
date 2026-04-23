import multer from 'multer';
import path from 'path';

const mimeToExt = {
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'audioFile') {
      cb(null, 'uploads/audio/');
    } else if (file.fieldname === 'thumbnail' || file.fieldname === 'coverImage' || file.fieldname === 'avatar') {
      cb(null, 'uploads/images/');
    } else {
      cb(new Error('Invalid fieldname'), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use mapped extension to prevent spoofing
    const ext = mimeToExt[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg') {
      cb(null, true);
    } else {
      cb(new Error('Only mp3, wav, and ogg files are allowed'), false);
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'coverImage' || file.fieldname === 'avatar') {
    // Restrict to safe raster image formats to prevent SVG XSS
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/gif') {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png, webp, and gif files are allowed'), false);
    }
  } else {
    cb(new Error('Invalid fieldname'), false);
  }
};

// Limits
const limits = {
  // Assume max 200MB audio, max 5MB image. We'll set limit to 200MB overall and handle specific validation later if needed, 
  // or use multiple instances if limits need to be strict per field. For simplicity, setting it to 200MB.
  fileSize: 200 * 1024 * 1024, 
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});
