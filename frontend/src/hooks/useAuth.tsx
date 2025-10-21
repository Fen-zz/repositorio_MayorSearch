import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  user: string | null;
  rol: string | null;
  login: (user: string, rol: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const storedRol = localStorage.getItem("rol");
    if (token && storedUser) {
      setUser(storedUser);
      setRol(storedRol);
    }
  }, []);

  const login = (user: string, rol: string, token: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", user);
    localStorage.setItem("rol", rol);
    setUser(user);
    setRol(rol);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRol(null);
  };

  return (
    <AuthContext.Provider value={{ user, rol, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
