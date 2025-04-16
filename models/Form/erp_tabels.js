const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const ErpTables = sequelize.define("erp_tables", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  page_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(255), // Adjusted to match the column definition as varchar(255)
    allowNull: false,
  },
  col_name: {
    type: DataTypes.STRING(255), // Adjusted to match the column definition as varchar(255)
    allowNull: false,
  }
});



module.exports = ErpTables;
