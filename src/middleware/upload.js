// ============================================
// FILE: src/middleware/upload.js
// ============================================

const multer = require('multer');
const path = require('path');
const Helpers = require('../utils/helpers');
const { MAX_FILE_SIZES, FILE_TYPES } = require('../config/constants');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'cover') {
      folder += 'covers/';
    } else if (file.fieldname === 'profiles') {
      folder += 'profiless/';
    } else if (file.fieldname === 'audio') {
      folder += 'audios/';
    } else if (file.fieldname === 'video') {
      folder += 'videos/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Helpers.generateFileName(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    cover: FILE_TYPES.IMAGE,
    profiles: [FILE_TYPES.PDF],
    audio: FILE_TYPES.AUDIO,
    video: FILE_TYPES.VIDEO
  };

  const allowed = allowedTypes[file.fieldname];
  
  if (allowed && (Array.isArray(allowed) ? allowed.includes(file.mimetype) : allowed === file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZES.VIDEO // Maximum size
  }
});

// Export upload middleware
module.exports = {
  uploadThesisFiles: upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'profiles', maxCount: 1 }
  ]),
  uploadJournalFiles: upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'profiles', maxCount: 1 }
  ]),
  uploadPublicationFiles: upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'profiles', maxCount: 1 }
  ]),
  uploadAudioFiles: upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  uploadVideoFiles: upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  uploadSingle: upload.single('file')
};