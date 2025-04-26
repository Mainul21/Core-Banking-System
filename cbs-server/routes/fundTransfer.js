const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

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
        console.error('Sender account number missing for employee transfer');
        return res.status(400).json({ error: 'Sender account number required for employee transfers' });
      }

      const senderQuery = await pool.query(
        'SELECT id, account_number, balance FROM customers WHERE account_number = $1',
        [bodySenderAccount]
      );

      if (senderQuery.rows.length === 0) {
        console.error('Sender not found for account number:', bodySenderAccount);
        return res.status(404).json({ error: 'Sender not found' });
      }

      const sender = senderQuery.rows[0];
      sender_id = sender.id;
      sender_account_number = sender.account_number;

      console.log('Sender details fetched:', sender);

      if (parseFloat(sender.balance) < amount) {
        console.error('Insufficient balance for sender:', sender_account_number);
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      console.log('Starting transaction...');
      await pool.query('BEGIN');
      transactionStarted = true;

      await pool.query(
        'UPDATE customers SET balance = balance - $1 WHERE account_number = $2',
        [amount, sender_account_number]
      );
      console.log(`Debited ${amount} from sender:`, sender_account_number);

      await pool.query(
        'UPDATE customers SET balance = balance + $1 WHERE account_number = $2',
        [amount, recipient_account_number]
      );
      console.log(`Credited ${amount} to recipient:`, recipient_account_number);

      // Insert the fund transfer with approved details (approved_by and approved_at)
      const insert = await pool.query(
        `INSERT INTO fund_transfers (sender_id, sender_account_number, receiver_account_number, amount, status, approved_by, approved_at)
         VALUES ($1, $2, $3, $4, 'approved', $5, CURRENT_TIMESTAMP) RETURNING *`,
        [sender_id, sender_account_number, recipient_account_number, amount, user.id] // Set `approved_by` to employee's ID and `approved_at` to current time
      );

      console.log('Transfer record inserted:', insert.rows[0]);

      await pool.query('COMMIT');
      console.log('Transaction committed');

      return res.status(201).json({ message: 'Transfer completed and approved', data: insert.rows[0] });

    } else {
      // Customer transfer (no BEGIN needed)
      console.log('Role is customer');

      const senderQuery = await pool.query(
        'SELECT account_number, balance FROM customers WHERE id = $1',
        [sender_id]
      );

      if (senderQuery.rows.length === 0) {
        console.error('Sender not found for customer ID:', sender_id);
        return res.status(404).json({ error: 'Sender not found' });
      }

      const sender = senderQuery.rows[0];
      sender_account_number = sender.account_number;

      console.log('Sender details fetched:', sender);

      if (parseFloat(sender.balance) < amount) {
        console.error('Insufficient balance for customer:', sender_account_number);
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const insert = await pool.query(
        `INSERT INTO fund_transfers (sender_id, sender_account_number, receiver_account_number, amount, status)
         VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [sender_id, sender_account_number, recipient_account_number, amount]
      );

      console.log('Pending transfer request inserted:', insert.rows[0]);

      return res.status(201).json({ message: 'Transfer request created (pending approval)', data: insert.rows[0] });
    }
  } catch (err) {
    if (transactionStarted) {
      await pool.query('ROLLBACK');
      console.log('Transaction rolled back due to error');
    }
    console.error('Error occurred during transfer:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;