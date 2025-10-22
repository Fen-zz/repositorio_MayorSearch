// src/components/UserMenu.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { User, ChevronDown, LogOut } from "lucide-react";

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpia todo del localStorage y el contexto
    navigate("/"); // 👈 Redirige al HomeRoot, no al login
  };
  return isAuthenticated ? (
    <details className="relative">
      <summary className="flex items-center gap-2 text-blue-800 font-semibold list-none cursor-pointer">
        <User size={18} />
        <span>{user}</span>
        <ChevronDown size={16} />
      </summary>

      <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-md shadow-lg z-50">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </details>
  ) : (
    <>
      <Link to="/register" className="text-blue-700/90">
        REGISTRARSE
      </Link>
      <Link to="/login" className="text-blue-700/90">
        INICIAR SESIÓN
      </Link>
    </>
  );
}
