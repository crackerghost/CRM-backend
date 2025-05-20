// models/FormField.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");
const DropDown = require("./erp_dropdown");


const FormField = sequelize.define("erp_fields", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  form_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  col_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  placeholder: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  required: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
},
{
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
}
);




// Define the inverse relationship
FormField.hasMany(DropDown, { foreignKey: 'col_name', sourceKey: 'col_name' });

module.exports = FormField;
