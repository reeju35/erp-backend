const GRN = require("../models/GRN");
const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const createAuditLog = require("../utils/createAuditLog");

// ===============================
// CREATE GRN + UPDATE INVENTORY
// ===============================
exports.createGRN = async (req, res) => {
  try {
    const { purchaseOrder, receivedItems } = req.body;

    if (!purchaseOrder || !receivedItems || receivedItems.length === 0) {
      return res.status(400).json({
        message: "Purchase order and received items are required",
      });
    }

    // 1️⃣ Create GRN
    const grn = await GRN.create({
      purchaseOrder,
      receivedItems,
    });

    // 2️⃣ Update inventory
    for (const item of receivedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantityReceived },
      });
    }

    // 3️⃣ Update purchase order status
    await PurchaseOrder.findByIdAndUpdate(purchaseOrder, {
      status: "Received",
    });

    // 4️⃣ AUDIT LOGS (SAFE)
    await createAuditLog(
      `Created GRN for Purchase Order ${purchaseOrder}`,
      req.user?.email || "system"
    );

    for (const item of receivedItems) {
      await createAuditLog(
        `Inventory updated: Product ${item.product}, Qty +${item.quantityReceived}`,
        req.user?.email || "system"
      );
    }

    await createAuditLog(
      `Purchase Order ${purchaseOrder} marked as Received`,
      req.user?.email || "system"
    );

    res.status(201).json({
      message: "GRN created, inventory updated, purchase order received",
      grn,
    });
  } catch (error) {
    console.error("GRN Error:", error);
    res.status(500).json({
      message: "Failed to create GRN",
    });
  }
};
