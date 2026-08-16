const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendLikeOrSuperlike,sendDislike,rewindLastAction,
    getLikesReceived,getMutualMatches
 } = require("../controllers/matchController");

router.post("/like-superlike", protect, sendLikeOrSuperlike);
router.post("/dislike", protect, sendDislike);
router.post("/rewind", protect, rewindLastAction);

// Likes Received & Matches List
router.get("/received", protect, getLikesReceived);           
router.get("/matches", protect, getMutualMatches);

module.exports = router;