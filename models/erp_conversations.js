const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Erp_Conversations = sequelize.define("erp_conversations", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  parent_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  sender_details: { type: DataTypes.STRING, allowNull: false },
  receiver_email: { type: DataTypes.STRING, allowNull: false },
  module_name: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});




module.exports = Erp_Conversations;
