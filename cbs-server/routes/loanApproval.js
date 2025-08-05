const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const logAudit = require('../tools/auditLogger');
const { sendLoanNotification } = require('../emailService'); 

// Approve a loan request
router.patch('/approve/:id', authenticateToken, async (req, res) => {
    const user = req.user;

    // Only admins can approve loans
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const loanId = req.params.id;

    try {
        // 1. Get loan details
        const loanQuery = await pool.query('SELECT * FROM loans WHERE id = $1', [loanId]);
        const loan = loanQuery.rows[0];

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({ error: 'Loan already processed' });
        }

        const { amount, term_months, interest_rate, account_number } = loan;

        // 2. Calculate EMI
        const P = parseFloat(amount);
        const R = parseFloat(interest_rate) / 12 / 100;
        const N = parseInt(term_months);

        const EMI = parseFloat(
            (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
        ).toFixed(2);

        // 3. Update loan status to approved
        await pool.query(
            `UPDATE loans 
             SET status = 'approved', approved_by = $1, approved_at = NOW(), monthly_due = $2 
             WHERE id = $3`,
            [user.admin_id, EMI, loanId]
        );

        // 4. Generate payment schedule
        const today = new Date();
        for (let i = 1; i <= N; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(dueDate.getMonth() + i);

            await pool.query(
                `INSERT INTO loan_payments (loan_id, due_date, amount_due) 
                 VALUES ($1, $2, $3)`,
                [loanId, dueDate.toISOString().split('T')[0], EMI]
            );
        }

        // 5. Get customer email using account_number (from customers table)
        const customerResult = await pool.query(
            "SELECT email FROM users WHERE id = (SELECT id FROM customers WHERE account_number = $1)",
            [account_number] // Use account_number to get user email
        );

        if (customerResult.rowCount === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const customerEmail = customerResult.rows[0].email;

        // 6. Send an email to the customer about loan approval
        await sendLoanNotification(customerEmail, "approved");

        // 7. Log audit
        await logAudit({
            user_id: user.id,
            action: 'loan_approved',
            target_type: 'loan',
            target_id: loanId,
            metadata: {
                approved_by: user.admin_id,
                emi: EMI,
                term_months: N,
                interest_rate: interest_rate
            }
        });

        return res.status(200).json({
            message: 'Loan approved and EMI schedule generated',
            monthly_emi: EMI,
            total_months: N
        });

    } catch (error) {
        console.error('Error approving loan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Reject a loan request
router.patch('/reject/:id', authenticateToken, async (req, res) => {
  const user = req.user;

  // Only admins can reject loans
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const loanId = req.params.id;

  try {
    // 1. Get loan details
    const loanQuery = await pool.query('SELECT * FROM loans WHERE id = $1', [loanId]);
    const loan = loanQuery.rows[0];

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan already processed' });
    }

    // 2. Update status to rejected
    await pool.query(
      `UPDATE loans 
       SET status = 'rejected', approved_by = $1, approved_at = NOW() 
       WHERE id = $2`,
      [user.admin_id, loanId]
    );

    // 3. Get customer email using account_number (from customers table)
    const customerResult = await pool.query(
      "SELECT email FROM users WHERE id = (SELECT id FROM customers WHERE account_number = $1)",
      [loan.account_number] // Use account_number to get user email
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerEmail = customerResult.rows[0].email;

    // 4. Send an email to the customer about loan rejection
    await sendLoanNotification(customerEmail, "rejected");

    // 5. Log audit
    await logAudit({
      user_id: user.id,
      action: 'loan_rejected',
      target_type: 'loan',
      target_id: loanId,
      metadata: {
        rejected_by: user.admin_id
      }
    });

    res.status(200).json({ message: 'Loan rejected successfully' });

  } catch (error) {
    console.error('Error rejecting loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;