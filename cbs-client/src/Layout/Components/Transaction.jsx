import { AuthContext } from "../Context/AuthContext";
import { useContext } from "react";
import {useNavigate} from "react-router";
// import { useState } from "react";
import { ToastContainer,toast } from "react-toastify";

const Transaction = () => {
    const navigate = useNavigate();
    const { info } = useContext(AuthContext);
    // console.log(info);

    const handletransaction = (e) => {
        e.preventDefault();
        const form = e.target;
        const acc_number = form.acc_number.value;
        const type = form.type.value;
        const amount = form.amount.value;
        const id = info.id;

        console.log(acc_number, type, amount, id);
        const token = localStorage.getItem("token");
        const data = { acc_number, type, amount, id };
        console.log(data);

        if(!token){
            toast.error("Please login to make a transaction", { position: "top-center" })};

        fetch("http://localhost:5000/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success) {
                    toast.success("Transaction Successful!");
                    // form.reset();
                    navigate(-1);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }



  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-[url('./transaction-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <div className="hero">
        <div className="hero-content flex-col lg:flex-col">
          <div className="text-center lg:text-center">
            <h1 className="text-5xl font-bold">Transaction</h1>
          </div>
          <div className="card bg-transparent shrink-0 shadow-2xl">
            <form onSubmit={handletransaction}>
              <div className="card-body">
                <fieldset className="fieldset">
                  <label className="fieldset-label">Account Number</label>
                  <input
                    type="text"
                    className="input"
                    name="acc_number"
                    placeholder="Acccount Number"
                  />
                  <label for="role" className="fieldset-label">
                    Transaction Type
                  </label>
                  <select id="role" name="type" className="input">
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
              </div>
            </form>
            <ToastContainer/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
