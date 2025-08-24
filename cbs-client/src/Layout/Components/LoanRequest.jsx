import { useState } from "react";
import { Link } from "react-router";
import { toast, ToastContainer } from "react-toastify";


export default function LoanRequest() {
  const [form, setForm] = useState({
    accountNumber: "",
    amount: "",
    termMonths: "",
    interestRate: "",
    purpose: "",
  });
  const base_url = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const {employee_id} = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${base_url}/api/loan-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          accountNumber: form.accountNumber,
          requested_by: employee_id,
          amount: parseFloat(form.amount),
          term_months: parseInt(form.termMonths),
          interest_rate: parseFloat(form.interestRate),
          purpose: form.purpose,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit loan request");
      }

      toast.success("✅ Loan request submitted successfully!");
      setForm({
        accountNumber: "",
        amount: "",
        termMonths: "",
        interestRate: "",
        purpose: "",
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error("❌ Error submitting request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[url('./loan.jpg')] bg-center bg-cover bg-no-repeat p-4 md:p-8">
      <div className="max-w-md mx-auto mt-8 p-6 bg-transparent shadow-2xl shadow-black rounded-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">
          Loan Request Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={form.customerId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="number"
            name="amount"
            placeholder="Loan Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="number"
            name="termMonths"
            placeholder="Term (months)"
            value={form.termMonths}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="number"
            step="0.01"
            name="interestRate"
            placeholder="Interest Rate (%)"
            value={form.interestRate}
            onChange={handleChange}
            required
            className="w-full  p-2 border rounded text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            name="purpose"
            placeholder="Loan Purpose"
            value={form.purpose}
            onChange={handleChange}
            required
            className="w-full  p-2 border rounded text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit Request
          </button>
          
        </form>
        <Link to="/employee-dashboard">
        <button className="btn w-full mt-5 bg-blue-600 text-white py-2 rounded hover:bg-emerald-700" >
            Go Back
          </button>
        </Link>
        <ToastContainer/>
      </div>
    </div>
  );
}
