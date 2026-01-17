// ============================================
// FILE: src/models/Audio.js
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Audio = sequelize.define(
  "Audio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    titleKh: {
      type: DataTypes.STRING(500),
      field: "title_kh",
    },
    speaker: {
      type: DataTypes.STRING,
    },
    speakerKh: {
      type: DataTypes.STRING,
      field: "speaker_kh",
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      field: "thumbnail_url",
    },
    audioUrl: {
      type: DataTypes.STRING(500),
      field: "audio_url",
    },
    duration: {
      type: DataTypes.STRING(20),
    },
    description: {
      type: DataTypes.TEXT,
    },
    descriptionKh: {
      type: DataTypes.TEXT,
      field: "description_kh",
    },
    category: {
      type: DataTypes.STRING(100),
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    fileSize: {
      type: DataTypes.STRING(20),
      field: "file_size",
    },
    plays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "audios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Audio;
