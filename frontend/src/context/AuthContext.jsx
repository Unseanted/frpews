import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("frpews_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem("frpews_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem("frpews_token", token);
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await authApi.register(payload);
    localStorage.setItem("frpews_token", token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("frpews_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
