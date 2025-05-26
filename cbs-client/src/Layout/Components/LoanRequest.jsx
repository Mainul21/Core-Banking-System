import { useState } from 'react';
import axios from 'axios';

export default function LoanRequestForm({ employeeId }) {
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    termMonths: '',
    interestRate: '',
    penaltyRate: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/loans/request', {
        customer_id: form.customerId,
        requested_by: employeeId,
        amount: parseFloat(form.amount),
        term_months: parseInt(form.termMonths),
        interest_rate: parseFloat(form.interestRate),
        penalty_rate: parseFloat(form.penaltyRate),
      });

      setMessage('Loan request submitted successfully!');
      setForm({
        customerId: '',
        amount: '',
        termMonths: '',
        interestRate: '',
        penaltyRate: '',
      });
    } catch (err) {
      setMessage('Error submitting request. Please try again.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4 shadow-md rounded bg-black">
      <h2 className="text-xl font-semibold">Loan Request</h2>

      <input
        type="text"
        name="customerId"
        placeholder="Customer ID"
        value={form.customerId}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="amount"
        placeholder="Loan Amount"
        value={form.amount}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="termMonths"
        placeholder="Term (months)"
        value={form.termMonths}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        step="0.01"
        name="interestRate"
        placeholder="Interest Rate (%)"
        value={form.interestRate}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        step="0.01"
        name="penaltyRate"
        placeholder="Penalty Rate (%)"
        value={form.penaltyRate}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Request
      </button>

      {message && <p className="text-center text-sm mt-2">{message}</p>}
    </form>
  );
}
