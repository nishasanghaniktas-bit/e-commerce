import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_BASE } from "../utils/apiBase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const { token, user: userPayload } = response.data;
      const normalized = { ...userPayload, token };
      setUser(normalized);
      localStorage.setItem('currentUser', JSON.stringify(normalized));
      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    const token = user?.token;
    if (token) {
      axios.post(`${API_BASE}/api/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
