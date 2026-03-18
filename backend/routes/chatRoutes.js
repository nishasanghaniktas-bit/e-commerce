const express = require("express");
const router = express.Router();
const { getChats, getChat, sendMessage, replyMessage, closeChat } = require("../controllers/chatController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, getChats);
router.get("/:id", protect, getChat);
router.post("/send", protect, sendMessage);
router.post("/:id/reply", protect, admin, replyMessage);
router.put("/:id/close", protect, closeChat);

module.exports = router;
