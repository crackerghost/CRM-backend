const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/connection");

const Label_Info = sequelize.define("erp_labels_info", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  label_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  col_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

 Label_Info.sync({alter:true})

module.exports = Label_Info;
