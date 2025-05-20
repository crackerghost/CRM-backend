const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");
const Erp_Conversations = require("./erp_conversations");

const ErpData = sequelize.define(
  "erp",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    cus_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    module_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    source: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    p_contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    p_contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    p_contact_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "India", // Default value as 'India'
    },

    product: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    live_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    assigned_rep: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    int_lvl: {
      type: DataTypes.ENUM("cold", "warm", "hot"), // Enum for interest level
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);



ErpData.hasMany(Erp_Conversations, {
  foreignKey: "parent_id",
  sourceKey: "id",
});

module.exports = ErpData;
