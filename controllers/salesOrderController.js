const SalesOrder = require("../models/SalesOrder");
const Product = require("../models/Product");
const createAuditLog = require("../utils/createAuditLog");

// ===============================
// CREATE SALES ORDER
// ===============================
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Reduce inventory
    product.quantity -= quantity;
    await product.save();

    const order = await SalesOrder.create({
      product: productId,
      quantity,
      user: req.user.id,
    });

    // ✅ Audit log (SAFE)
    await createAuditLog(
      `Created sales order for ${product.name}, Qty: ${quantity}`,
      req.user.id
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ===============================
// GET ALL ORDERS
// ===============================
exports.getOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find()
      .populate("product")
      .populate("user", "name email");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ===============================
// UPDATE ORDER (QUANTITY)
// ===============================
exports.updateOrder = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = await Product.findById(order.product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Restore old stock
    product.quantity += order.quantity;

    // Check new stock
    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Apply new quantity
    product.quantity -= quantity;
    await product.save();

    const oldQty = order.quantity;
    order.quantity = quantity;
    await order.save();

    // ✅ Audit log
    await createAuditLog(
      `Updated sales order ${order._id}: Qty ${oldQty} → ${quantity}`,
      req.user.id
    );

    // ✅ IMPORTANT: return ONLY order (frontend fix)
    res.json(order);
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    res.status(500).json({ message: "Update order failed" });
  }
};

// ===============================
// DELETE ORDER
// ===============================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    await SalesOrder.findByIdAndDelete(req.params.id);

    // ✅ Audit log
    await createAuditLog(
      `Deleted sales order ${order._id}`,
      req.user.id
    );

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    res.status(500).json({ message: "Delete order failed" });
  }
};

// ===============================
// GET TODAY'S ORDERS
// ===============================
exports.getTodayOrders = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await SalesOrder.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("product");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch today's orders" });
  }
};
