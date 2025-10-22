// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  user: string | null;
  rol: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: string, rol: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Carga la sesión guardada al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const storedRol = localStorage.getItem("rol");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setRol(storedRol);
    }
  }, []);

  // Guarda datos de sesión al hacer login
  const login = (user: string, rol: string, token: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", user);
    localStorage.setItem("rol", rol);
    setUser(user);
    setRol(rol);
    setToken(token);
  };

  // Limpia sesión (sin redirección)
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("rol");
    setUser(null);
    setRol(null);
    setToken(null);
    // 👇 No más window.location.href aquí
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, rol, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
