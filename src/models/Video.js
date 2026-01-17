// ============================================
// FILE: src/models/Video.js
// ============================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  titleKh: {
    type: DataTypes.STRING(500),
    field: 'title_kh'
  },
  instructor: {
    type: DataTypes.STRING
  },
  instructorKh: {
    type: DataTypes.STRING,
    field: 'instructor_kh'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    field: 'thumbnail_url'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    field: 'video_url'
  },
  duration: {
    type: DataTypes.STRING(20)
  },
  description: {
    type: DataTypes.TEXT
  },
  descriptionKh: {
    type: DataTypes.TEXT,
    field: 'description_kh'
  },
  category: {
    type: DataTypes.STRING(100)
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  fileSize: {
    type: DataTypes.STRING(20),
    field: 'file_size'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'videos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Video;