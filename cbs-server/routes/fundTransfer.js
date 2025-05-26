const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const logAudit = require('../auditLogger'); // <-- Audit logger

router.post('/', authenticateToken, async (req, res) => {
  const { recipient_account_number, amount, sender_account_number: bodySenderAccount } = req.body;
  const user = req.user;
  const role = user.role;

  console.log('Incoming transfer request:', { recipient_account_number, amount, bodySenderAccount, user });

  let transactionStarted = false;

  try {
    let sender_id = user.id;
    let sender_account_number;

    if (role === 'employee') {
      console.log('Role is employee');

      if (!bodySenderAccount) {
        return res.status(400).json({ error: 'Sender account number required for employee transfers' });
      }

      const senderQuery = await pool.query(
        'SELECT id, account_number, balance FROM customers WHERE account_number = $1',
        [bodySenderAccount]
      );

      if (senderQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Sender not found' });
      }

      const sender = senderQuery.rows[0];
      sender_id = sender.id;
      sender_account_number = sender.account_number;

      if (parseFloat(sender.balance) < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      await pool.query('BEGIN');
      transactionStarted = true;

      await pool.query(
        'UPDATE customers SET balance = balance - $1 WHERE account_number = $2',
        [amount, sender_account_number]
      );

      await pool.query(
        'UPDATE customers SET balance = balance + $1 WHERE account_number = $2',
        [amount, recipient_account_number]
      );

      const insert = await pool.query(
        `INSERT INTO fund_transfers (sender_id, sender_account_number, receiver_account_number, amount, status, approved_by, approved_at)
         VALUES ($1, $2, $3, $4, 'approved', $5, CURRENT_TIMESTAMP) RETURNING *`,
        [sender_id, sender_account_number, recipient_account_number, amount, user.id]
      );

      await logAudit({
        user_id: user.id,
        action: 'approved fund transfer (employee)',
        target_type: 'fund_transfer',
        target_id: insert.rows[0].id,
        metadata: {
          sender_account_number,
          recipient_account_number,
          amount,
          status: 'approved'
        }
      });

      await pool.query('COMMIT');
      return res.status(201).json({ message: 'Transfer completed and approved', data: insert.rows[0] });

    } else {
      // Customer transfer
      const senderQuery = await pool.query(
        'SELECT account_number, balance FROM customers WHERE id = $1',
        [sender_id]
      );

      if (senderQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Sender not found' });
      }

      const sender = senderQuery.rows[0];
      sender_account_number = sender.account_number;

      if (parseFloat(sender.balance) < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const insert = await pool.query(
        `INSERT INTO fund_transfers (sender_id, sender_account_number, receiver_account_number, amount, status)
         VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [sender_id, sender_account_number, recipient_account_number, amount]
      );

      await logAudit({
        user_id: sender_id,
        action: 'initiated fund transfer',
        target_type: 'fund_transfer',
        target_id: insert.rows[0].id,
        metadata: {
          sender_account_number,
          recipient_account_number,
          amount,
          status: 'pending'
        }
      });

      return res.status(201).json({ message: 'Transfer request created (pending approval)', data: insert.rows[0] });
    }
  } catch (err) {
    if (transactionStarted) {
      await pool.query('ROLLBACK');
    }
    console.error('Error during fund transfer:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/pending', authenticateToken, async (req, res) => {
  const user = req.user;
  if (user.role !== 'employee') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM fund_transfers WHERE status = $1 ORDER BY requested_at DESC',
      ['pending']
    );
    res.json({ pendingTransfers: result.rows });
  } catch (err) {
    console.error('Error fetching pending transfers:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/approve/:id', authenticateToken, async (req, res) => {
  const user = req.user;
  if (user.role !== 'employee') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const transferId = req.params.id;
  let transactionStarted = false;

  try {
    await pool.query('BEGIN');
    transactionStarted = true;

    const transferQuery = await pool.query(
      'SELECT * FROM fund_transfers WHERE id = $1 AND status = $2',
      [transferId, 'pending']
    );

    if (transferQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Pending transfer not found' });
    }

    const transfer = transferQuery.rows[0];

    const senderQuery = await pool.query(
      'SELECT balance FROM customers WHERE account_number = $1',
      [transfer.sender_account_number]
    );

    const sender = senderQuery.rows[0];
    if (!sender || parseFloat(sender.balance) < parseFloat(transfer.amount)) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance for sender' });
    }

    await pool.query(
      'UPDATE customers SET balance = balance - $1 WHERE account_number = $2',
      [transfer.amount, transfer.sender_account_number]
    );

    await pool.query(
      'UPDATE customers SET balance = balance + $1 WHERE account_number = $2',
      [transfer.amount, transfer.receiver_account_number]
    );

    const empIDQuery = await pool.query(
      'SELECT employee_id FROM employees WHERE id = $1',
      [user.id]
    );
    console.log('Employee ID query result:', empIDQuery.rows);

    const employeeId = empIDQuery.rows[0].employee_id;

    await pool.query(
      `UPDATE fund_transfers 
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [employeeId, transferId]
    );

    await logAudit({
      user_id: user.id,
      action: 'approved pending fund transfer',
      target_type: 'fund_transfer',
      target_id: transferId,
      metadata: {
        sender_account_number: transfer.sender_account_number,
        receiver_account_number: transfer.receiver_account_number,
        amount: transfer.amount,
        status: 'approved'
      }
    });

    await pool.query('COMMIT');
    res.json({ message: 'Transfer approved and completed' });

  } catch (err) {
    if (transactionStarted) await pool.query('ROLLBACK');
    console.error('Error approving transfer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
