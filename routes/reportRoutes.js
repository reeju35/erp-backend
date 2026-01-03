const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getSalesReport,
  getInvoiceReport,
  getStockReport,
  exportSalesReportPDF,
} = require("../controllers/reportController");

const router = express.Router();

// Sales report (JSON)
router.get("/sales", authMiddleware, getSalesReport);

// Sales report (PDF)
router.get("/sales/pdf", authMiddleware, exportSalesReportPDF);

// Invoice report
router.get("/invoices", authMiddleware, getInvoiceReport);

// Stock report
router.get("/stock", authMiddleware, getStockReport);

module.exports = router;
