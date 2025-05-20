const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const gmailToken = sequelize.define(
  "erp_gmail_token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      gmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);
gmailToken.sync({alter:true})
module.exports = gmailToken;
