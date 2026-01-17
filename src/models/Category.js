// ============================================
// FILE: src/models/Category.js
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nameKh: {
      type: DataTypes.STRING(100),
      field: "name_kh",
    },
    icon: {
      type: DataTypes.STRING(50),
    },
    type: {
      type: DataTypes.ENUM(
        "thesis",
        "publication",
        "audio",
        "journal",
        "video"
      ),
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Category;
