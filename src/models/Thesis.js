// ============================================
// FILE: src/models/Thesis.js (UPDATED)
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Thesis = sequelize.define(
  "Thesis",
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
    // ADDED: Missing fields for complete thesis information
    supervisor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supervisorKh: {
      type: DataTypes.STRING,
      field: "supervisor_kh",
      allowNull: true,
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    majorKh: {
      type: DataTypes.STRING,
      field: "major_kh",
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "e.g., Bachelor, Master, PhD",
    },
    university: {
      type: DataTypes.STRING,
    },
    universityKh: {
      type: DataTypes.STRING,
      field: "university_kh",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 1,
      },
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
    category: {
      type: DataTypes.STRING(100),
    },
    // ADDED: Khmer translation for category
    categoryKh: {
      type: DataTypes.STRING(100),
      field: "category_kh",
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: "en",
    },
    pages: {
      type: DataTypes.INTEGER,
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
    tableName: "thesis",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["title"],
      },
      {
        fields: ["author"],
      },
      {
        fields: ["year"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["university"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

module.exports = Thesis;