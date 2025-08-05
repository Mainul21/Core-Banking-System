const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const logAudit = require('../tools/auditLogger'); // <-- Audit logger

router.post('/', authenticateToken, async (req, res) => {
    const {accountNumber, requested_by, amount, term_months, interest_rate, purpose} = req.body;
    const user = req.user;
    const role = user.role;

    console.log('Incoming loan request:', { accountNumber, requested_by, amount, term_months, interest_rate, purpose, user });

    if (!accountNumber || !requested_by || !amount || !term_months || !interest_rate || !purpose) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try{
        const employeeQuery = await pool.query("SELECT branch_id FROM employees WHERE id = $1", [user.id]);
        if (employeeQuery.rowCount === 0) {
            return res.status(403).json({ error: 'Access denied. Employee not found.' });
        }   

        const employeeBranchId = employeeQuery.rows[0].branch_id;

        const customerQuery = await pool.query(
            "SELECT branch_id FROM customers WHERE account_number = $1",
            [accountNumber]);
        if (customerQuery.rowCount === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customerId = customerQuery.rows[0].branch_id;

        if (employeeBranchId !== customerId) {
            return res.status(403).json({ error: 'Access denied. Customer does not belong to your branch.' });
        }


        const requestQuery = await pool.query(
        'Insert into loans (account_number, requested_by, amount, term_months, interest_rate, purpose) values ($1, $2, $3, $4, $5, $6) RETURNING *',
        [accountNumber, requested_by, amount, term_months, interest_rate, purpose]
    );

    const loanRequest = requestQuery.rows[0];
    console.log('Loan request created:', loanRequest);

    await logAudit({
        user_id: user.id,
        action: 'loan_request',
        target_type: 'loan request',
        target_id: loanRequest.id,
        metadata: {
            account_number: accountNumber,
            branch_id: employeeBranchId,
            requested_by,
            amount,
            term_months,
            interest_rate,
            purpose
        }
    });

    res.status(201).json({
        message: 'Loan request created successfully',
        loanRequest
    });
    }catch (error) {
        console.error('Error creating loan request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all pending loan requests (admin only)
router.get('/pending', authenticateToken, async (req, res) => {
    const user = req.user;
    

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM loans WHERE status = $1 ORDER BY requested_at DESC',
            ['pending']
        );

        res.status(200).json({
            message: 'Pending loan requests fetched successfully',
            pendingLoans: result.rows
        });
    } catch (error) {
        console.error('Error fetching pending loans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;