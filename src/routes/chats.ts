import express from "express";
import type { RequestHandler } from "express";
import { validate } from "express-validation";
import CHAT_CONTROLLER, {
  type ChatMessageParams,
  type MarkMessageReadBody,
  type SendMessageBody,
  type SendMessageParams,
  type UpdateLastSeenBody,
} from "../controllers/chats.js";
import { createChats, getMessages, markMessageRead, sendMessage, updateLastSeen } from "../validations/chats.js";
const router = express.Router();

const validateCreateChat = validate(createChats, { context: true }) as unknown as RequestHandler;
const validateSendMessage = validate(sendMessage, { context: true }) as unknown as RequestHandler<
  SendMessageParams,
  unknown,
  SendMessageBody
>;

const validateGetMessages = validate(getMessages, { context: true }) as unknown as RequestHandler<
  SendMessageParams,
  unknown,
  unknown
>;

const validateMarkMessageRead = validate(markMessageRead, { context: true }) as unknown as RequestHandler<
  ChatMessageParams,
  unknown,
  MarkMessageReadBody
>;

const validateUpdateLastSeen = validate(updateLastSeen, { context: true }) as unknown as RequestHandler<
  SendMessageParams,
  unknown,
  UpdateLastSeenBody
>;

router.post("/create", validateCreateChat, CHAT_CONTROLLER.createChats);
router.post("/:chatId/message/send", validateSendMessage, CHAT_CONTROLLER.sendMessage);
router.get("/:chatId/messages", validateGetMessages, CHAT_CONTROLLER.getMessages);
router.post("/:chatId/message/:messageId/read", validateMarkMessageRead, CHAT_CONTROLLER.markMessageRead);
router.post("/:chatId/lastseen", validateUpdateLastSeen, CHAT_CONTROLLER.updateLastSeen);

export default router;
