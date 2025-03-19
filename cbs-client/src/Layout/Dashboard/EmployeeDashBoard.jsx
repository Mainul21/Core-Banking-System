import { ToastContainer, toast } from "react-toastify";
import {useContext, useEffect} from "react";
import { AuthContext } from "../Context/AuthContext";
const EmployeeDashBoard = () => {

  const { user, logout} = useContext(AuthContext);
  console.log('login',user.name);
  const {name} =user;

  useEffect(() => {
    const message = localStorage.getItem("showLoginToast");
    if (message === 'true') {
      toast.success("Login successful!", { position: "top-right" });
      localStorage.removeItem("showLoginToast");
    }
  }, []);


  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-gray-800">
      <h1 className="text-center mb-6 text-3xl font-bold">Welcome {name}</h1>
      <button className="btn bg-emerald-500 rounded-XL transition-all duration-300 hover:bg-red-500 text-black" onClick={logout}>Logout</button>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white p-6 rounded-lg w-full max-w-4xl">
        <div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold hover:text-black"><h1 className="text-center ">Open Account</h1></div>
        <div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold hover:text-black"><h1 className="text-center">Make Transaction</h1></div>
        <div className="border rounded-XL p-5 w-50 h-40 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:bg-emerald-500 hover:text-2xl hover:font-bold hover:text-black"><h1 className="text-center">Transfer Fund</h1></div>
      </div>
      <ToastContainer />
    </div>
    
  );
};

export default EmployeeDashBoard;
