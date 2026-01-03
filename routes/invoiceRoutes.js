const { downloadInvoicePDF } = require("../controllers/invoiceController");

const express = require("express");
const {
  createInvoice,
  getInvoices,
  markInvoicePaid,
  deleteInvoice,
  getPendingOrdersForInvoice,
} = require("../controllers/invoiceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create invoice
router.post("/", authMiddleware, createInvoice);

// Get all invoices
router.get("/", authMiddleware, getInvoices);

// Get orders WITHOUT invoices (for dropdown)
router.get("/pending-orders", authMiddleware, getPendingOrdersForInvoice);

// Mark invoice paid
router.put("/:id/pay", authMiddleware, markInvoicePaid);

// Delete invoice
router.delete("/:id", authMiddleware, deleteInvoice);

router.get("/:id/pdf", authMiddleware, downloadInvoicePDF);


module.exports = router;
