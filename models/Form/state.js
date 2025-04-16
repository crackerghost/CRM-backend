const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const State = sequelize.define("state", {
  state_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country_id: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
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

module.exports = State;
