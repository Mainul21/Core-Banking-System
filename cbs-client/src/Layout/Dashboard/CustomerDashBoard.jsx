import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";
import { FaRegEye,FaRegEyeSlash } from "react-icons/fa6";

const CustomerDashBoard = () => {
  const { user, logout } = useContext(AuthContext);
  const { name, balance, account_number, email } = user;

  // State to toggle balance visibility
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === "true") {
      toast.success("Login successful!", { position: "top-right" });
      localStorage.removeItem("showLoginToast");
    }
  }, []);

  // Toggle the balance visibility
  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-[url('./cd-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <h1 className="text-center mb-6 text-3xl font-bold ">Welcome, {name}</h1>
      <div>
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
      </div>
      <button
        className="btn bg-emerald-500 rounded-xl transition-all duration-300 hover:bg-red-500 text-black"
        onClick={logout}
      >
        Logout
      </button>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <div className="border border-emerald-700 text-emerald-300 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <h1 className="text-center  ">Make Transaction</h1>
        </div>
        <div className="border border-emerald-700 text-emerald-700 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <h1 className="text-center">Transfer Fund</h1>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CustomerDashBoard;
