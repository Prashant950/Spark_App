const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  sendMediaMessage,
  getUserConversations,
} = require("../controllers/chatController");

router.get("/conversation/:targetUserId", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);
router.post("/send", protect, sendMessage);
router.post("/send-media", protect, upload.single("media"), sendMediaMessage);
router.get("/conversations", protect, getUserConversations);

module.exports = router;