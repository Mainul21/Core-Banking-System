const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL connection
const authenticateToken = require("../middleware/authMiddleware"); // Ensure the path is correct

// DELETE customer account
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the customer exists
        const customerCheck = await pool.query("SELECT id FROM customers WHERE id = $1", [id]);
        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Delete the user (Cascade deletes customer)
        await pool.query("DELETE FROM users WHERE id = $1", [id]);

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
