// src/components/UserMenu.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { User, ChevronDown, LogOut, UserCircle, Search } from "lucide-react"; // 🔍 Importamos Search

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpia todo del localStorage y el contexto
    navigate("/"); // Redirige al HomeRoot
  };

  const handleProfile = () => {
    navigate("/profile"); // Redirige al perfil del usuario
  };

  const handleSearch = () => {
    navigate("/home"); // Redirige al home
  };

  return isAuthenticated ? (
    <div className="flex items-center gap-3">
      {/* Botón de búsqueda */}
      <button
        onClick={handleSearch}
        className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
        title="Volver a la búsqueda"
      >
        <Search className="w-5 h-5 text-[#0a3d91]" />
      </button>

      {/* Menú de usuario */}
      <details className="relative">
        <summary className="flex items-center gap-2 text-blue-800 font-semibold list-none cursor-pointer hover:text-blue-900 transition-colors">
          <User size={18} />
          <span>{user as React.ReactNode}</span>
          <ChevronDown size={16} />
        </summary>

        <div className="absolute right-0 mt-2 w-44 bg-white border border-blue-100 rounded-md shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
          >
            <UserCircle size={16} />
            Ver perfil
          </button>

          <hr className="border-blue-100" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </details>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-4">
  <Link to="/register" className="text-blue-700/90">
    REGISTRARSE
  </Link>
  <Link to="/login" className="text-blue-700/90">
    INICIAR SESIÓN
  </Link>
</div>
    </>
  );
}
