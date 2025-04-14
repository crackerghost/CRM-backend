const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const Forms = sequelize.define("erp_forms", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  form_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

async function syncModel() {
  try {
    await Forms.sync({ alter: true });
    console.log("User table has been created or updated.");
  } catch (error) {
    console.error("Error syncing model:", error);
  }
}

syncModel();

module.exports = Forms;
