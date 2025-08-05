import { ToastContainer, toast } from "react-toastify";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router";

const EmployeeDashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const { name } = user;

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === "true") {
      toast.success("Login successful!", { position: "top-right" });
      localStorage.removeItem("showLoginToast");
    }

    const token = localStorage.getItem("token");

    const fetchCustomer = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/customer-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        toast.error(error.message, { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingTransfers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/fund-transfer/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPendingTransfers(data.pendingTransfers);
      } catch (error) {
        toast.error("Failed to load pending transfers", error, { position: "top-right" });
      }
    };

    fetchCustomer();
    fetchPendingTransfers();
    const interval = setInterval(() => {
      fetchCustomer();
      fetchPendingTransfers();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (customerId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/customer/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Customer deleted successfully!", { position: "top-right" });
        setCustomers(customers.filter((c) => c.id !== customerId));
      } else {
        toast.error("Error deleting customer", { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
    }
  };

  const handleApproveTransfer = async (transferId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/fund-transfer/approve/${transferId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Transfer approved!", { position: "top-right" });
        setPendingTransfers(pendingTransfers.filter((t) => t.id !== transferId));
      } else {
        const data = await response.json();
        toast.error(data.message||"Failed to approve transfer", { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
    }
  };

  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-8 bg-[url('./emp-bg.jpg')] bg-center bg-cover bg-no-repeat text-emerald-100 overflow-auto">
      {/* Header */}
      <header className="w-full max-w-6xl bg-black/30 bg-opacity-40 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent select-none">
          Welcome, {name}
        </h1>
        <button
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white shadow-md"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      {/* Toggle Customer List */}
      <button
        className="mb-6 px-6 py-3 rounded-full bg-black bg-opacity-30 hover:bg-emerald-500 hover:text-black transition-all font-semibold shadow-md"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Customer List" : "Show Customer List"}
      </button>

      {/* Customer List */}
      {showTable && (
        loading ? (
          <p className="text-xl font-medium bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent select-none">
            Loading customer details...
          </p>
        ) : (
          <div className="w-full max-w-6xl overflow-x-auto rounded-lg shadow-lg border border-emerald-700 bg-black bg-opacity-30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-emerald-200 uppercase text-sm tracking-wider">
                  <th className="p-4 border-b border-emerald-700">Name</th>
                  <th className="p-4 border-b border-emerald-700">Account Number</th>
                  <th className="p-4 border-b border-emerald-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <React.Fragment key={customer.id}>
                      <tr
                        onClick={() => toggleRow(index)}
                        className={`cursor-pointer border-b border-emerald-700 hover:bg-emerald-800 transition-colors ${
                          openRow === index ? "bg-emerald-900" : "bg-emerald-800"
                        }`}
                      >
                        <td className="p-4">{customer.name}</td>
                        <td className="p-4">{customer.account_number}</td>
                        <td className="p-4 text-center">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition-shadow shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(customer.id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {openRow === index && (
                        <tr className="bg-emerald-700 text-emerald-200">
                          <td colSpan="3" className="p-6 text-sm leading-relaxed">
                            <p>
                              <strong>Email:</strong> {customer.email}
                            </p>
                            <p>
                              <strong>Balance:</strong> ${customer.balance.toFixed(2)}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-emerald-300 font-medium">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pending Transfers */}
      <section className="w-full max-w-6xl mt-10 bg-black/30 bg-opacity-30 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-emerald-300 tracking-wide">Pending Fund Transfers</h2>
        {pendingTransfers.length === 0 ? (
          <p className="text-emerald-400 italic">No pending transfers.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-emerald-700">
            <table className="w-full text-left border-collapse">
              <thead className="bg-emerald-900 text-emerald-200 uppercase text-sm tracking-wider">
                <tr>
                  <th className="p-4 border-b border-emerald-700">Sender</th>
                  <th className="p-4 border-b border-emerald-700">Receiver</th>
                  <th className="p-4 border-b border-emerald-700">Amount</th>
                  <th className="p-4 border-b border-emerald-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransfers.map((t) => (
                  <tr
                    key={t.id}
                    className="bg-emerald-800 text-emerald-100 border-b border-emerald-700 text-center hover:bg-emerald-700 transition-colors"
                  >
                    <td className="p-4">{t.sender_account_number}</td>
                    <td className="p-4">{t.receiver_account_number}</td>
                    <td className="p-4">${t.amount}</td>
                    <td className="p-4">
                      <button
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-md shadow-md transition"
                        onClick={() => handleApproveTransfer(t.id)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {/* Feature Cards */}
      <nav className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 w-full max-w-6xl">
        <Link to="/OpenAccount" className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <span className="text-2xl font-bold text-white hover:text-emerald-100 select-none text-center">
            Open Account
          </span>
        </Link>
        <Link to="/transactions" className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <span className="text-2xl font-bold text-white hover:text-emerald-100 select-none text-center">
            Make Transaction
          </span>
        </Link>
        <Link to="/fund-transfer" className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <span className="text-2xl font-bold text-white hover:text-emerald-100 select-none text-center">
            Transfer Fund
          </span>
        </Link>
        <Link to="/loan-request" className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <span className="text-2xl font-bold text-white hover:text-emerald-100 select-none text-center">
            Loan Request
          </span>
        </Link>
      </nav>

      <ToastContainer />
    </div>
  );
};

export default EmployeeDashBoard;
