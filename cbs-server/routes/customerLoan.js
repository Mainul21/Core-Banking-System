const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");
const logAudit = require("../tools/auditLogger");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Get customer's account number by user id
    const customerResult = await pool.query(
      "SELECT account_number FROM customers WHERE id = $1",
      [userId]
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const accountNumber = customerResult.rows[0].account_number;

    // Step 2: Get loans for that account number
    const loansResult = await pool.query(
      `SELECT * FROM loans WHERE account_number = $1`,
      [accountNumber]
    );

    if (loansResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No loans found for this customer" });
    }

    const loans = loansResult.rows;

    // Step 3: For each loan, get the payment schedule
    const loansWithPayments = await Promise.all(
      loans.map(async (loan) => {
        const paymentsResult = await pool.query(
          `SELECT id, due_date, amount_due, amount_paid, penalty, status, paid_at 
           FROM loan_payments 
           WHERE loan_id = $1 
           ORDER BY due_date`,
          [loan.id]
        );

        return {
          ...loan,
          payment_schedule: paymentsResult.rows,
        };
      })
    );

    res.json(loansWithPayments);
  } catch (error) {
    console.error("Error fetching customer loans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/repay", authenticateToken, async (req, res) => {
  console.log("Received /repay request");
  const user = req.user;
  const { payment_id } = req.body;
  console.log("User:", user);
  console.log("Payment ID:", payment_id);

  if (!payment_id) {
    console.log("Missing payment_id in request body");
    return res
      .status(400)
      .json({ error: "Missing payment_id in request body" });
  }

  try {
    // Step 1: Get payment info and related loan's account_number
    const paymentResult = await pool.query(
      `SELECT lp.*, l.account_number 
       FROM loan_payments lp
       JOIN loans l ON lp.loan_id = l.id
       WHERE lp.id = $1`,
      [payment_id]
    );
    console.log("Payment query result:", paymentResult.rows);

    if (paymentResult.rowCount === 0) {
      console.log("Payment record not found");
      return res.status(404).json({ error: "Payment record not found" });
    }

    const payment = paymentResult.rows[0];

    // Step 2: Verify payment belongs to the logged-in user by matching account_number
    const customerResult = await pool.query(
      "SELECT account_number FROM customers WHERE id = $1",
      [user.id]
    );
    console.log("Customer query result:", customerResult.rows);

    if (customerResult.rowCount === 0) {
      console.log("Customer not found");
      return res.status(404).json({ error: "Customer not found" });
    }

    const userAccountNumber = customerResult.rows[0].account_number;
    console.log("User account number:", userAccountNumber);

    if (payment.account_number !== userAccountNumber) {
      console.log(
        "Access denied: payment.account_number !== userAccountNumber"
      );
      return res
        .status(403)
        .json({ error: "Access denied. This payment does not belong to you." });
    }

    // Step 3: Check if already paid
    if (payment.status === "paid") {
      console.log("Payment already paid");
      return res
        .status(400)
        .json({ error: "This installment is already paid" });
    }

    // Step 4: Mark payment as paid and set timestamp
    const updateResult = await pool.query(
      `UPDATE loan_payments
       SET status = 'paid', paid_at = NOW(), amount_paid = amount_due, penalty = 0
       WHERE id = $1`,
      [payment_id]
    );
    console.log("Update query result:", updateResult.rowCount);

    // Step 5: Check if all payments for this loan are paid
    const unpaidPaymentsResult = await pool.query(
      `SELECT COUNT(*) FROM loan_payments 
   WHERE loan_id = $1 AND status != 'paid'`,
      [payment.loan_id]
    );

    const unpaidCount = parseInt(unpaidPaymentsResult.rows[0].count);

    if (unpaidCount === 0) {
      // All EMIs are paid, update the loan's completed_at and status
      await pool.query(
        `UPDATE loans 
     SET completed_at = NOW(), status = 'completed' 
     WHERE id = $1`,
        [payment.loan_id]
      );
      console.log(`Loan ${payment.loan_id} marked as completed`);
    }

    // Step 6: Log audit (implement your own logAudit function if you want)
    if (typeof logAudit === "function") {
      await logAudit({
        user_id: user.id,
        action: "loan_emi_paid",
        target_type: "loan_payment",
        target_id: payment_id,
        metadata: {
          loan_id: payment.loan_id,
          amount: payment.amount_due,
        },
      });
      console.log("Audit logged");
    } else {
      console.log("logAudit function not implemented");
    }

    res.json({ message: "EMI payment successful" });
  } catch (error) {
    console.error("Error processing EMI payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
