import { AuthContext } from "../Context/AuthContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";

const Transaction = () => {
  const navigate = useNavigate();
  const { user, setInfo} = useContext(AuthContext);
  const role = user?.role;
  const base_url = import.meta.env.VITE_BASE_URL;
  const handletransaction = (e) => {
    e.preventDefault();
    const form = e.target;
    const type = form.type.value;
    const amount = form.amount.value;
    const id = user.id;
    console.log(user)

    // Account number: from input (for employee) or from user info (for customer)
    const acc_number = role === "employee" ? form.acc_number.value : user.account_number;

    if (!acc_number) {
      toast.error("Account number is required.", { position: "top-center" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to make a transaction", { position: "top-center" });
      return;
    }

    const data = { acc_number, type, amount, id };

    fetch(`${base_url}/api/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setInfo(data.newBalance);
          toast.success("Transaction Successful!");
          navigate(-1);
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-[url('/transaction-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <div className="hero">
        <div className="hero-content flex-col lg:flex-col">
          <div className="text-center lg:text-center">
            <h1 className="text-5xl font-bold">Transaction</h1>
          </div>
          <div className="card bg-transparent shrink-0 shadow-2xl">
            <form onSubmit={handletransaction}>
              <div className="card-body">
                <fieldset className="fieldset">
                  {/* Account number input only for employees */}
                  {role === "employee" && (
                    <>
                      <label className="fieldset-label">Account Number</label>
                      <input
                        type="text"
                        className="input"
                        name="acc_number"
                        placeholder="Account Number"
                      />
                    </>
                  )}

                  <label htmlFor="type" className="fieldset-label">
                    Transaction Type
                  </label>
                  <select id="type" name="type" className="input">
                    <option value="deposit">Deposit</option>
                    <option value="withdraw">Withdraw</option>
                  </select>

                  <label className="fieldset-label">Amount</label>
                  <input
                    type="text"
                    className="input"
                    name="amount"
                    placeholder="Amount"
                  />
                  <button className="btn btn-neutral mt-4" value="submit">
                    Make Transaction
                  </button>
                </fieldset>
                <div>
                <button className="btn btn-neutral mt-4 w-full" onClick={() => navigate(-1)}>
                  <span className="text-emerald-300">Back</span>
                </button>
                </div>
              </div>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
