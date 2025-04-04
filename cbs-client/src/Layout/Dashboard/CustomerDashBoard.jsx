import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";
import { FaRegEye,FaRegEyeSlash } from "react-icons/fa6";
import Modal from "react-modal";
import { useNavigate } from "react-router";

const CustomerDashBoard = () => {
  const { user, logout } = useContext(AuthContext);
  const { id, name, balance, account_number, email } = user;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const form = e.target;
    // const oldPassword = form.oldPassword.value;
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
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-[url('./cd-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <h1 className="text-center mb-6 text-3xl font-bold ">Welcome, {name}</h1>
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
      <button className="btn bg-emerald-500 rounded-xl transition-all duration-300 hover:bg-blue-500 text-black mt-3" onClick={() => setModalIsOpen(true)}>
        Change Password
      </button>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <div className="border-4 bg-black/30 border-emerald-700 text-emerald-300 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <button onClick={() => navigate('/transactions')} className="text-center">Make Transaction</button>
        </div>
        <div className="border-4 bg-white/30 border-emerald-700 text-emerald-700 rounded-xl p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl font-bold hover:text-black">
          <h1 className="text-center">Transfer Fund</h1>
        </div>
      </div>
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
              <button
                className="btn btn-danger mt-4"
                onClick={() => {
                  setModalIsOpen(false); // Close the modal

                }}
              >
                Close
              </button>
            </Modal>
      <ToastContainer />
    </div>
  );
};

export default CustomerDashBoard;
