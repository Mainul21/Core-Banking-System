import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router";
import { toast, ToastContainer } from "react-toastify";

const AdminDashBoard = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loans, setLoans] = useState([]);
  const [showLoans, setShowLoans] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [showFundTransfer, setShowFundTransfer] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const base_url = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, empRes, custRes, auditRes] = await Promise.all([
          fetch(`${base_url}/api/transaction-history`),
          fetch(`${base_url}/api/employees`),
          fetch(`${base_url}/api/allAccounts`),
          fetch(`${base_url}/api/audit-logs`),
        ]);

        const txData = await txRes.json();
        const empData = await empRes.json();
        const custData = await custRes.json();
        const auditData = await auditRes.json();

        setData(txData);
        setEmployees(empData);
        setCustomers(custData);
        setAudit(auditData);
        fetchPendingLoans();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // const interval = setInterval(fetchData, 60000); // Refresh every minute
    // return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  console.log(audit)

  const handleCustomerDelete = async (id) => {
    console.log("Deleting customer with ID:", id);
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${base_url}/api/customers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setCustomers(customers.filter((cust) => cust.id !== id));
        toast.success("Customer deleted successfully.");
      } else {
        let errorMessage = "Unknown error";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = "No detailed error message returned";
        }
        toast.error("Failed to delete customer: " + errorMessage);
      }
    } catch (error) {
      toast.error("Error deleting customer: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${base_url}/api/employees/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setEmployees(employees.filter((emp) => emp.id !== id));
        toast.success("Employee deleted successfully.");
      } else {
        // Try to parse JSON only if there's content
        let errorMessage = "Unknown error";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = "No detailed error message returned";
        }
        toast.error("Failed to delete employee: " + errorMessage);
      }
    } catch (error) {
      toast.error("Error deleting employee: " + error.message);
    }
  };

  useEffect(() => {
    const fetchFundTransfers = async () => {
      try {
        const ft = await fetch(`${base_url}/api/allFundTransfers`);
        const ftData = await ft.json();
        setTransfers(ftData);
      } catch (error) {
        console.error("Error fetching fund transfers:", error);
      }
    };

    fetchFundTransfers();
  }, []);

  const fetchPendingLoans = async () => {
    try {
      const res = await fetch(
        `${base_url}/api/loan-request/pending`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch pending loans");
      }

      const loanData = await res.json();
      setLoans(loanData);
    } catch (error) {
      console.error("Error fetching pending loans:", error);
      toast.error("Error fetching pending loans");
    }
  };

  const handleApproveLoan = async (loanId) => {
    const confirm = window.confirm(
      "Are you sure you want to approve this loan?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(
        `${base_url}/api/loan-approval/approve/${loanId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await res.json();

      if (res.ok) {
        toast.success("Loan approved successfully!");
        // Optionally, refresh loan list
        setLoans((prev) => ({
          ...prev,
          pendingLoans: prev.pendingLoans.filter((loan) => loan.id !== loanId),
        }));
      } else {
        toast.error(result.error || "Failed to approve loan");
      }
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error("Something went wrong while approving the loan");
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      const response = await fetch(
        `${base_url}/api/loan-approval/reject/${loanId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Loan rejected successfully.");
        fetchPendingLoans(); // refresh list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to reject loan: ${errorData.error}`);
      }
    } catch (error) {
      toast.error("Error rejecting loan: " + error.message);
    }
  };

  if (!data) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[url('./Admin-bg.jpg')] bg-center bg-cover bg-no-repeat p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-500">
        Admin Dashboard
      </h1>

      <div className="flex justify-center mb-6">
        <button
          className="btn bg-red-500 hover:bg-red-500 p-4"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      <div className="flex justify-center mb-6">
        <Link to="/create-employee">
          <button className="btn bg-emerald-500 hover:bg-blue-500 p-4">
            Create Employee
          </button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-transparent shadow rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-center">Total Deposits</h2>
          <p className="text-green-600 text-2xl font-bold text-center">
            ৳ {parseFloat(data.total_deposit).toFixed(2)}
          </p>
        </div>
        <div className="bg-transparent shadow rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-center">
            Total Withdrawals
          </h2>
          <p className="text-red-600 text-2xl font-bold text-center">
            ৳ {parseFloat(data.total_withdrawal).toFixed(2)}
          </p>
        </div>
        <div className="bg-transparent shadow rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-center">
            Total Bank Balance
          </h2>
          <p className="text-blue-600 text-2xl font-bold text-center">
            ৳ {parseFloat(data.total_bank_balance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Toggle Buttons and Tables */}
      {/* Transactions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transactions</h2>
        <button
          onClick={() => setShowTransactions((prev) => !prev)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg"
        >
          {showTransactions ? "Hide Table" : "Show Table"}
        </button>
      </div>
      {showTransactions && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Account #</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{tx.name}</td>
                  <td className="capitalize">{tx.role}</td>
                  <td
                    className={`font-semibold ${
                      tx.transaction_type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.transaction_type}
                  </td>
                  <td>৳ {parseFloat(tx.amount).toFixed(2)}</td>
                  <td>{tx.account_number || "N/A"}</td>
                  <td>{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loan Request */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Loan Requests</h2>
        <button
          onClick={() => setShowLoans((prev) => !prev)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg"
        >
          {showLoans ? "Hide Loan Request" : "Show Loan Request"}
        </button>
      </div>
      {showLoans && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>Account Number</th>
                <th>Requested By</th>
                <th>Amount</th>
                <th>Term Months</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Purpose</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.pendingLoans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{loan.account_number}</td>
                  <td>{loan.requested_by}</td>
                  <td>৳ {parseFloat(loan.amount).toFixed(2)}</td>
                  <td>{loan.term_months}</td>
                  <td>{loan.interest_rate}%</td>
                  <td
                    className={`capitalize font-semibold ${
                      loan.status === "pending"
                        ? "text-yellow-600"
                        : loan.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {loan.status}
                  </td>
                  <td>{loan.purpose}</td>
                  <td>
                    <button
                      onClick={() => handleApproveLoan(loan.id)}
                      className="text-green-600 hover:underline mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLoan(loan.id)}
                      className="text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employees */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Employees</h2>
        <button
          onClick={() => setShowEmployees((prev) => !prev)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showEmployees ? "Hide Employees" : "Show Employees"}
        </button>
      </div>
      {showEmployees && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customers</h2>
        <button
          onClick={() => setShowCustomers((prev) => !prev)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          {showCustomers ? "Hide Customers" : "Show Customers"}
        </button>
      </div>
      {showCustomers && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Account #</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr
                  key={cust.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{cust.name}</td>
                  <td>{cust.email}</td>
                  <td>{cust.account_number}</td>
                  <td>৳ {parseFloat(cust.balance).toFixed(2)}</td>
                  <td>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleCustomerDelete(cust.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fund Transfers */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Fund Transfers</h2>
        <button
          onClick={() => setShowFundTransfer((prev) => !prev)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          {showFundTransfer ? "Hide Transfers" : "Show Transfers"}
        </button>
      </div>
      {showFundTransfer && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>ID</th>
                <th>Sender Account #</th>
                <th>Receiver Account #</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Approved By</th>
                <th>Approved At</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((ft) => (
                <tr
                  key={ft.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{ft.id}</td>
                  <td>{ft.sender_account_number}</td>
                  <td>{ft.receiver_account_number}</td>
                  <td>৳ {parseFloat(ft.amount).toFixed(2)}</td>
                  <td
                    className={`capitalize font-bold ${
                      ft.status === "approved"
                        ? "text-green-600"
                        : ft.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {ft.status}
                  </td>
                  <td>{new Date(ft.requested_at).toLocaleString()}</td>
                  <td>{ft.approved_by || "N/A"}</td>
                  <td>
                    {ft.approved_at
                      ? new Date(ft.approved_at).toLocaleString()
                      : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs */}
      <div className="flex justify-between items-center mb-4 hover:text-black">
        <h2 className="text-xl font-bold text-white hover:text-white">
          Audit Logs
        </h2>
        <button
          onClick={() => setShowAudit((prev) => !prev)}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          {showAudit ? "Hide Logs" : "Show Logs"}
        </button>
      </div>
      {showAudit && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Info</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((log) => (
                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50 hover:text-black"
                >
                  <td>{log.user_name}</td>
                  <td className="capitalize">{log.user_role}</td>
                  <td>{log.action}</td>
                  <td>
                    <button
                      className="btn border-0"
                      onClick={() =>
                        document.getElementById(`my_modal_${log.id}`).showModal()
                      }
                    >
                      open modal
                    </button>
                    <dialog id={`my_modal_${log.id}`} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg text-white">
                          Audit Data
                        </h3>
                        <h2 className="py-4 flex flex-col text-white">
                          {log.metadata
                            ? JSON.stringify(log.metadata, null, 2)
                            : "No metadata available"}
                        </h2>
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default AdminDashBoard;
