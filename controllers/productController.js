const Product = require("../models/Product");
const createAuditLog = require("../utils/createAuditLog");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    const product = await Product.create({
      name,
      price,
      quantity,
    });

    // ✅ AUDIT LOG (AFTER SUCCESS)
    await createAuditLog(
      `Created product: ${product.name}`,
      req.user?.email || "system"
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await createAuditLog(
      `Updated product: ${product.name}`,
      req.user?.email || "system"
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    await createAuditLog(
      `Deleted product: ${product.name}`,
      req.user?.email || "system"
    );

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// LOW STOCK
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStock = await Product.find({ quantity: { $lte: 5 } });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
};
