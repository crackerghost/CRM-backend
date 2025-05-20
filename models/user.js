const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require("../config/secret");

const User = sequelize.define(
  "users",
  {
    first_name: { type: DataTypes.STRING, allowNull: true },
    last_name: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    city_id: { type: DataTypes.INTEGER, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true }, // Changed to STRING to reflect city names
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    client_id: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
      allowNull: false,
    },
    address: { type: DataTypes.STRING, allowNull: true },
    user_type: { type: DataTypes.STRING, allowNull: true },
    password_reset_token: { type: DataTypes.STRING, allowNull: true },
    role_id: { type: DataTypes.INTEGER, allowNull: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: true },
    client_user: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    timestamps: true,
    paranoid: true, // Soft delete enabled
  }
);

// Instance methods

User.prototype.generateJwt = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      user_type: this.user_type,
      client_id: this.client_id,
      customer_id: this.customer_id,
      city_id: this.city_id,
    },
    secret.secretKey,
    {
      expiresIn: "300d",
    }
  );
};

User.prototype.verifyToken = function (token, callback) {
  if (!token) {
    return callback(false);
  }
  token = token.split(" ")[1];
  jwt.verify(token, secret.secretKey, function (err, decoded) {
    if (err) {
      return callback(false);
    } else {
      return callback(decoded);
    }
  });
};

User.prototype.passwordResetJwt = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
    },
    secret.passwordSecret,
    {
      expiresIn: "300d",
    }
  );
};

User.prototype.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;
