const express = require("express");
const {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus,
  getTodayPurchaseOrders,
  getPurchaseOrdersByDate,
  deletePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin-only purchase order management
router.post("/", authMiddleware, adminMiddleware, createPurchaseOrder);
router.get("/", authMiddleware, adminMiddleware, getPurchaseOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, updatePurchaseOrderStatus);
router.get("/today", authMiddleware, adminMiddleware, getTodayPurchaseOrders);
router.get(
  "/by-date",
  authMiddleware,
  adminMiddleware,
  getPurchaseOrdersByDate
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deletePurchaseOrder
);


module.exports = router;
