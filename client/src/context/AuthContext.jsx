import { createContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("campusarena-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("campusarena-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("campusarena-user");
    }
  }, [user]);

  const authenticate = async (endpoint, payload) => {
    setLoading(true);

    try {
      const { data } = await http.post(endpoint, payload);
      localStorage.setItem("campusarena-token", data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("campusarena-token");
    localStorage.removeItem("campusarena-user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (payload) => authenticate("/login", payload),
      register: (payload) => authenticate("/register", payload),
      logout,
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
