const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

router.get('/:account_number', authenticateToken, async (req, res) => {
  const { account_number } = req.params;

  try {
    // Get all fund transfer transactions for the user (sent or received)
    const fundTransfersQuery = await pool.query(
      'SELECT * FROM fund_transfers WHERE sender_account_number = $1 OR receiver_account_number = $1 ORDER BY requested_at DESC',
      [account_number]
    );

    // Get all loan IDs for the user
    const loanQuery = await pool.query(
      'SELECT id FROM loans WHERE account_number = $1',
      [account_number]
    );

    // Initialize an array to store loan payments
    const loanPayments = [];

    // If the user has loans, fetch the loan payments
    if (loanQuery.rows.length > 0) {
      for (let loan of loanQuery.rows) {
        const loanPaymentsQuery = await pool.query(
          'SELECT * FROM loan_payments WHERE loan_id = $1 ORDER BY paid_at DESC',
          [loan.id]
        );
        // console.log('loan fetched',loanPaymentsQuery.rowCount);
        loanPayments.push(...loanPaymentsQuery.rows);
      }
    }

    // Get all deposit transactions for the user
    const depositsQuery = await pool.query(
      'SELECT * FROM transactions WHERE account_number = $1 AND transaction_type = $2 ORDER BY created_at DESC',
      [account_number, 'deposit']
    );

    // Get all withdrawal transactions for the user
    const withdrawalsQuery = await pool.query(
      'SELECT * FROM transactions WHERE account_number = $1 AND transaction_type = $2 ORDER BY created_at DESC',
      [account_number, 'withdrawal']
    );

    // Combine all types of transactions
    const transactions = [
      ...fundTransfersQuery.rows.map((transaction) => ({
        ...transaction,
        transaction_type: transaction.sender_account_number === account_number ? 'Sent' : 'Received',
        amount: transaction.amount,
        created_at: transaction.approved_at,
      })),
      ...loanPayments.map((payment) => ({
        ...payment,
        transaction_type: 'Loan Payment',
        amount: payment.amount_paid,
        created_at: payment.paid_at,
      })),
      ...depositsQuery.rows.map((deposit) => ({
        ...deposit,
        transaction_type: 'Deposit',
        amount: deposit.amount,
        created_at: deposit.created_at,
      })),
      ...withdrawalsQuery.rows.map((withdrawal) => ({
        ...withdrawal,
        transaction_type: 'Withdrawal',
        amount: withdrawal.amount,
        created_at: withdrawal.created_at,
      })),
    ];

    // Sort all transactions by date (descending)
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // console.log(transactions);
    res.json(transactions);

  } catch (error) {
    console.error('Error fetching account statement:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
