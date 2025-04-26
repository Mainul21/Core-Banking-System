import React, { useState, useEffect } from "react";
import { Link } from "react-router";

const FundTransfer = () => {
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [senderAccountNumber, setSenderAccountNumber] = useState(""); // Only for employee
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(""); // Save role from token

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role) {
        setRole(user.role);
        console.log("Role detected from localStorage:", user.role);
      } else {
        console.warn("No role found in user object");
      }
    } else {
      console.warn("No user found in localStorage");
    }
  }, []);

  console.log("Current role state:", role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage");
      setMessage("You are not authenticated");
      return;
    }

    const payload = {
      recipient_account_number: recipientAccountNumber,
      amount: parseFloat(amount),
    };

    if (role === "employee") {
      if (!senderAccountNumber) {
        console.error("Sender account number missing for employee transfer");
        setMessage("Sender account number is required for employees.");
        return;
      }
      payload.sender_account_number = senderAccountNumber;
    }

    console.log("Prepared payload for fund transfer:", payload);

    try {
      const response = await fetch("http://localhost:5000/api/fund-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Server responded with status:", response.status);

      const data = await response.json();
      console.log("Response body:", data);

      if (!response.ok) {
        console.error(
          "Server returned an error:",
          data.error || "Unknown error"
        );
        setMessage(data.error || "Something went wrong");
        return;
      }

      console.log("Transfer successful:", data.message);
      setMessage(data.message || "Transfer request submitted successfully!");
      setRecipientAccountNumber("");
      setSenderAccountNumber("");
      setAmount("");
    } catch (err) {
      console.error("Network/server error:", err);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 bg-[url('./fund-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300 overflow-auto">
      <div className="max-w-md mx-auto mt-10 p-6 bg-black/30 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Fund Transfer</h2>
        {message && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-center text-sm text-black">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "employee" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Sender Account Number
              </label>
              <input
                type="text"
                value={senderAccountNumber}
                onChange={(e) => setSenderAccountNumber(e.target.value)}
                required
                className="w-full border rounded p-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Account Number
            </label>
            <input
              type="text"
              value={recipientAccountNumber}
              onChange={(e) => setRecipientAccountNumber(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              step="100"
              className="w-full border rounded p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Submit Transfer Request
          </button>
        </form>
        <Link to={role === "employee" ? "/employee-dashboard" : "/customer-dashboard"}>
          <div className="mt-4">
            <button className="w-full bg-emerald-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Go Back
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default FundTransfer;
