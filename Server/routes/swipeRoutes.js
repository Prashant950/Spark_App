const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {getSwipeFeed, handleSwipeAction} = require("../controllers/swipeController");

router.get("/feed", protect, getSwipeFeed);
router.post("/action", protect, handleSwipeAction);


module.exports = router;
