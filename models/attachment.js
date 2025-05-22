const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Attachment = sequelize.define(
  "erp_attachment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    parent_id: { type: DataTypes.INTEGER, allowNull: false },
    message_id: { type: DataTypes.INTEGER, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    module_name: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    file_name: { type: DataTypes.STRING, allowNull: false },
    file_url: {
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



module.exports = Attachment;
