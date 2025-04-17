const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/customer-transaction/:customerId?type=deposit&from=2024-04-01&to=2024-04-10
router.get('/:customerId', async (req, res) => {
  const userId = req.params.customerId;
  const { type, from, to } = req.query;

  try {
    let query = `
      SELECT id, transaction_type, amount, created_at 
      FROM transactions 
      WHERE user_id = $1
    `;
    const params = [userId];
    let index = 2;

    // Filter by transaction type
    if (type && (type === 'deposit' || type === 'withdraw')) {
      query += ` AND transaction_type = $${index}`;
      params.push(type);
      index++;
    }

    // Filter by from date
    if (from) {
      query += ` AND created_at >= $${index}`;
      params.push(from);
      index++;
    }

    // Filter by to date
    if (to) {
      query += ` AND created_at <= $${index}`;
      params.push(to);
      index++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch filtered transactions' });
  }
});

module.exports = router;
