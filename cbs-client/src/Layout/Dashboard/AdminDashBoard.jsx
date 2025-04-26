import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

const AdminDashBoard = () => {

  const {logout} = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, empRes, custRes] = await Promise.all([
          fetch("http://localhost:5000/api/transaction-history"),
          fetch("http://localhost:5000/api/employees"),
          fetch("http://localhost:5000/api/allAccounts"),
        ]);
  
        const txData = await txRes.json();
        const empData = await empRes.json();
        const custData = await custRes.json();
  
        setData(txData);
        setEmployees(empData);
        setCustomers(custData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

    

  if (!data) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[url('./Admin-bg.jpg')] bg-center bg-cover bg-no-repeat p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-500">
        Admin Dashboard
      </h1>
      <div className="flex justify-center">
  <button className="btn bg-emerald-500 hover:bg-red-500 p-4" onClick={logout}>
    Logout
  </button>
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
          <h2 className="text-lg font-semibold text-center">Total Withdrawals</h2>
          <p className="text-red-600 text-2xl font-bold text-center">
            ৳ {parseFloat(data.total_withdrawal).toFixed(2)}
          </p>
        </div>
        <div className="bg-transparent shadow rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-center">Total Bank Balance</h2>
          <p className="text-blue-600 text-2xl font-bold text-center">
            ৳ {parseFloat(data.total_bank_balance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transactions</h2>
        <button
          onClick={() => setShowTransactions((prev) => !prev)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg transition-all"
        >
          {showTransactions ? "Hide Table" : "Show Table"}
        </button>
      </div>

      {showTransactions && (
        <div className="overflow-x-auto bg-transparent shadow rounded-2xl p-4 mb-8">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-emerald-500 text-white text-center">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Account Number</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50 hover:text-black">
                  <td className="px-4 py-2">{tx.name}</td>
                  <td className="px-4 py-2 capitalize">{tx.role}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      tx.transaction_type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.transaction_type}
                  </td>
                  <td className="px-4 py-2">৳ {parseFloat(tx.amount).toFixed(2)}</td>
                  <td className="px-4 py-2">{tx.account_number || "N/A"}</td>
                  <td className="px-4 py-2">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Info Table */}
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
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50 hover:text-black">
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2">
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Info Table */}
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
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Account #</th>
                <th className="px-4 py-2">Balance</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((cust) => (
                <tr key={cust.id} className="border-t hover:bg-gray-50 hover:text-black">
                  <td className="px-4 py-2">{cust.name}</td>
                  <td className="px-4 py-2">{cust.email}</td>
                  <td className="px-4 py-2">{cust.account_number}</td>
                  <td className="px-4 py-2">৳ {parseFloat(cust.balance).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashBoard;
