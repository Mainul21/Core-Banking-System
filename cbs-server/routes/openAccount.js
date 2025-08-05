const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const logAudit = require("../tools/auditLogger"); // Add this line at the top

const router = express.Router();

// Function to generate a random 4-digit account number
const generateAccountNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `ACC${randomDigits}`;
};

// Function to generate a random password (Employees will share it with the customer)
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Employee creates a customer account
router.post("/", async (req, res) => {
  try {
    const { name, email, address, phone, amount, branch_id } = req.body; // Accept branch_id

    // Check if the email is already registered
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if branch_id exists
    const branchExists = await pool.query(
      "SELECT id FROM branches WHERE id = $1",
      [branch_id]
    );
    if (branchExists.rows.length === 0) {
      return res.status(400).json({ error: "Invalid branch ID" });
    }

    // Generate random password and hash it
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Insert new user into users table with role "customer"
    const newUser = await pool.query(
      "INSERT INTO users (name, email, phone_number, address, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [name, email, phone, address, hashedPassword, "customer"]
    );

    const userId = newUser.rows[0].id;
    const accountNumber = generateAccountNumber();
    const initialBalance = amount;

    // Insert into customers table
    await pool.query(
      "INSERT INTO customers (id, account_number, balance, branch_id) VALUES ($1, $2, $3, $4)",
      [userId, accountNumber, initialBalance, branch_id] // Include branch_id in the insert
    );

    // Log the account creation
    await logAudit({
      user_id: null, // or pass the employee's ID if available
      action: "Create Customer Account",
      target_type: "User",
      target_id: userId,
      metadata: {
        name,
        email,
        phone,
        address,
        account_number: accountNumber,
        initial_balance: initialBalance,
        branch_id, // Include branch_id in metadata
      },
    });

    // Return generated credentials to employee
    res.status(201).json({
      message: "Customer account created successfully",
      id: userId,
      name: name,
      email: email,
      account_number: accountNumber,
      password: tempPassword, // Employee will share this with the customer
      amount: initialBalance,
      branch_id, // Include the branch_id in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
