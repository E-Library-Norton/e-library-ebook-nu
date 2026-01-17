// ============================================
// FILE: src/models/Publication.js
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Publication = sequelize.define(
  "Publication",
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
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coverUrl: {
      type: DataTypes.STRING(500),
      field: "cover_url",
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      field: "pdf_url",
    },
    category: {
      type: DataTypes.STRING(100),
    },
    categoryKh: {
      type: DataTypes.STRING(100),
      field: "category_kh",
    },
    description: {
      type: DataTypes.TEXT,
    },
    descriptionKh: {
      type: DataTypes.TEXT,
      field: "description_kh",
    },
    publisher: {
      type: DataTypes.STRING,
    },
    publisherKh: {
      type: DataTypes.STRING,
      field: "publisher_kh",
    },
    isbn: {
      type: DataTypes.STRING(50),
    },
    pages: {
      type: DataTypes.INTEGER,
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: "en",
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
    tableName: "publications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Publication;
