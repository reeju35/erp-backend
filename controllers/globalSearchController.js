const Product = require("../models/Product");
const SalesOrder = require("../models/SalesOrder");
const PurchaseOrder = require("../models/PurchaseOrder");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const User = require("../models/User");

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({
        products: [],
        salesOrders: [],
        purchaseOrders: [],
        invoices: [],
        customers: [],
        suppliers: [],
        users: [],
      });
    }

    // 🔑 CASE-INSENSITIVE PARTIAL SEARCH
    const regex = new RegExp(q, "i");

    const products = await Product.find({ name: regex });

    const salesOrders = await SalesOrder.find()
      .populate({
        path: "product",
        match: { name: regex },
      })
      .populate("user", "email");

    const purchaseOrders = await PurchaseOrder.find()
      .populate({
        path: "supplier",
        match: { name: regex },
      })
      .populate({
        path: "items.product",
        match: { name: regex },
      });

    const invoices = await Invoice.find()
      .populate({
        path: "order",
        populate: {
          path: "product",
          match: { name: regex },
        },
      });

    const customers = await Customer.find({
      $or: [{ name: regex }, { email: regex }],
    });

    const suppliers = await Supplier.find({
      $or: [{ name: regex }, { email: regex }],
    });

    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    });

    res.json({
      products,
      salesOrders: salesOrders.filter(o => o.product),
      purchaseOrders,
      invoices: invoices.filter(i => i.order?.product),
      customers,
      suppliers,
      users,
    });
  } catch (error) {
    console.error("GLOBAL SEARCH ERROR:", error);
    res.status(500).json({ message: "Global search failed" });
  }
};
