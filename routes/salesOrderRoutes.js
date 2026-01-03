const express = require("express");
const {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
  getTodayOrders,
} = require("../controllers/salesOrderController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getOrders);
router.post("/", authMiddleware, createOrder);
router.get("/today", authMiddleware, getTodayOrders);
router.put("/:id", authMiddleware, updateOrder);
router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;
