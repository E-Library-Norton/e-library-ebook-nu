// ============================================
// FILE: src/models/User.js
// ============================================

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    firstName: {
      type: DataTypes.STRING(100),
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      field: "last_name",
    },
    role: {
      type: DataTypes.ENUM("admin", "librarian", "faculty", "student"),
      defaultValue: "student",
    },
    universityId: {
      type: DataTypes.STRING(50),
      field: "university_id",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Hash password before creating user
User.beforeCreate(async (user) => {
  if (user.passwordHash) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
});

// Hash password before updating if changed
User.beforeUpdate(async (user) => {
  if (user.changed("passwordHash")) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
});

// Instance method to validate password
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Instance method to get public profile
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

module.exports = User;
