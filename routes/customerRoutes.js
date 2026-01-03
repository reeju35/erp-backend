const express = require("express");
const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin-only customer management
router.post("/", authMiddleware, adminMiddleware, createCustomer);
router.get("/", authMiddleware, adminMiddleware, getCustomers);
router.put("/:id", authMiddleware, adminMiddleware, updateCustomer);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCustomer);

module.exports = router;
