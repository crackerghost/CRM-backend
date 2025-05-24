const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Erp_Appointments = sequelize.define(
  "erp_appointment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    parent_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name:{ type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    meet_link: { type: DataTypes.STRING, allowNull: false },
    sender_email: { type: DataTypes.STRING, allowNull: false },
    receiver_email: { type: DataTypes.STRING, allowNull: false },
    module_name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);



module.exports = Erp_Appointments;
