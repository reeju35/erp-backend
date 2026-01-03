const express = require("express");
const { getAllUsers, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all users (Admin)
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

// Delete user (Admin)
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
