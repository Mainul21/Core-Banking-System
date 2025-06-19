const pool = require("../db");

const logAudit = async ({ user_id, action, target_type, target_id = null, metadata = {} }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, action, target_type, target_id, metadata]
    );
  } catch (err) {
    console.error("Failed to log audit entry:", err);
    // Optionally: write to a fallback log file if DB fails
  }
};

module.exports = logAudit;
