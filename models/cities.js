const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Citie = sequelize.define("cities", {
  city_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  },
  zone_id: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  },
  country_id: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
    allowNull: false,
  },
  client_id: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Citie;
