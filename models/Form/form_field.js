const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const FormField = sequelize.define("erp_fields", {
  // Primary Key for the field
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // List of form IDs this field is associated with (JSON column)
  form_id: {
    type: DataTypes.INTEGER, // Stores the array as JSON
    allowNull: false,
  },

  // Field Name (a unique identifier for the field)
  field_name: {
    type: DataTypes.STRING(255),
    allowNull: false, // Field name cannot be null
  },

  // Display label for the field
  label: {
    type: DataTypes.STRING(255),
    allowNull: false, // Label cannot be null
  },

  // Type of the field (e.g., text, dropdown, etc.)
  type: {
    type: DataTypes.STRING(255),
    allowNull: false, // Type cannot be null
  },
  // Placeholder text for the field
  placeholder: {
    type: DataTypes.STRING(255),
    allowNull: false, // Placeholder text cannot be null
  },
});

// Sync the model with the database (altering schema if needed)
async function syncModel() {
  try {
    await FormField.sync({ alter: true });
    console.log("FormField table has been created or updated.");
  } catch (error) {
    console.error("Error syncing model:", error);
  }
}

// Sync the model
syncModel();

module.exports = FormField;
