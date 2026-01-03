const AuditLog = require("../models/AuditLog");

// ===============================
// GET AUDIT LOGS WITH PAGINATION + SEARCH
// ===============================
exports.getAuditLogs = async (req, res) => {
  try {
    // 1️⃣ Read query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    // 2️⃣ Build search filter
    const filter = search
      ? {
          action: { $regex: search, $options: "i" },
        }
      : {};

    // 3️⃣ Count total matching logs
    const totalLogs = await AuditLog.countDocuments(filter);

    // 4️⃣ Fetch paginated logs
    const logs = await AuditLog.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 5️⃣ Send structured response
    res.json({
      data: logs,
      page,
      limit,
      total: totalLogs,
      totalPages: Math.ceil(totalLogs / limit),
    });
  } catch (error) {
    console.error("Audit Log Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
