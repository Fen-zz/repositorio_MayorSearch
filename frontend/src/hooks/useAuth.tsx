// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  idusuario?: number;
  nombreusuario?: string;
  telefono?: string;
  email?: string;
  codigoestudiantil?: string;
  rol?: string;
}

interface AuthContextType {
  user: User | string | null;
  rol: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // 🧩 NUEVO
  login: (user: User | string, rol: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 🧩 NUEVO

useEffect(() => {
  const loadSession = async () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const storedRol = localStorage.getItem("rol");

    if (storedToken && storedUser && storedRol) {
      setToken(storedToken);
      setRol(storedRol);

      try {
        const parsedUser =
          typeof storedUser === "string" && storedUser.startsWith("{")
            ? JSON.parse(storedUser)
            : { nombreusuario: storedUser, rol: storedRol };
        setUser(parsedUser);
      } catch {
        setUser({ nombreusuario: storedUser, rol: storedRol });
      }
    }

    setLoading(false);
  };

  loadSession();
}, []);


  const login = (user: User | string, rol: string, token: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", typeof user === "string" ? user : JSON.stringify(user));
    localStorage.setItem("rol", rol);
    setUser(user);
    setRol(rol);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("rol");
    setUser(null);
    setRol(null);
    setToken(null);
  };

  const isAuthenticated = Boolean(token && user);

  if (loading) {
  return <div className="flex items-center justify-center h-screen text-blue-600">Cargando sesión...</div>;
  }
  
  return (
    <AuthContext.Provider
      value={{ user, rol, token, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
