import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Modal from "react-modal";
import { Link } from "react-router";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const CustomerDashBoard = () => {
  const { user, logout, info } = useContext(AuthContext);
  const { id, name, balance, account_number, email } = user;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // const navigate = useNavigate();

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === "true") {
      toast.success("Login successful!", { position: "top-right" });
      localStorage.removeItem("showLoginToast");
    }
  }, []);

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
        toast.error("Server error"+err.message, {
          position: "top-right",
        });
      }
    };

    if (showTransactions) fetchTransactions();
  }, [showTransactions, id, filterType, fromDate, toDate]);

  const toggleBalance = () => setShowBalance(!showBalance);

  const downloadStatement = () => {
    if (transactions.length === 0) {
      toast.error("No transactions available to download", {
        position: "top-center",
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Account Statement for ${user.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Account Number: ${user.account_number}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    const tableColumn = ["Date", "Type", "Amount"];
    const tableRows = transactions.map((transaction) => [
      new Date(transaction.created_at).toLocaleDateString(),
      transaction.transaction_type,
      transaction.amount,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    });

    doc.save(`statement-${user.account_number}.pdf`);
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
        toast.success(data.message || "Password changed successfully!", {
          position: "top-center",
        });
        setModalIsOpen(false);
      } else {
        toast.error(data.error || "Error changing password", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Server error"+error.message, { position: "top-center" });
    }
  };

  if (!user)
    return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[url('./cd-bg.jpg')] bg-center bg-cover bg-no-repeat px-6 py-10 flex flex-col items-center text-emerald-100">
      <h1 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        Welcome, {name}
      </h1>

      <section className="bg-transparent rounded-xl shadow-2xl max-w-xl w-full p-8 mb-8 space-y-6 text-center">
        <p className="text-lg font-semibold break-words">
          <span className="font-bold">Email:</span> {email}
        </p>
        <p className="text-lg font-semibold break-words">
          <span className="font-bold">Account Number:</span> {account_number}
        </p>
        <div className="flex justify-center items-center gap-3 text-xl font-semibold">
          <span>
            Balance:{" "}
            {showBalance ? (info ? info : balance) : "****"}
          </span>
          <button
            onClick={toggleBalance}
            aria-label="Toggle balance visibility"
            className="text-emerald-400 hover:text-emerald-200 transition"
          >
            {showBalance ? <FaRegEyeSlash size={24} /> : <FaRegEye size={24} />}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={logout}
            className="btn bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 font-semibold shadow-md transition"
          >
            Logout
          </button>
          <button
            onClick={() => setModalIsOpen(true)}
            className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-semibold shadow-md transition"
          >
            Change Password
          </button>
          <button
            onClick={() => document.getElementById("my_modal_3").showModal()}
            className="btn bg-gray-700 hover:bg-gray-600 text-white rounded-full px-6 py-2 font-semibold shadow-md transition"
          >
            Contact Us
          </button>
          <button
            onClick={downloadStatement}
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-2 font-semibold shadow-md transition"
          >
            Download Statement
          </button>
        </div>

        <dialog
          id="my_modal_3"
          className="modal bg-black bg-opacity-80 rounded-lg max-w-md p-6 text-white"
        >
          <form method="dialog" className="relative">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
            <p className="mb-2">Email: mainul.hossain.chisty@g.bracu.ac.bd</p>
            <p>Phone: 01634070584</p>
          </form>
        </dialog>
      </section>

      {/* Filters */}
      <section className="max-w-4xl w-full bg-black bg-opacity-25 rounded-xl p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between text-white">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input bg-emerald-900 border-emerald-600 text-white rounded-lg px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input bg-emerald-900 border-emerald-600 text-white rounded-lg px-3 py-2"
          />
          <span className="text-white text-lg font-semibold select-none">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input bg-emerald-900 border-emerald-600 text-white rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={() => setShowTransactions(true)}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 py-2 font-semibold shadow-md"
        >
          Filter
        </button>
      </section>

      {/* Transactions Table */}
      <section className="max-w-4xl w-full px-2 md:px-6">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-4 py-3 mb-4 font-semibold transition"
        >
          {showTransactions ? "Hide Transactions" : "View Transactions"}
        </button>

        {showTransactions && (
          <div className="overflow-x-auto bg-white bg-opacity-80 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
            <table className="min-w-full table-auto text-left border-collapse">
              <thead className="bg-emerald-600 text-white sticky top-0">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-emerald-900 font-semibold">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-emerald-500 transition text-center text-black"
                    >
                      <td className="px-5 py-3">{txn.id}</td>
                      <td className="px-5 py-3 capitalize">{txn.transaction_type}</td>
                      <td className="px-5 py-3">${txn.amount}</td>
                      <td className="px-5 py-3">
                        {new Date(txn.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Password Change Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="max-w-md mx-auto mt-20 bg-white rounded-lg p-8 shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50"
        ariaHideApp={false}
      >
        <h2 className="text-2xl font-bold mb-6 text-emerald-900">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            required
            minLength={6}
            className="w-full px-4 py-2 border border-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            required
            minLength={6}
            className="w-full px-4 py-2 border border-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-6 py-2 font-semibold"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setModalIsOpen(false)}
              className="btn bg-gray-400 hover:bg-gray-500 text-gray-900 rounded-md px-6 py-2 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
      {/* Feature Cards */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <Link to="/transactions">
        <div className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <h1 className="text-center">Make Transaction</h1>
        </div>
        </Link>

        <Link to="/fund-transfer">
          <div className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold bg-black/30 hover:text-black">
            <h1 className="text-center">Transfer Fund</h1>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashBoard;
