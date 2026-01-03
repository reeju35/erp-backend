const Product = require("../models/Product");
const SalesOrder = require("../models/SalesOrder");
const PurchaseOrder = require("../models/PurchaseOrder");
const Invoice = require("../models/Invoice");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await SalesOrder.countDocuments();
    const totalPurchaseOrders = await PurchaseOrder.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const lowStockProducts = await Product.countDocuments({ quantity: { $lte: 5 } });

    res.json({
      totalProducts,
      totalOrders,
      totalPurchaseOrders,
      totalInvoices,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};

exports.getDashboardCharts = async (req, res) => {
  try {
    // Orders per day (last 7 days)
    const ordersByDate = await SalesOrder.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Invoice status
    const invoiceStatus = await Invoice.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      ordersByDate,
      invoiceStatus
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard charts failed" });
  }
};
