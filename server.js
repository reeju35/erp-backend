const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const customerRoutes = require("./routes/customerRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const grnRoutes = require("./routes/grnRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditRoutes = require("./routes/auditRoutes");
const dashboardChartRoutes = require("./routes/dashboardChartRoutes");
const globalSearchRoutes = require("./routes/globalSearchRoutes");





const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/orders", salesOrderRoutes); // 🔥 THIS FIXES 404
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/suppliers", supplierRoutes);
    app.use("/api/customers", customerRoutes);
    app.use("/api/purchase-orders", purchaseOrderRoutes);
    app.use("/api/grn", grnRoutes);
    app.use("/api/invoices", invoiceRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/audit-logs", auditRoutes);
    app.use("/api/dashboard/charts", dashboardChartRoutes);
    app.use("/api/global-search", globalSearchRoutes);
    app.use("/api/search", require("./routes/globalSearchRoutes"));












    app.get("/", (req, res) => {
      res.send("ERP Backend Running");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error(err));
