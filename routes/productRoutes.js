const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.get("/low-stock", authMiddleware, getLowStockProducts);
module.exports = router;
