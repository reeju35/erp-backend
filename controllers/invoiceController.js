const Invoice = require("../models/Invoice");
const SalesOrder = require("../models/SalesOrder");
const createAuditLog = require("../utils/createAuditLog");
const PDFDocument = require("pdfkit");

/**
 * CREATE INVOICE (only once per order)
 */
exports.createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await SalesOrder.findById(orderId).populate("product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const existingInvoice = await Invoice.findOne({ order: orderId });
    if (existingInvoice) {
      return res.status(400).json({
        message: "Invoice already exists for this order",
      });
    }

    const totalAmount = order.product.price * order.quantity;

    const invoice = await Invoice.create({
      order: order._id,
      totalAmount,
      status: "Unpaid",
    });

    // ✅ AUDIT LOG
    await createAuditLog(
      `Generated invoice for order ${order._id}`,
      req.user?.email || "system"
    );

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};

/**
 * GET ALL INVOICES
 */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: "order",
        populate: { path: "product" },
      })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

/**
 * GET ORDERS WITHOUT INVOICES (for dropdown)
 */
exports.getPendingOrdersForInvoice = async (req, res) => {
  try {
    const invoices = await Invoice.find().select("order");
    const invoicedOrderIds = invoices.map((i) => i.order.toString());

    const orders = await SalesOrder.find({
      _id: { $nin: invoicedOrderIds },
    }).populate("product");

    res.json(orders);
  } catch (error) {
    console.error("Pending Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

/**
 * MARK INVOICE AS PAID
 */
exports.markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "Paid";
    await invoice.save();

    // ✅ AUDIT LOG
    await createAuditLog(
      `Marked invoice ${invoice._id} as Paid`,
      req.user?.email || "system"
    );

    res.json({ message: "Invoice marked as Paid", invoice });
  } catch (error) {
    res.status(500).json({ message: "Failed to update invoice" });
  }
};

/**
 * DELETE INVOICE
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    // ✅ AUDIT LOG
    await createAuditLog(
      `Deleted invoice ${invoice._id}`,
      req.user?.email || "system"
    );

    res.json({ message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete invoice" });
  }
};

/**
 * DOWNLOAD INVOICE PDF
 */
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "order",
      populate: { path: "product" },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice No: INV-${invoice._id.slice(-6)}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    doc.text(`Product: ${invoice.order.product.name}`);
    doc.text(`Quantity: ${invoice.order.quantity}`);
    doc.text(`Price: ₹${invoice.order.product.price}`);
    doc.moveDown();

    doc.fontSize(14).text(`Total Amount: ₹${invoice.totalAmount}`, {
      underline: true,
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
};
