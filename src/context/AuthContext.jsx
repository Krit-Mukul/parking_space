import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { AUTH } from "../api/endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isAdmin = false) => {
    const route = isAdmin ? AUTH.ADMIN_LOGIN : AUTH.DRIVER_LOGIN;
    const res = await api.post(route, { email, password });
    localStorage.setItem("token", res.data.token);
    const userData = { 
      email, 
      role: res.data.role || (isAdmin ? "admin" : "driver"),
      id: res.data.userId || res.data.user?.id
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (data, isAdmin = false) => {
    const route = isAdmin ? AUTH.ADMIN_SIGNUP : AUTH.DRIVER_REGISTER;
    await api.post(route, data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
