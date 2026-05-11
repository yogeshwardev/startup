import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

const getInitialTheme = () => {
  const stored = localStorage.getItem("campusarena-theme");
  return stored === "dark" ? stored : "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("campusarena-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme: "dark",
      setTheme,
      toggleTheme: () => setTheme("dark"),
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
