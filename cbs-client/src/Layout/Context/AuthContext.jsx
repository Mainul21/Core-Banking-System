import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [info, setInfo] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (token, role, userData, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ userId, role, ...userData }));
    setUser({ userId, role, ...userData });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
  
      if (parsed.email) {
        fetch(`${import.meta.env.VITE_BASE_URL}/api/user?email=${parsed.email}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Fetched User:", data);
          })
          .catch((error) => console.error("Error fetching user:", error));
      } else {
        console.warn("Email not found in localStorage user");
      }
    }
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, login, logout,setInfo, info }}>
      {children}
    </AuthContext.Provider>
  );
};

export{ AuthContext, AuthProvider };