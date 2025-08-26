import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";


export default function CreateEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employee_id: "",
    department: "",
    branch_id: "", // Branch ID for selection
    phone: "", // New phone field
    address: "", // New address field
    role: "employee", // Assuming user role is 'employee' by default
  });

  const [branches, setBranches] = useState([]);
  const base_url = import.meta.env.VITE_BASE_URL;
  
  // Fetch branches from the backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${base_url}/api/branches`);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${base_url}/api/create-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      toast.success("Employee created successfully!");
      Navigate(-1);
      setFormData({
        name: "",
        email: "",
        password: "",
        employee_id: "",
        department: "",
        branch_id: "",
        phone: "", // Reset phone
        address: "", // Reset address
        role: "employee", // Reset role to default
      });
    } catch (err) {
      toast.error(err.message || "Failed to create employee");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/create.jpg')] bg-center bg-cover bg-no-repeat p-4 md:p-8">
      <div className="max-w-xl mx-auto p-6 bg-transparent rounded-2xl shadow-2xl shadow-black mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Create New Employee</h2>

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

          {/* New Phone Number Field */}
          <label className="p-3 text-black font-bold">Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full text-black border p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />

          {/* New Address Field */}
          <label className="p-3 text-black font-bold">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full text-black border p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />

          {/* Branch Selection Dropdown */}
          <label className="p-3 text-black font-bold">Select Branch</label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            className="w-full text-black border p-3 hover:text-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select a branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white p-3 hover:text-emerald-500 rounded-lg hover:bg-emerald-600 transition duration-200"
          >
            Create Employee
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
