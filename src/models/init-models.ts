import type { Sequelize } from "sequelize";
import { CHAT_MEMBERS as _CHAT_MEMBERS } from "./chat_members.js";
import type { CHAT_MEMBERSAttributes, CHAT_MEMBERSCreationAttributes } from "./chat_members.js";
import { CHATS as _CHATS } from "./chats.js";
import type { CHATSAttributes, CHATSCreationAttributes } from "./chats.js";
import { USERS as _USERS } from "./users.js";
import type { USERSAttributes, USERSCreationAttributes } from "./users.js";

export {
  _CHAT_MEMBERS as CHAT_MEMBERS,
  _CHATS as CHATS,
  _USERS as USERS,
};

export type {
  CHAT_MEMBERSAttributes,
  CHAT_MEMBERSCreationAttributes,
  CHATSAttributes,
  CHATSCreationAttributes,
  USERSAttributes,
  USERSCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const CHAT_MEMBERS = _CHAT_MEMBERS.initModel(sequelize);
  const CHATS = _CHATS.initModel(sequelize);
  const USERS = _USERS.initModel(sequelize);

  CHAT_MEMBERS.belongsTo(CHATS, { as: "chat", foreignKey: "chat_id"});
  CHATS.hasMany(CHAT_MEMBERS, { as: "chat_members", foreignKey: "chat_id"});
  CHAT_MEMBERS.belongsTo(USERS, { as: "user", foreignKey: "user_id"});
  USERS.hasMany(CHAT_MEMBERS, { as: "chat_members", foreignKey: "user_id"});
  CHATS.belongsTo(USERS, { as: "initiated_by", foreignKey: "initiated_by_id"});
  USERS.hasMany(CHATS, { as: "chats", foreignKey: "initiated_by_id"});

  return {
    CHAT_MEMBERS: CHAT_MEMBERS,
    CHATS: CHATS,
    USERS: USERS,
  };
}
