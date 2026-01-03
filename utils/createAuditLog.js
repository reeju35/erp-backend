const AuditLog = require("../models/AuditLog");

const createAuditLog = async (action, user) => {
  try {
    console.log("🔥 AUDIT LOG FUNCTION CALLED");
    console.log("ACTION:", action);
    console.log("USER:", user);

    await AuditLog.create({
      action,
      user: user || "system", // ✅ fallback
    });
  } catch (error) {
    console.error("❌ AUDIT LOG ERROR:", error.message);
  }
};

module.exports = createAuditLog;
