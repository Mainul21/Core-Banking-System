const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/openAccount");
const customerRoutes = require("./routes/deleteCustomerAccount");
const transactionRoutes = require("./routes/transaction");
const customerTransaction = require("./routes/customerTransaction");
const fundTransferRoutes = require("./routes/fundTransfer"); // fund transfer route
const app = express();
const port = 5000 || process.env.PORT;

// middleware

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/customer", customerRoutes); //Delete customer account route
app.use("/api/transaction", transactionRoutes); // Transaction route
app.use("/api/customer-transaction", customerTransaction); // customer transaction route
app.use("/api/fund-transfer", fundTransferRoutes); // fund transfer route

// customer info for employee dashboard
app.get("/api/customer-info", async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  }
});

// Get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email 
      FROM users u 
      WHERE u.role = 'employee'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  }
});

// Get all user accounts with role
app.get("/api/allAccounts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        c.account_number, 
        c.balance
      FROM users u
      RIGHT JOIN customers c ON u.id = c.id
      ORDER BY u.role
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  }
});

//Get transaction history for admin dashboard
app.get("/api/transaction-history", async (req, res) => {
  try {
    // Get all transactions with user role and name
    const transactionsQuery = `
      SELECT 
        t.*, 
        u.name, 
        u.role 
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `;
    const transactionsResult = await pool.query(transactionsQuery);

    // Calculate total deposit
    const totalDepositQuery = `
      SELECT COALESCE(SUM(amount), 0) AS total_deposit 
      FROM transactions 
      WHERE transaction_type = 'deposit'
    `;
    const totalDepositResult = await pool.query(totalDepositQuery);

    // Calculate total withdrawal
    const totalWithdrawalQuery = `
      SELECT COALESCE(SUM(amount), 0) AS total_withdrawal 
      FROM transactions 
      WHERE transaction_type = 'withdraw'
    `;
    const totalWithdrawalResult = await pool.query(totalWithdrawalQuery);

    // Calculate total money in bank (sum of all customer balances)
    const totalBankBalanceQuery = `
      SELECT COALESCE(SUM(balance), 0) AS total_bank_balance 
      FROM customers
    `;
    const totalBankBalanceResult = await pool.query(totalBankBalanceQuery);

    res.json({
      transactions: transactionsResult.rows,
      total_deposit: totalDepositResult.rows[0].total_deposit,
      total_withdrawal: totalWithdrawalResult.rows[0].total_withdrawal,
      total_bank_balance: totalBankBalanceResult.rows[0].total_bank_balance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  }
});

//update customers password
app.patch("/api/change-password", async (req, res) => {
  try {
    const { id, confirmPassword } = req.body; // Extract from body

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

//get user info for transaction
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

//fund transfer history for all users
app.get("/api/allFundTransfers", async (req, res) => {
  try{
    const result = await pool.query(`
      SELECT 
        ft.* 
      FROM fund_transfers ft
      ORDER BY ft.requested_at DESC
    `);
    res.json(result.rows);
  }catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  };
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
