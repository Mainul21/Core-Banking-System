const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/openAccount");
const customerRoutes = require('./routes/deleteCustomerAccount');
const transactionRoutes = require("./routes/transaction");

const app = express();
const port = 5000||process.env.PORT;

// middleware


app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use('/api/customer', customerRoutes); //Delete customer account route
app.use('/api/transaction', transactionRoutes); // Transaction route

// customer info for employee dashboard
app.get("/api/customer-info", async (req, res) => {
  try{
    const result = await pool.query(`SELECT
              u.id,
              c.account_number, 
              c.balance,
              u.name,
              u.email 
       FROM users u
       LEFT JOIN customers c ON u.id = c.id
       where u.role = 'customer'`);
    res.json(result.rows);
  }catch(err){
    console.error(err.message);
    res.status(500).send("Database query failed");

  }
});

//update customers password
app.patch("/api/change-password", async (req, res) => {
  try {
    const { id, confirmPassword } = req.body;  // Extract from body

    if (!id || !confirmPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
      [hashedPassword, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Backend (Express.js example)
app.get("/api/user", async (req, res) => {
  try {
      const userEmail = req.query.email;
      if (!userEmail) {
          return res.status(400).json({ error: "Missing email" });
      }

      const user = await pool.query(
          "SELECT u.id, u.name, u.email, c.account_number, c.balance FROM users u LEFT JOIN customers c ON u.id = c.id WHERE u.email = $1",
          [userEmail]
      );

      if (user.rows.length > 0) {
          res.json(user.rows[0]);
      } else {
          res.status(404).json({ error: "User not found" });
      }
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
  }
});


app.get("/", (req, res) => {
  res.send("CBS SERVER IS RUNNING");
});

app.get("/test-db", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW();"); // Fetch current timestamp
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Database query failed");
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});