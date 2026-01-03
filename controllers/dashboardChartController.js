const SalesOrder = require("../models/SalesOrder");
const Product = require("../models/Product");

// 📊 Sales Orders Per Day
exports.salesChart = async (req, res) => {
  try {
    const data = await SalesOrder.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Sales chart failed" });
  }
};

// 💰 Revenue Per Day
exports.revenueChart = async (req, res) => {
  try {
    const data = await SalesOrder.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: {
            $sum: { $multiply: ["$quantity", "$product.price"] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Revenue chart failed" });
  }
};

// 📦 Stock Status
exports.stockChart = async (req, res) => {
  try {
    const products = await Product.find();

    const inStock = products.filter(p => p.quantity > 5).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    res.json([
      { name: "In Stock", value: inStock },
      { name: "Low Stock", value: lowStock },
      { name: "Out of Stock", value: outOfStock },
    ]);
  } catch (error) {
    res.status(500).json({ message: "Stock chart failed" });
  }
};
