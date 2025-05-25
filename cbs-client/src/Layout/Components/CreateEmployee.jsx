import { useState } from "react";
import { Navigate } from "react-router";

export default function CreateEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employee_id: "",
    department: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setSuccessMsg("Employee created successfully!");
      Navigate(-1)
      setFormData({
        name: "",
        email: "",
        password: "",
        employee_id: "",
        department: "",
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[url('./create.jpg')] bg-center bg-cover bg-no-repeat p-4 md:p-8">
        <div className="max-w-xl mx-auto p-6 bg-trasparent  rounded-2xl shadow-2xl shadow-black mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">Create New Employee</h2>
      
      {successMsg && <p className="mb-4 text-green-600">{successMsg}</p>}
      {errorMsg && <p className="mb-4 text-red-600">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="p-3 text-black font-bold">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border font-bold text-black p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <label className="p-3 text-black font-bold">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border text-black p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <label className="p-3 text-black font-bold">Password</label>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border text-black p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <label className="p-3 text-black font-bold">Employee ID</label>
        <input
          type="text"
          name="employee_id"
          placeholder="Employee ID"
          value={formData.employee_id}
          onChange={handleChange}
          className="w-full text-black border p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <label className="p-3 text-black font-bold">Department</label>
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="w-full text-black border p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white p-3 hover:text-emerald-500 rounded-lg hover:bg-emerald-600 transition duration-200"
        >
          Create Employee
        </button>
      </form>
    </div>
    </div>
  );
}
