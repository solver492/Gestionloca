import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Mode = "VENTE" | "LUCRATIF";
type Theme = "dark" | "light";

interface AppContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType>({
  mode: "LUCRATIF",
  setMode: () => {},
  theme: "dark",
  toggleTheme: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem("movia-mode") as Mode) || "LUCRATIF";
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("movia-theme") as Theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("movia-mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("movia-theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <AppContext.Provider value={{ mode, setMode, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
