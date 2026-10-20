import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import commonModules from "../config/index.js";
import sendResponse from "../utils/sendResponse.js";
import ApiError from "../utils/ApiError.js";

const {
  models: { USERS, CHATS, CHAT_MEMBERS },
} = commonModules;

interface CreateUserBody {
  name: string;
  mobile_no: string;
  password: string;
}

export interface UserChatsParams {
  [key: string]: string;
  userId: string;
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, mobile_no, password } = req.body;

    const hasUser = await USERS.findOne({ where: { mobile_no } });
    if (hasUser) {
      throw new ApiError(422, "User with given mobile no. already exists.");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userPayload: CreateUserBody = {
      name,
      password: hashPassword,
      mobile_no,
    };
    const user = await USERS.create(userPayload);

    sendResponse(res, 201, "User created successfully", user);
  } catch (error) {
    next(error);
  }
};

const getUserChats = async (req: Request<UserChatsParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    const user = await USERS.findOne({ where: { id: userId, is_deleted: false } });
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const memberships = await CHAT_MEMBERS.findAll({
      attributes: ["chat_id"],
      where: { user_id: userId, is_deleted: false },
    });
    const chatIds = [...new Set(memberships.map((membership) => membership.chat_id))];

    if (chatIds.length === 0) {
      sendResponse(res, 200, "Chats fetched successfully.", []);
      return;
    }

    const chats = await CHATS.findAll({
      attributes: ["id", "type", "initiated_by_id", "session_name", "created_at", "updated_at"],
      where: { id: chatIds, is_deleted: false },
      include: [
        {
          model: CHAT_MEMBERS,
          as: "chat_members",
          attributes: ["user_id"],
          where: { is_deleted: false },
          required: false,
        },
      ],
      order: [["updated_at", "DESC"]],
    });

    const result = chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      initiated_by_id: chat.initiated_by_id,
      session_name: chat.session_name ?? null,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      member_ids: [...new Set(chat.chat_members.map((member) => member.user_id))],
    }));

    sendResponse(res, 200, "Chats fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const USER_CONTROLLER = {
  createUser,
  getUserChats,
};

export default USER_CONTROLLER;
