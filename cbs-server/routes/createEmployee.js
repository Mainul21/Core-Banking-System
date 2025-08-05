const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // PostgreSQL connection

// Route to create an employee
router.post('/', async (req, res) => {
  const {
    name,
    email,
    password,
    employee_id,
    department,
    branch_id, // Add the branch_id from the request body
    phone, // New phone field
    address, // New address field
  } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !employee_id || !department || !branch_id || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Check if email already exists
    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 2. Check if employee ID already exists
    const empIdExists = await pool.query(
      'SELECT id FROM employees WHERE employee_id = $1',
      [employee_id]
    );
    if (empIdExists.rows.length > 0) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // 3. Check if the branch exists (ensure a valid branch_id is passed)
    const branchExists = await pool.query(
      'SELECT id FROM branches WHERE id = $1',
      [branch_id]
    );
    if (branchExists.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid branch selected' });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert into users table
    const userInsert = await pool.query(
      `INSERT INTO users (email, password, role, name, phone_number, address)
       VALUES ($1, $2, 'employee', $3, $4, $5)
       RETURNING id`,
      [email, hashedPassword, name, phone, address]
    );
    const userId = userInsert.rows[0].id;

    // 6. Insert into employees table, with branch_id, phone, and address
    await pool.query(
      `INSERT INTO employees (id, employee_id, department, branch_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, employee_id, department, branch_id]
    );

    return res.status(201).json({ message: 'Employee account created successfully', userId });
  } catch (err) {
    console.error('Error in /create-employee:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
