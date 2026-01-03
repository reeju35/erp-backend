const Supplier = require("../models/Supplier");

// CREATE SUPPLIER
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to create supplier" });
  }
};

// GET ALL SUPPLIERS
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

// UPDATE SUPPLIER
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to update supplier" });
  }
};

// DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};
