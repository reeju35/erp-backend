const express = require("express");
const { createGRN } = require("../controllers/grnController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin-only GRN creation
router.post("/", authMiddleware, adminMiddleware, createGRN);

module.exports = router;
