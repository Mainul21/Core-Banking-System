import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Modal from "react-modal";
import { useNavigate } from "react-router";

const CustomerDashBoard = () => {
  const { user, logout } = useContext(AuthContext);
  const { id, name, balance, account_number, email } = user;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [filterType, setFilterType] = useState(""); // For transaction type filter
  const [fromDate, setFromDate] = useState(""); // For start date filter
  const [toDate, setToDate] = useState(""); // For end date filter
  const navigate = useNavigate();

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === "true") {
      toast.success("Login successful!", { position: "top-right" });
      localStorage.removeItem("showLoginToast");
    }
  }, []);

  // Fetch transactions when toggled or filters are updated
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let url = `http://localhost:5000/api/customer-transaction/${id}`;
        const params = new URLSearchParams();
        if (filterType) params.append("type", filterType);
        if (fromDate) params.append("from", fromDate);
        if (toDate) params.append("to", toDate);
        url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          setTransactions(data);
        } else {
          toast.error("Failed to load transactions");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      }
    };

    if (showTransactions) fetchTransactions();
  }, [showTransactions, id, filterType, fromDate, toDate]);

  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password changed successfully!", { position: "top-center" });
        setModalIsOpen(false);
      } else {
        toast.error(data.error || "Error changing password", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server error", { position: "top-center" });
    }
  };

  return (
    <div className="h-fit min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[url('./cd-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <h1 className="text-center mb-6 text-3xl font-bold">Welcome, {name}</h1>

      <div className="shadow-xl bg-black/30 w-full max-w-xl mb-6 p-6 rounded-lg flex flex-col items-center justify-center">
        <h1 className="text-center mb-6 text-xl font-bold">Email: {email}</h1>
        <h1 className="text-center mb-6 text-xl font-bold">Account Number: {account_number}</h1>
        <div className="flex justify-center items-center gap-2">
          <h1 className="text-center mb-6 text-xl font-bold">
            Balance: {showBalance ? balance : "****"}
          </h1>
          <button
            className="btn bg-emerald-500 rounded-xl text-black"
            onClick={toggleBalance}
          >
            {showBalance ? <FaRegEyeSlash /> : <FaRegEye />}
          </button>
        </div>
        <button
          className="btn bg-emerald-500 rounded-xl transition-all duration-300 hover:bg-red-500 text-black"
          onClick={logout}
        >
          Logout
        </button>
        <button
          className="btn bg-emerald-500 rounded-xl transition-all duration-300 hover:bg-blue-500 text-black mt-3"
          onClick={() => setModalIsOpen(true)}
        >
          Change Password
        </button>
      </div>

      {/* Filter for transactions */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input"
        >
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-white bg-black/50 text-xl p-2">to</span>
          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowTransactions(true)}
          className="btn bg-emerald-500 text-black"
        >
          Filter
        </button>
      </div>

      {/* Collapsible Transaction Table */}
      <div className="w-full max-w-4xl px-4">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full bg-emerald-600 text-white rounded-lg px-4 py-2 mb-4 hover:bg-emerald-700 transition"
        >
          {showTransactions ? "Hide Transactions" : "View Transactions"}
        </button>

        {showTransactions && (
          <div className="overflow-x-auto bg-white/30 backdrop-blur p-4 rounded-lg text-black max-h-[400px] overflow-y-auto">
            <table className="min-w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-emerald-500 text-white text-center">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => (
                    <tr
                      key={index}
                      className="hover:bg-emerald-100 transition border-b text-center"
                    >
                      <td className="px-4 py-2">{txn.id}</td>
                      <td className="px-4 py-2 capitalize">{txn.transaction_type}</td>
                      <td className="px-4 py-2">${txn.amount}</td>
                      <td className="px-4 py-2">{new Date(txn.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <div className="border-4 bg-black/30 border-emerald-700 text-emerald-300 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <button onClick={() => navigate("/transactions")} className="text-center">Make Transaction</button>
        </div>
        <div className="border-4 bg-white/30 border-emerald-700 text-emerald-700 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <h1 className="text-center">Transfer Fund</h1>
        </div>
      </div>

      {/* Modal for changing password */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto text-black"
        overlayClassName="fixed inset-0 bg-[url('./cd-bg.jpg')] bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form className="flex flex-col gap-4" onSubmit={handlePasswordChange}>
          <label className="text-lg font-bold">Old Password:</label>
          <input
            type="password"
            className="input w-full mb-4"
            name="oldPassword"
            placeholder="Enter Old Password"
            required
          />
          <label className="text-lg font-bold">New Password</label>
          <input
            type="password"
            className="input w-full mb-4"
            name="newPassword"
            placeholder="Enter New Password"
            required
          />
          <label className="text-lg font-bold">Confirm Password</label>
          <input
            type="password"
            className="input w-full mb-4"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
          />
          <button className="btn btn-neutral w-full mt-4" type="submit">
            Change Password
          </button>
        </form>
        <button className="btn btn-danger mt-4" onClick={() => setModalIsOpen(false)}>
          Close
        </button>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CustomerDashBoard;
