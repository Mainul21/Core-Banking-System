import { ToastContainer, toast } from "react-toastify";
import React from "react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router";

const EmployeeDashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [showTable, setShowTable] = useState(false);
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
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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

    fetchCustomer();
    const interval = setInterval(fetchCustomer, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (customerId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/customer/${customerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Customer deleted successfully!", { position: "top-right" });
        setCustomers(customers.filter((customer) => customer.id !== customerId));
      } else {
        toast.error("Error deleting customer", { position: "top-right" });
      }
    } catch (error) {
      toast.error(error, { position: "top-right" });
    }
  };

  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 bg-[url('./emp-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300 overflow-auto">
      <h1 className="text-center mb-6 text-3xl font-bold bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">
        Welcome {name}
      </h1>
      <button
        className="btn mb-4 bg-emerald-500 rounded-xl transition-all duration-300 hover:bg-red-500 text-black"
        onClick={logout}
      >
        Logout
      </button>

      <button
        className="mb-4 px-4 py-2 bg-black/30 hover:bg-emerald-500 text-white rounded transition-all duration-300"
        onClick={() => setShowTable(!showTable)}
      >
        {showTable ? "Hide Customer List" : "Show Customer List"}
      </button>

      {showTable && (
        loading ? (
          <p className="text-lg mt-3 bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">
            Loading customer details...
          </p>
        ) : (
          <div className="w-full max-w-4xl transition-all duration-300">
            <table className="w-full border border-gray-700 mb-6">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Account Number</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <React.Fragment key={customer.id}>
                      <tr
                        onClick={() => toggleRow(index)}
                        className="cursor-pointer text-center bg-gray-800 hover:bg-gray-700 transition-all border border-gray-600"
                      >
                        <td className="p-3 border">{customer.name}</td>
                        <td className="p-3 border">{customer.account_number}</td>
                        <td className="p-3 border">
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
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
                        <tr className="bg-gray-900 text-white border border-gray-600">
                          <td colSpan="3" className="p-4 text-left">
                            <p><strong>Email:</strong> {customer.email}</p>
                            <p><strong>Balance:</strong> ${customer.balance}</p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <Link to="/OpenAccount">
          <div className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 bg-black/30 hover:text-2xl hover:font-bold hover:text-black">
            <h1 className="text-center">Open Account</h1>
          </div>
        </Link>
        <div className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black">
          <h1 className="text-center">Make Transaction</h1>
        </div>
        <Link to="/fund-transfer">
        <div className="border rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold bg-black/30 hover:text-black">
          <h1 className="text-center">Transfer Fund</h1>
        </div>
        </Link>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EmployeeDashBoard;
