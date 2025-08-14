const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// GET audit logs for a specific branch (same format as admin view)
router.get("/branch", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // from token
    // console.log("User ID from token:", userId);

    // 1. Get branch_id for the employee
    const empResult = await pool.query(
      "SELECT branch_id FROM employees WHERE id = $1",
      [userId]
    );

    if (empResult.rows.length === 0) {
      return res.status(403).json({ error: "User is not an employee" });
    }

    const branchId = empResult.rows[0].branch_id;

    // 2. Get audit logs for that branch in the same structure as admin logs
    const logsResult = await pool.query(
      `
      SELECT 
        al.id,
        al.user_id,
        u.name AS user_name,
        u.role AS user_role,
        al.action,
        al.target_type,
        al.target_id,
        al.metadata,
        al.timestamp
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      JOIN employees e ON u.id = e.id
      WHERE e.branch_id = $1
      ORDER BY al.timestamp DESC
      `,
      [branchId]
    );

    res.json(logsResult.rows);
  } catch (err) {
    console.error("Error fetching branch audit logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
