import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";

const ResetPassword = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, newPassword }), // Send account_number and newPassword
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      toast.success("Password reset successfully!", { position: "top-right" });
      navigate("/login"); // Redirect to the login page after successful reset
    } catch (err) {
      toast.error(err.message || "Server error", { position: "top-right" });
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen bg-[url('./bg-login.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="hero-content flex-col lg:flex-col">
        <div className="text-center lg:text-center">
          <h1 className="text-5xl font-bold text-emerald-500">Reset Password</h1>
        </div>
        <div className="card bg-transparent w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleResetPassword}>
              <fieldset className="fieldset">
                <label className="fieldset-label">Account Number</label>
                <input
                  name="accountNumber"
                  type="text"
                  className="input"
                  placeholder="Enter your account number"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <label className="fieldset-label">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  className="input"
                  placeholder="New Password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label className="fieldset-label">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="input"
                  placeholder="Confirm New Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn btn-neutral mt-4" type="submit">
                  Reset Password
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;
