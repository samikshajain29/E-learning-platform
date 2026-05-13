import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Add a request interceptor to attach the token on every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  // Keep a ref to navigate so the interceptor always has the latest instance
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("adminToken", newToken);
    localStorage.setItem("adminUser", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }, []);

  // Validate token on mount — check if stored token still exists
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // Add a response interceptor to handle 401 errors globally
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear invalid token and redirect to login
          logout();
          navigateRef.current("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
