import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("shopsphere-theme") === "dark";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";

    localStorage.setItem(
      "shopsphere-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}