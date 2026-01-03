const express = require("express");
const {
  salesChart,
  revenueChart,
  stockChart,
} = require("../controllers/dashboardChartController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", authMiddleware, salesChart);
router.get("/revenue", authMiddleware, revenueChart);
router.get("/stock", authMiddleware, stockChart);

module.exports = router;
