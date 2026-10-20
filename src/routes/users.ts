import express from "express";
import type { RequestHandler } from "express";
import { validate } from "express-validation";
import USER_CONTROLLER, { type UserChatsParams } from "../controllers/users.js";
import { createUser, getUserChats } from "../validations/users.js";
const router = express.Router();

const validateCreateUser = validate(createUser, { context: true }) as unknown as RequestHandler;
const validateGetUserChats = validate(getUserChats, { context: true }) as unknown as RequestHandler<UserChatsParams>;

router.post("/create", validateCreateUser, USER_CONTROLLER.createUser);
router.get("/:userId/chats", validateGetUserChats, USER_CONTROLLER.getUserChats);

export default router;
