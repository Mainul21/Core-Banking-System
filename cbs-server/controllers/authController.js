const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // DB connection

const loginUser = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "Please provide both ID and password" });
  }

  try {
    console.log("Received Login ID:", id);

    // Fetch user from `users`, `customers`, `employees`, and `admins`
    const userResult = await pool.query(
      `SELECT u.*, 
              c.account_number, 
              c.balance,
              e.employee_id, 
              a.admin_id,
              u.name 
       FROM users u
       LEFT JOIN customers c ON u.id = c.id
       LEFT JOIN employees e ON u.id = e.id
       LEFT JOIN admins a ON u.id = a.id
       WHERE u.email = $1 
          OR c.account_number = $1 
          OR e.employee_id = $1 
          OR a.admin_id = $1`,
      [id]
    );

    console.log("Database Query Result:", userResult.rows);

    if (userResult.rows.length === 0) {
      console.log("User not found");
      return res.status(400).json({ msg: "Invalid ID or password" });
    }

    const user = userResult.rows[0];
    console.log("User Found:", user);

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid ID or password" });
    }

    // Determine role and set JWT payload
    let userRole = user.role;
    let uniqueID = user.id;

    // Generate JWT token
    const token = jwt.sign({ id: uniqueID, role: userRole }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Generated Token:", token);

    res.json({
      token,
      role: userRole,
      user: {
        id: uniqueID,
        email: user.email,
        role: userRole,
        name: user.name,
        balance:user.balance,
        account_number:user.account_number,
        employee_id:user.employee_id,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { loginUser };
