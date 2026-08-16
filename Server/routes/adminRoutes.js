const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const { getAllUsers, toggleBanUser } = require("../controllers/adminController");

// PRIVATE ADMIN ROUTES
router.get("/users", protect, authorize(ROLES.ADMIN), getAllUsers);
router.put("/ban-user/:id", protect, authorize(ROLES.ADMIN), toggleBanUser);

module.exports = router;