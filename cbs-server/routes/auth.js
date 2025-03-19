const express = require("express");
const { loginUser} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../db");
const router = express.Router();


// Login route
router.post("/login", loginUser);

//user route
// In your backend route (authRoutes.js)
router.get("/user", authMiddleware(), async (req, res) => {
    try {
        console.log("Fetching user data for ID:", req.user?.id); // Debugging
        console.log("Decoded JWT User Data:", req.user); // Debugging
        const user = await pool.query("SELECT id, email, role, name, balance, account_number FROM users WHERE id = $1", [req.user.id]);
        if (user.rows.length === 0) {
            console.log("User not found in database"); // Debugging
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User data fetched:", user.rows[0]); // Debugging
        res.json(user.rows[0]);
    } catch (error) {
        console.error("Error fetching user data:", error.message); // Debugging
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Protected routes
// Customer dashboard (only accessible to customers)
// router.get("/dashboard/customer", authMiddleware, customerDashboard);

// Admin dashboard (only accessible to admins)
// router.get("/dashboard/admin", authMiddleware, adminDashboard);

// Employee dashboard (only accessible to employees)
// router.get("/dashboard/employee", authMiddleware, employeeDashboard);

module.exports = router;
