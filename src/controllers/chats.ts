import type { Request, Response, NextFunction } from "express";
import commonModules from "../config/index.js";
import sendResponse from "../utils/sendResponse.js";
import ApiError from "../utils/ApiError.js";
import { FieldValue } from "firebase-admin/firestore";

const {
  models: { CHATS, USERS, CHAT_MEMBERS },
  firebaseDb,
} = commonModules;

interface CreateChatBody {
  session_name?: string | null;
  user_id: number[];
  type: "PRIVATE" | "GROUP";
  initiated_by_id?: number | null;
}

export interface SendMessageBody {
  message: string;
  sender_id: number;
}

export interface SendMessageParams {
  [key: string]: string;
  chatId: string;
}

export interface ChatMessageParams extends SendMessageParams {
  messageId: string;
}

export interface MarkMessageReadBody {
  userId: number;
}

export interface UpdateLastSeenBody {
  userId: number;
  messageId: string;
}

const generatePrivateChatKey = (userIds: number[]): string => {
  return `PRIVATE_${userIds.map(String).sort().join("_")}`;
};

const ensureActiveChatMember = async (chatId: number, userId: number): Promise<void> => {
  const [chat, user, chatMember] = await Promise.all([
    CHATS.findOne({ where: { id: chatId, is_deleted: false } }),
    USERS.findOne({ where: { id: userId, is_deleted: false } }),
    CHAT_MEMBERS.findOne({ where: { chat_id: chatId, user_id: userId, is_deleted: false } }),
  ]);

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!chatMember) {
    throw new ApiError(403, "User is not a member of this chat.");
  }
};

const ensureActiveMessage = async (chatId: number, messageId: string) => {
  const messageRef = firebaseDb.collection("chats").doc(String(chatId)).collection("messages").doc(messageId);
  const message = await messageRef.get();

  if (!message.exists || message.data()?.is_deleted === true) {
    throw new ApiError(404, "Message not found.");
  }

  return messageRef;
};

const createChats = async (req: Request<unknown, unknown, CreateChatBody>, res: Response, next: NextFunction) => {
  try {
    const { session_name = null, user_id, type, initiated_by_id = null } = req.body;

    const userIds = [...new Set(user_id)];

    const chatPayload: {
      type: "PRIVATE" | "GROUP";
      session_name?: string;
      initiated_by_id: number;
    } = {
      type,
      initiated_by_id: 0,
    };

    if (session_name) {
      chatPayload.session_name = session_name;
    }

    const hasUserExists = await USERS.findAll({ where: { id: userIds } });
    if (hasUserExists.length != userIds.length) {
      throw new ApiError(404, "Given User Ids are invalid.");
    }

    if (type === "PRIVATE") {
      if (userIds.length < 2) {
        throw new ApiError(422, "Please provide the required unique user id.");
      }
      chatPayload.session_name = generatePrivateChatKey(userIds);
      chatPayload.initiated_by_id = userIds[0] as number;
    } else {
      const hasValidAdmin = await USERS.findOne({
        where: { id: initiated_by_id ?? undefined, is_deleted: false },
      });
      if (!hasValidAdmin) {
        throw new ApiError(422, "Group initiated by id is invalid.");
      }
      chatPayload.initiated_by_id = hasValidAdmin.id;
    }

    const hasChatExists = await CHATS.findOne({
      where: {
        session_name: chatPayload.session_name ?? undefined,
        type: chatPayload.type,
        is_deleted: false,
      },
    });

    if (hasChatExists) {
      throw new ApiError(422, "Chat already exists with given session name.");
    }

    const chat = await CHATS.create(chatPayload);
    await CHAT_MEMBERS.bulkCreate(
      userIds.map((id) => ({
        chat_id: chat.id,
        user_id: id,
      })),
    );

    sendResponse(res, 200, "Chat Created Successfully", chat);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (
  req: Request<SendMessageParams, unknown, SendMessageBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body, params } = req;

    const chatId = Number(params.chatId);
    const { message, sender_id } = body;
    const userId = Number(sender_id);

    const chat = await CHATS.findOne({ where: { id: chatId, is_deleted: false } });
    if (!chat) {
      throw new ApiError(404, "Chat not found.");
    }

    const hasUserExists = await USERS.findOne({ where: { id: userId, is_deleted: false } });
    if (!hasUserExists) {
      throw new ApiError(404, "Sender not found.");
    }

    const chatMember = await CHAT_MEMBERS.findOne({ where: { chat_id: chatId, user_id: userId } });
    if (!chatMember) {
      throw new ApiError(403, "You are not a member of this chat.");
    }

    const messageRef = await firebaseDb
      .collection("chats")
      .doc(String(chatId))
      .collection("messages")
      .add({
        sender_id: String(userId),
        message: message.trim(),
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
        is_deleted: false,
        read_by: [String(userId)],
      });

    sendResponse(res, 200, "Message sent successfully", { messageId: messageRef.id });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req: Request<SendMessageParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chatId } = req.params;

    // Validate limit
    const limit = Number(req.query.limit ?? 50);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, "Limit must be an integer between 1 and 100.");
    }

    // Verify chat exists
    const chat = await CHATS.findOne({
      where: {
        id: chatId,
        is_deleted: false,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found.");
    }

    // Fetch messages from Firestore
    const snapshot = await firebaseDb
      .collection("chats")
      .doc(String(chatId))
      .collection("messages")
      .orderBy("created_at", "desc")
      .limit(limit)
      .get();

    // Return oldest-to-newest within the selected page
    const messages = snapshot.docs
      .map((doc) => ({
        message_id: doc.id,
        ...doc.data(),
      }))
      .reverse();

    sendResponse(res, 200, "Messages fetched successfully.", messages);
  } catch (error) {
    next(error);
  }
};

const markMessageRead = async (
  req: Request<ChatMessageParams, unknown, MarkMessageReadBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = Number(req.params.chatId);
    const { messageId } = req.params;
    const { userId } = req.body;

    await ensureActiveChatMember(chatId, userId);
    const messageRef = await ensureActiveMessage(chatId, messageId);

    await messageRef.update({
      read_by: FieldValue.arrayUnion(String(userId)),
    });

    sendResponse(res, 200, "Message marked as read.", { chatId, messageId, userId });
  } catch (error) {
    next(error);
  }
};

const updateLastSeen = async (
  req: Request<SendMessageParams, unknown, UpdateLastSeenBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = Number(req.params.chatId);
    const { userId, messageId } = req.body;

    await ensureActiveChatMember(chatId, userId);
    await ensureActiveMessage(chatId, messageId);

    await firebaseDb
      .collection("chats")
      .doc(String(chatId))
      .collection("last_seen")
      .doc(String(userId))
      .set(
        {
          message_id: messageId,
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    sendResponse(res, 200, "Last seen message updated.", { chatId, messageId, userId });
  } catch (error) {
    next(error);
  }
};

const CHAT_CONTROLLER = {
  createChats,
  sendMessage,
  getMessages,
  markMessageRead,
  updateLastSeen,
};

export default CHAT_CONTROLLER;
