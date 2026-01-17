// ============================================
// FILE: src/models/Journal.js
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Journal = sequelize.define(
  "Journal",
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
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorKh: {
      type: DataTypes.STRING,
      field: "author_kh",
    },
    abstract: {
      type: DataTypes.TEXT,
    },
    abstractKh: {
      type: DataTypes.TEXT,
      field: "abstract_kh",
    },
    description: {
      type: DataTypes.TEXT,
    },
    descriptionKh: {
      type: DataTypes.TEXT,
      field: "description_kh",
    },
    coverUrl: {
      type: DataTypes.STRING(500),
      field: "cover_url",
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      field: "pdf_url",
    },
    date: {
      type: DataTypes.STRING(50),
    },
    dateKh: {
      type: DataTypes.STRING(50),
      field: "date_kh",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
    },
    categoryKh: {
      type: DataTypes.STRING(100),
      field: "category_kh",
    },
    pages: {
      type: DataTypes.INTEGER,
    },
    volume: {
      type: DataTypes.STRING(100),
    },
    volumeKh: {
      type: DataTypes.STRING(100),
      field: "volume_kh",
    },
    issn: {
      type: DataTypes.STRING(50),
    },
    publisher: {
      type: DataTypes.STRING,
    },
    publisherKh: {
      type: DataTypes.STRING,
      field: "publisher_kh",
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: "en",
    },
    university: {
      type: DataTypes.STRING,
    },
    universityKh: {
      type: DataTypes.STRING,
      field: "university_kh",
    },
    fileSize: {
      type: DataTypes.STRING(20),
      field: "file_size",
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "journals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Journal;
