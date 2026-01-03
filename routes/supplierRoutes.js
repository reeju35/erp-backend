const express = require("express");
const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin-only supplier management
router.post("/", authMiddleware, adminMiddleware, createSupplier);
router.get("/", authMiddleware, adminMiddleware, getSuppliers);
router.put("/:id", authMiddleware, adminMiddleware, updateSupplier);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSupplier);

module.exports = router;
