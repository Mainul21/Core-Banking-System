import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import emailjs from "@emailjs/browser";
import Modal from "react-modal";
import { useNavigate } from "react-router";

// Set app element for accessibility
Modal.setAppElement("#root");

const OpenAccount = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [branches, setBranches] = useState([]); // State for storing branches
  const your_service_id = import.meta.env.VITE_EMAIL_SERVICE;
  const your_template_id = import.meta.env.VITE_EMAIL_TEMPLATE;
  const your_public_key = import.meta.env.VITE_EMAIL_PUBLIC_KEY;
  const navigate = useNavigate();

  // Fetch branches from the backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/branches");
        const data = await response.json();
        if (response.ok) {
          setBranches(data); // Set branches to state
        } else {
          toast.error("Failed to load branches.");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Error fetching branches.");
      }
    };

    fetchBranches();
  }, []);

  const handleOpenAccount = async (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const address = form.address.value;
    const amount = form.amount.value;
    const branch_id = form.branch_id.value; // Get selected branch ID
    const data = { name, email, phone, address, amount, branch_id };

    try {
      const response = await fetch("http://localhost:5000/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setAccountDetails(result);
        setModalIsOpen(true);
        sendEmail(result);

        toast.success("Account Created Successfully!", {
          position: "top-center",
        });
      } else {
        toast.error("Error creating account", { position: "top-center" });
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Server error", { position: "top-center" });
    }
  };

  const sendEmail = (details) => {
    const templateParams = {
      to_name: details.name,
      to_email: details.email,
      account_number: details.account_number,
      password: details.password,
      amount: details.amount,
    };

    emailjs
      .send(
        your_service_id, // Replace with your EmailJS Service ID
        your_template_id, // Replace with your EmailJS Template ID
        templateParams,
        your_public_key // Replace with your EmailJS Public Key
      )
      .then(
        (response) => {
          console.log(
            "Email sent successfully!",
            response.status,
            response.text
          );
          toast.success("Email sent successfully!", { position: "top-center" });
        },
        (error) => {
          console.error("Failed to send email:", error);
          toast.error("Failed to send email", { position: "top-center" });
        }
      );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[url('./acc-bg.jpg')] bg-cover bg-center text-emerald-300">
      <h1 className="text-center mb-6 mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-500 to-white bg-clip-text text-transparent">
        Account Opening
      </h1>

      <div className="card bg-transparent w-full max-w-xl shadow-2xl mb-6">
        <form
          className="card-body grid place-items-center"
          onSubmit={handleOpenAccount}
        >
          <fieldset className="w-full max-w-sm">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              className="input w-full mb-4"
              name="name"
              placeholder="Enter Name"
              required
            />

            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="input w-full mb-4"
              name="email"
              placeholder="Enter Email"
              required
            />

            <label className="block mb-1">Phone Number</label>
            <input
              type="text"
              className="input w-full mb-4"
              name="phone"
              placeholder="Enter Phone Number"
              required
            />

            <label className="block mb-1">Address</label>
            <input
              type="text"
              className="input w-full mb-4"
              name="address"
              placeholder="Enter Address"
              required
            />

            <label className="block mb-1">Initial Deposit</label>
            <input
              type="text"
              className="input w-full mb-4"
              name="amount"
              placeholder="Enter Amount"
              defaultValue="0.0"
            />

            {/* Branch Selection Dropdown */}
            <label className="block mb-1">Select Branch</label>
            <select
              name="branch_id"
              className="input w-full mb-4"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <button className="btn btn-neutral w-full mt-4" value="submit">
              Create Customer Account
            </button>
          </fieldset>
        </form>
      </div>

      {/* ✅ Updated Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto text-black"
        overlayClassName="fixed inset-0 bg-[url('./acc-bg.jpg')] bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold mb-4">Account Created Successfully</h2>
        <p>
          <strong>Name:</strong> {accountDetails?.name}
        </p>
        <p>
          <strong>Email:</strong> {accountDetails?.email}
        </p>
        <p>
          <strong>Account Number:</strong> {accountDetails?.account_number}
        </p>
        <p>
          <strong>Password:</strong> {accountDetails?.password}
        </p>
        <p>
          <strong>Balance:</strong> {accountDetails?.amount}
        </p>
        <button
          className="btn btn-danger mt-4"
          onClick={() => {
            setModalIsOpen(false); // Close the modal
            navigate("/employee-dashboard"); // Navigate to another page
          }}
        >
          Close
        </button>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default OpenAccount;
