const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const PageLabel = sequelize.define("erp_labels", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  page_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label_No: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

async function syncModel() {
  try {
    await PageLabel.sync({ alter: true });
    console.log("PageLabel table has been created or updated.");
  } catch (error) {
    console.error("Error syncing model:", error);
  }
}

syncModel();

module.exports = PageLabel;
