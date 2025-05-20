const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");
const Label_Info = require("./erp_labels_info");

const PageLabel = sequelize.define(
  "erp_labels",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    page_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    label_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
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


PageLabel.hasMany(Label_Info, { foreignKey: "label_id", sourceKey: "id" });

module.exports = PageLabel;
