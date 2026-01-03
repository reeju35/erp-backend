const PurchaseOrder = require("../models/PurchaseOrder");
const createAuditLog = require("../utils/createAuditLog");

// ===============================
// CREATE PURCHASE ORDER
// ===============================
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({
        message: "Supplier and at least one item are required",
      });
    }

    const purchaseOrder = await PurchaseOrder.create({
      supplier,
      items,
    });

    await createAuditLog(
      `Created purchase order with ${items.length} item(s)`,
      req.user?.email || "system"
    );

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error("Purchase Order Error:", error);
    res.status(500).json({
      message: "Failed to create purchase order",
    });
  }
};

// ===============================
// GET ALL PURCHASE ORDERS
// ===============================
exports.getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier")
      .populate("items.product");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Purchase Orders Error:", error);
    res.status(500).json({
      message: "Failed to fetch purchase orders",
    });
  }
};

// ===============================
// UPDATE PURCHASE ORDER STATUS
// ===============================
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["Pending", "Approved", "Received"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    await createAuditLog(
      `Updated purchase order ${order._id} → ${status}`,
      req.user?.email || "system"
    );

    res.status(200).json(order);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      message: "Failed to update purchase order status",
    });
  }
};

// ===============================
// GET TODAY'S PURCHASE ORDERS
// ===============================
exports.getTodayPurchaseOrders = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await PurchaseOrder.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("supplier")
      .populate("items.product");

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch today's purchase orders",
    });
  }
};

// ===============================
// GET PURCHASE ORDERS BY DATE RANGE
// ===============================
exports.getPurchaseOrdersByDate = async (req, res) => {
  try {
    const { from, to } = req.query;

    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    const orders = await PurchaseOrder.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("supplier")
      .populate("items.product");

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch purchase orders by date",
    });
  }
};

// ===============================
// DELETE PURCHASE ORDER
// ===============================
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);

    await createAuditLog(
      `Deleted purchase order ${order._id}`,
      req.user?.email || "system"
    );

    res.json({ message: "Purchase order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete purchase order" });
  }
};
