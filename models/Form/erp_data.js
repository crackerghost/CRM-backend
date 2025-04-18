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
    allowNull: true,
  },

  moduleName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  source: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  pContactName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  pContactNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },

  city: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  country: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: "India", // Default value as 'India'
  },

  product: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  liveDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  assignedRep: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  int_lvl: {
    type: DataTypes.ENUM("cold", "warm", "hot"), // Enum for interest level
    allowNull: true,
  },

  category: {
    type: DataTypes.STRING(255),
    allowNull: true,
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
