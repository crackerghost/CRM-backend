const User = require("./user");
const Erp_Conversations = require("./erp_conversations");
const Trails = require("./trail");
const Attachment = require("./attachment");
const { Sequelize } = require("sequelize");
const gmailToken = require("./gmail");
const db = {};
db.Sequalize = Sequelize;
// Associations
User.hasMany(Erp_Conversations, { foreignKey: "user_id", sourceKey: "id" });
Erp_Conversations.belongsTo(User, { foreignKey: "user_id", targetKey: "id" });
User.hasMany(Trails, { foreignKey: "user_id", sourceKey: "id" });
Trails.belongsTo(User, { foreignKey: "user_id", targetKey: "id" });
User.hasMany(Attachment, { foreignKey: "user_id", sourceKey: "id" });
Attachment.belongsTo(User, { foreignKey: "user_id", targetKey: "id" });
Erp_Conversations.hasMany(Attachment, {
  foreignKey: "message_id",
  sourceKey: "id",
});
Attachment.belongsTo(Erp_Conversations, {
  foreignKey: "message_id",
  targetKey: "id",
});
module.exports = {
  db,
  User,
  Erp_Conversations,
  Trails,
  Attachment,
  gmailToken,
};
