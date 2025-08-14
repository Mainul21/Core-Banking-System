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
const fundTransferRoutes = require("./routes/fundTransfer");
const createEmployeeRoutes = require("./routes/createEmployee"); 
const loanRequestRoutes = require("./routes/loanRequest"); 
const loanApprovalRoutes = require("./routes/loanApproval"); 
const customerLoanRoutes = require('./routes/customerLoan');
const branchRoutes = require("./routes/branch"); 
const statementRoutes = require("./routes/statement"); 
const auditLogBranchRoutes = require("./routes/auditLogBranch"); 


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
app.use("/api/create-employee", createEmployeeRoutes); // Create employee route
app.use("/api/loan-request", loanRequestRoutes); // Loan request route
app.use("/api/loan-approval", loanApprovalRoutes); // Loan approval route
app.use('/api/customer-loan', customerLoanRoutes); // Customer loan route
app.use("/api/branches", branchRoutes); // Branch route
app.use("/api/statement", statementRoutes); // Account statement route
app.use("/api/audit-logs", auditLogBranchRoutes); // Audit logs by branch route
// Exchange Rate API
app.get("/api/exchange-rate", async (req, res) => {
  try {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/BDT`
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    const filteredRates = {
      USD: data.conversion_rates.USD,
      EUR: data.conversion_rates.EUR,
      CAD: data.conversion_rates.CAD,
      AUD: data.conversion_rates.AUD
    };
    res.json({
      base: data.base_code,
      date: data.time_last_update_utc,
      rates: filteredRates
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error.message);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

// Audit Logs
// Get audit logs for admin dashboard
app.get("/api/audit-logs", async (req, res) => {
  try {
    const result = await pool.query(`
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
      ORDER BY al.timestamp DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database query failed");
  }
});


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

// delete employee account
app.delete("/api/employees/:id", async (req, res) => {
  const employeeId = req.params.id;
  console.log("Deleting employee with ID:", employeeId);
  try {
    // 1. Find user_id linked to employee ID
    const employeeResult = await pool.query(
      "SELECT id FROM employees WHERE id = $1",
      [employeeId]
    );
    console.log("employee found" , employeeResult.rows);

    if (employeeResult.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const userId = employeeResult.rows[0].id;
    console.log("userId found:", userId);

    // 2. Delete user with the retrieved userId if role is 'employee'
    const deleteResult = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role = 'employee'",
      [userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    // 3. Optionally, delete employee record if you want to cascade delete
    await pool.query("DELETE FROM employees WHERE id = $1", [employeeId]);

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err.message);
    res.status(500).json({ message: "Server error deleting employee" });
  }
});

// delete customer account
app.delete("/api/customers/:id", async (req, res) => {
  const customerId = req.params.id;
  console.log("Deleting customer with ID:", customerId);

  try {
    // 1. Find user_id linked to customer ID
    const customerResult = await pool.query(
      "SELECT id FROM customers WHERE id = $1",
      [customerId]
    );
    console.log("Customer found:", customerResult.rows);

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const userId = customerResult.rows[0].id;
    console.log("userId found:", userId);

    // 2. Delete user with the retrieved userId if role is 'customer'
    const deleteUser = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role = 'customer'",
      [userId]
    );

    if (deleteUser.rowCount === 0) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    // 3. Optionally delete customer record if not already deleted by CASCADE
    await pool.query("DELETE FROM customers WHERE id = $1", [customerId]);

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Error deleting customer:", err.message);
    res.status(500).json({ message: "Server error deleting customer" });
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
    console.log("Updating password for ID:", id);

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
// forget password

app.patch("/api/forgot-password", async (req, res) => {
  try {
    const { account_number, newPassword } = req.body;

    if (!account_number || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let userId = null;
    let tableName = "";
    let accountColumn = "";

    

    const customerResult = await pool.query(
      "SELECT * FROM customers WHERE account_number = $1",
      [account_number]
    );

    if (customerResult.rowCount > 0) {
      userId = customerResult.rows[0].id;
      tableName = "customers";
      accountColumn = "account_number";
    }

    else {
      const employeeResult = await pool.query(
        "SELECT * FROM employees WHERE employee_id = $1",
        [account_number]
      );
      if (employeeResult.rowCount > 0) {
        userId = employeeResult.rows[0].id;
        tableName = "employees";
        accountColumn = "employee_id";
      }
    }

    if (!userId) {
      const adminResult = await pool.query(
        "SELECT * FROM admins WHERE admin_id = $1",
        [account_number]
      );
      if (adminResult.rowCount > 0) {
        userId = adminResult.rows[0].id;
        tableName = "admins";
        accountColumn = "admin_id";
      }
    }

    if (!userId) {
      return res.status(404).json({ error: "Account number not found" });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);


    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    if (updateResult.rowCount === 0) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
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
