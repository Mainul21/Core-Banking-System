import { ToastContainer, toast } from "react-toastify";
import {useContext, useEffect,useState} from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router";
const EmployeeDashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const { user, logout} = useContext(AuthContext);
  console.log('login',user.name);
  const {name} =user;
  

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === 'true') {
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
        console.log(data);
        setCustomers(data);
      }catch(error){
        toast.error(error.message, { position: "top-right" });
      }finally{
        setLoading(false);
      }
    }
    fetchCustomer();

    const interval = setInterval(fetchCustomer, 15000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount

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
        setCustomers(customers.filter(customer => customer.id !== customerId));
      } else {
        toast.error("Error deleting customer", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Server error", { position: "top-right" });
    }
  }

console.log(customers);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-[url('./emp-bg.jpg')] bg-cover bg-center bg-no-repeat text-emerald-300">
      <h1 className="text-center mb-6 text-3xl font-bold bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Welcome {name}</h1>
      <button className="btn bg-emerald-500 rounded-XL transition-all duration-300 hover:bg-red-500 text-black" onClick={logout}>Logout</button>
      {loading ? (
        <p className="text-lg mt-5 bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Loading customer details...</p>
      ) : (
      <div className="w-full max-w-4xl mt-5">
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Account Number</th>
                <th className="p-3 border">Balance</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="text-center bg-gray-700 border border-gray-600">
                    <td className="p-3 border">{customer.name}</td>
                    <td className="p-3 border">{customer.email}</td>
                    <td className="p-3 border">{customer.account_number}</td>
                    <td className="p-3 border">${customer.balance}</td>
                    <td className="btn bg-emerald-500 p-3 mt-1" onClick={()=>handleDelete(customer.id)}>Delete</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-3 text-center">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <Link to="/OpenAccount"><div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 bg-black/30 hover:text-2xl hover:font-bold hover:text-black"><h1 className="text-center ">Open Account</h1></div></Link>
        <div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl bg-black/30 hover:font-bold hover:text-black"><h1 className="text-center">Make Transaction</h1></div>
        <div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold bg-black/30 hover:text-black"><h1 className="text-center">Transfer Fund</h1></div>
      </div>
      <ToastContainer />
    </div>
    
  );
};

export default EmployeeDashBoard;
