const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection"); // Adjust this path to your sequelize connection setup

const Country = sequelize.define('countries', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    country_code: {
      type: DataTypes.STRING(100),
      collate: 'utf8mb3_bin',
      allowNull: false,
    },
    country_name: {
      type: DataTypes.STRING(100),
      collate: 'utf8mb3_bin',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'countries',
    timestamps: true,  // Enable timestamps if needed
    createdAt: 'createdAt',  // Map to actual column names if they're not default
    updatedAt: 'updatedAt',  // Map to actual column names if they're not default
  });
  
  Country.sync({alter:true})

  module.exports = Country;
  