import React, { createContext, useState, useEffect, useContext } from "react";

// Membuat context untuk tema, agar bisa digunakan secara global di seluruh komponen.
const ThemeContext = createContext();

// Komponen provider yang akan membungkus seluruh aplikasi agar tema bisa diakses dari mana saja.
export const ThemeProvider = ({ children }) => {

  // Inisialisasi tema dari localStorage atau preferensi sistem
  const [theme, setTheme] = useState(() => { 
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook untuk menggunakan tema di komponen lain
export const useTheme = () => {
  return useContext(ThemeContext);
};
