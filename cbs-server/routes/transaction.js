const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/transaction
router.post("/", async (req, res) => {
  try {
    const { acc_number, type, amount, id } = req.body;
    const numericAmount = parseFloat(amount);
    const trimmedAccNumber = acc_number.trim();

    console.log("Received transaction request:");
    console.log({ acc_number, trimmedAccNumber, type, numericAmount, id });

    // Validation
    if (!trimmedAccNumber || !type || !amount || !id) {
      if (!type) {
        return res.status(400).json({ success: false, message: "Transaction type is required" });
      } else if (!acc_number) {
        return res.status(400).json({ success: false, message: "Account number is required" });
      } else if (!amount) {
        return res.status(400).json({ success: false, message: "Amount is required" });
      } else if (!id) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Fetch user
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    console.log("User query result:", userResult.rows);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch customer account
    const accResult = await pool.query("SELECT * FROM customers WHERE account_number = $1", [trimmedAccNumber]);
    console.log("Customer query result:", accResult.rows);

    if (accResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid account number" });
    }

    const account = accResult.rows[0];
    let updatedBalance = parseFloat(account.balance);
    console.log("Original balance:", updatedBalance);

    // Handle transaction
    if (type === "deposit") {
      updatedBalance += numericAmount;
    } else if (type === "withdraw") {
      if (updatedBalance < numericAmount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }
      updatedBalance -= numericAmount;
    } else {
      return res.status(400).json({ success: false, message: "Invalid transaction type" });
    }

    console.log("New balance to update:", updatedBalance);

    // Update balance
    const updateResult = await pool.query(
      "UPDATE customers SET balance = $1 WHERE account_number = $2",
      [updatedBalance, trimmedAccNumber]
    );
    console.log("Balance update result:", updateResult);

    if (updateResult.rowCount === 0) {
      console.error("Balance update failed: no matching account found.");
      return res.status(500).json({ success: false, message: "Balance update failed" });
    }

    // Insert transaction record
    const insertResult = await pool.query(
      "INSERT INTO transactions (user_id, account_number, transaction_type, amount) VALUES ($1, $2, $3, $4)",
      [id, trimmedAccNumber, type, numericAmount]
    );
    console.log("Transaction inserted:", insertResult.rowCount > 0);

    return res.status(200).json({ success: true, message: "Transaction completed successfully", newBalance: updatedBalance });

  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
