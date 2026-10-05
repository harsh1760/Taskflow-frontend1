import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const tokenKey = "task_manager_token";
const userKey = "task_manager_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(userKey)); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    setLoading(true);
    try { const { data } = await api.post("/auth/login", credentials); saveSession(data); return data; }
    finally { setLoading(false); }
  };

  const register = async (details) => {
    setLoading(true);
    try { const { data } = await api.post("/auth/register", details); if (data.token) saveSession(data); return data; }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey); localStorage.removeItem(userKey); setToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, loading, isAuthenticated: Boolean(token && user), login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);