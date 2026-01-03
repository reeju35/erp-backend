const PDFDocument = require("pdfkit");
const SalesOrder = require("../models/SalesOrder");
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

// ================= SALES REPORT =================
exports.getSalesReport = async (req, res) => {
  try {
    const orders = await SalesOrder.find().populate("product");

    let totalOrders = 0;
    let totalQuantity = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (!order.product) return;
      totalOrders++;
      totalQuantity += order.quantity;
      totalRevenue += order.quantity * order.product.price;
    });

    res.json({ totalOrders, totalQuantity, totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};

// ================= SALES REPORT PDF =================
exports.exportSalesReportPDF = async (req, res) => {
  try {
    const orders = await SalesOrder.find().populate("product");

    let totalRevenue = 0;
    orders.forEach((o) => {
      if (o.product) {
        totalRevenue += o.product.price * o.quantity;
      }
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ₹${totalRevenue}`);
    doc.moveDown();

    orders.forEach((o, i) => {
      if (!o.product) return;
      doc.text(
        `${i + 1}. ${o.product.name} | Qty: ${o.quantity} | ₹${
          o.product.price * o.quantity
        }`
      );
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export sales report PDF" });
  }
};

// ================= INVOICE REPORT =================
exports.getInvoiceReport = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === "Paid").length;
    const unpaidInvoices = totalInvoices - paidInvoices;

    const totalBilledAmount = invoices.reduce(
      (sum, i) => sum + i.totalAmount,
      0
    );

    res.json({
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalBilledAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate invoice report" });
  }
};

// ================= STOCK REPORT =================
exports.getStockReport = async (req, res) => {
  try {
    const products = await Product.find();

    const lowStockProducts = products.filter(
      p => p.quantity > 0 && p.quantity <= 5
    );

    const outOfStockProducts = products.filter(
      p => p.quantity === 0
    );

    res.json({
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate stock report" });
  }
};
