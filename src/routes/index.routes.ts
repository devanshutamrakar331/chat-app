import express from "express";
import chats from "./chats.js";
import users from "./users.js";

const router = express.Router();

router.use("/chats", chats);
router.use("/users", users);

export default router;
