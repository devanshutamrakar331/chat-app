import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { CHAT_MEMBERS, CHAT_MEMBERSId } from './chat_members.js';
import type { USERS, USERSId } from './users.js';

export interface CHATSAttributes {
  id: number;
  type: 'PRIVATE' | 'GROUP';
  initiated_by_id: number;
  session_name?: string;
  is_deleted?: number;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type CHATSPk = "id";
export type CHATSId = CHATS[CHATSPk];
export type CHATSOptionalAttributes = "id" | "type" | "session_name" | "is_deleted" | "deleted_at" | "created_at" | "updated_at";
export type CHATSCreationAttributes = Optional<CHATSAttributes, CHATSOptionalAttributes>;

export class CHATS extends Model<CHATSAttributes, CHATSCreationAttributes> implements CHATSAttributes {
  id!: number;
  type!: 'PRIVATE' | 'GROUP';
  initiated_by_id!: number;
  session_name?: string;
  is_deleted?: number;
  deleted_at?: Date;
  created_at!: Date;
  updated_at!: Date;

  // CHATS hasMany CHAT_MEMBERS via chat_id
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
  // CHATS belongsTo USERS via initiated_by_id
  initiated_by!: USERS;
  getInitiated_by!: Sequelize.BelongsToGetAssociationMixin<USERS>;
  setInitiated_by!: Sequelize.BelongsToSetAssociationMixin<USERS, USERSId>;
  createInitiated_by!: Sequelize.BelongsToCreateAssociationMixin<USERS>;

  static initModel(sequelize: Sequelize.Sequelize): typeof CHATS {
    return sequelize.define('CHATS', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('PRIVATE','GROUP'),
      allowNull: false,
      defaultValue: "PRIVATE"
    },
    initiated_by_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_name: {
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
    tableName: 'chats',
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
        name: "fk_users_chat_initiated_by",
        using: "BTREE",
        fields: [
          { name: "initiated_by_id" },
        ]
      },
    ]
  }) as typeof CHATS;
  }
}
