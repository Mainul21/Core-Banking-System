import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { NavLink, useNavigate } from "react-router"; 
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const id = form.id.value; // Change from email to id
    const password = form.password.value;

    try {
      const response = await fetch(`${base_url}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }), // Send id instead of email
      });

      const data = await response.json();
      console.log("Login API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        // localStorage.setItem("user", JSON.stringify(data.user)); // Store user details
        localStorage.setItem("showLoginToast", "true"); // for toast
        login(data.token, data.role, data.user, data.id);
        // console.log(data.role);
      } else {
        console.error("Token missing from API response");
      }

      toast.success("Login successful!", { position: "top-right" });

      // Use setTimeout to delay navigation after toast
      
        if(data.role === "admin") navigate("/admin-dashboard");
        else if(data.role === "customer") navigate("/customer-dashboard");
        else navigate("/employee-dashboard"); // Adjust this based on user role
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { position: "top-right" });
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen bg-[url('./bg-login.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="hero-content flex-col lg:flex-col">
        <div className="text-center lg:text-center">
          <img className="w-1/4 mx-auto" src="./CBS.png" alt="" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Login now!</h1>
          <p className="py-6 bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Welcome to Core Banking System.</p>
        </div>
        <div className="card bg-transparent w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleLogin}>
              <fieldset className="fieldset">
                {error && <p className="text-red-500">{error}</p>}
                <label className="fieldset-label bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Account Number / Employee ID / Admin ID</label>
                <input
                  name="id" // Change name to id
                  type="text" // Change type to text
                  className="input"
                  placeholder="Enter your ID"
                  required
                />
                <label className="fieldset-label bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Password</label>
                <input
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Password"
                  required
                />
                <div className="flex-col-reverse">
                  <a onClick={()=>navigate('/reset-password')} className="link link-hover bg-gradient-to-r from-black to-emerald-500 bg-clip-text text-transparent">Forgot password?</a>
                </div>
                <div>
             
                </div>
                <button className="btn btn-neutral mt-4" type="submit">
                  Login
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

export default Login;