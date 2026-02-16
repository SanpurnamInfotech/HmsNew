import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {}, toggleTheme: () => {} });
const THEME_KEY = "current_theme";

const applyTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  document.body.className = theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || "light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
