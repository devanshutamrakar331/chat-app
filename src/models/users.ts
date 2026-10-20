import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { CHAT_MEMBERS, CHAT_MEMBERSId } from './chat_members.js';
import type { CHATS, CHATSId } from './chats.js';

export interface USERSAttributes {
  id: number;
  name?: string;
  mobile_no?: string;
  password?: string;
  is_deleted?: number;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type USERSPk = "id";
export type USERSId = USERS[USERSPk];
export type USERSOptionalAttributes = "id" | "name" | "mobile_no" | "password" | "is_deleted" | "deleted_at" | "created_at" | "updated_at";
export type USERSCreationAttributes = Optional<USERSAttributes, USERSOptionalAttributes>;

export class USERS extends Model<USERSAttributes, USERSCreationAttributes> implements USERSAttributes {
  id!: number;
  name?: string;
  mobile_no?: string;
  password?: string;
  is_deleted?: number;
  deleted_at?: Date;
  created_at!: Date;
  updated_at!: Date;

  // USERS hasMany CHAT_MEMBERS via user_id
  chat_members!: CHAT_MEMBERS[];
  getChat_members!: Sequelize.HasManyGetAssociationsMixin<CHAT_MEMBERS>;
  setChat_members!: Sequelize.HasManySetAssociationsMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  addChat_member!: Sequelize.HasManyAddAssociationMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  addChat_members!: Sequelize.HasManyAddAssociationsMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  createChat_member!: Sequelize.HasManyCreateAssociationMixin<CHAT_MEMBERS>;
  removeChat_member!: Sequelize.HasManyRemoveAssociationMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  removeChat_members!: Sequelize.HasManyRemoveAssociationsMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  hasChat_member!: Sequelize.HasManyHasAssociationMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  hasChat_members!: Sequelize.HasManyHasAssociationsMixin<CHAT_MEMBERS, CHAT_MEMBERSId>;
  countChat_members!: Sequelize.HasManyCountAssociationsMixin;
  // USERS hasMany CHATS via initiated_by_id
  chats!: CHATS[];
  getChats!: Sequelize.HasManyGetAssociationsMixin<CHATS>;
  setChats!: Sequelize.HasManySetAssociationsMixin<CHATS, CHATSId>;
  addChat!: Sequelize.HasManyAddAssociationMixin<CHATS, CHATSId>;
  addChats!: Sequelize.HasManyAddAssociationsMixin<CHATS, CHATSId>;
  createChat!: Sequelize.HasManyCreateAssociationMixin<CHATS>;
  removeChat!: Sequelize.HasManyRemoveAssociationMixin<CHATS, CHATSId>;
  removeChats!: Sequelize.HasManyRemoveAssociationsMixin<CHATS, CHATSId>;
  hasChat!: Sequelize.HasManyHasAssociationMixin<CHATS, CHATSId>;
  hasChats!: Sequelize.HasManyHasAssociationsMixin<CHATS, CHATSId>;
  countChats!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof USERS {
    return sequelize.define('USERS', {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mobile_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "mobile_no"
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "mobile_no",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "mobile_no" },
          ]
        },
      ]
    }) as typeof USERS;
  }
}
