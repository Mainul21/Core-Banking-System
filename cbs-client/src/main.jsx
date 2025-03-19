import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router"; // Use 'react-router-dom' for V7
import "./index.css";
import App from "./App";
import Login from "./Layout/Authentication/login";
import AdminDashBoard from "./Layout/Dashboard/AdminDashBoard";
import EmployeeDashBoard from "./Layout/Dashboard/EmployeeDashBoard";
import CustomerDashBoard from "./Layout/Dashboard/CustomerDashBoard";
import { AuthProvider } from "./Layout/Context/AuthContext";
import ProtectedRoute from "./Layout/Authentication/Protected";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashBoard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route path="/employee-dashboard" element={<EmployeeDashBoard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer-dashboard" element={<CustomerDashBoard />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
