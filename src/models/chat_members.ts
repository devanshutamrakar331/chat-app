import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { CHATS, CHATSId } from './chats.js';
import type { USERS, USERSId } from './users.js';

export interface CHAT_MEMBERSAttributes {
  id: number;
  chat_id: number;
  user_id: number;
  is_deleted?: number;
  deleted_at?: Date;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

export type CHAT_MEMBERSPk = "id";
export type CHAT_MEMBERSId = CHAT_MEMBERS[CHAT_MEMBERSPk];
export type CHAT_MEMBERSOptionalAttributes = "id" | "is_deleted" | "deleted_at" | "joined_at" | "created_at" | "updated_at";
export type CHAT_MEMBERSCreationAttributes = Optional<CHAT_MEMBERSAttributes, CHAT_MEMBERSOptionalAttributes>;

export class CHAT_MEMBERS extends Model<CHAT_MEMBERSAttributes, CHAT_MEMBERSCreationAttributes> implements CHAT_MEMBERSAttributes {
  id!: number;
  chat_id!: number;
  user_id!: number;
  is_deleted?: number;
  deleted_at?: Date;
  joined_at!: Date;
  created_at!: Date;
  updated_at!: Date;

  // CHAT_MEMBERS belongsTo CHATS via chat_id
  chat!: CHATS;
  getChat!: Sequelize.BelongsToGetAssociationMixin<CHATS>;
  setChat!: Sequelize.BelongsToSetAssociationMixin<CHATS, CHATSId>;
  createChat!: Sequelize.BelongsToCreateAssociationMixin<CHATS>;
  // CHAT_MEMBERS belongsTo USERS via user_id
  user!: USERS;
  getUser!: Sequelize.BelongsToGetAssociationMixin<USERS>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<USERS, USERSId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<USERS>;

  static initModel(sequelize: Sequelize.Sequelize): typeof CHAT_MEMBERS {
    return sequelize.define('CHAT_MEMBERS', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'chats',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },

  }, {
    tableName: 'chat_members',
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
        name: "fk_users_cm",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "fk_chat_cm",
        using: "BTREE",
        fields: [
          { name: "chat_id" },
        ]
      },
    ]
  }) as typeof CHAT_MEMBERS;
  }
}
