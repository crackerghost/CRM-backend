const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const ErpData = sequelize.define("erp", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  cusName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  moduleName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  source: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  pContactName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  pContactNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },

  town: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  country: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: "India", // Default value as 'India'
  },

  product: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  liveDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  assignedRep: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  int_lvl: {
    type: DataTypes.ENUM("cold", "warm", "hot"), // Enum for interest level
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});



module.exports = ErpData;
