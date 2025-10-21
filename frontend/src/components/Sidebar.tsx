// src/components/Sidebar.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Bookmark,
  Home,
  BookOpen,
  Bell,
  Download,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/materia", label: "Por materia", icon: BookOpen },
    { to: "/perfil", label: "Mi perfil", icon: User },
    { to: "/guardados", label: "Guardados", icon: Bookmark },
    { to: "/notificaciones", label: "Notificaciones", icon: Bell },
    { to: "/descargas", label: "Descargas", icon: Download },
    { to: "/ayuda", label: "Ayuda", icon: HelpCircle },
    { to: "/ajustes", label: "Ajustes", icon: Settings },
  ];

  return (
    <>
      {/* BOTÓN HAMBURGUESA (MÓVIL) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow hover:bg-gray-100 transition"
        onClick={toggleMobile}
        aria-label="Abrir menú"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-blue-800" />
        ) : (
          <Menu className="w-6 h-6 text-blue-800" />
        )}
      </button>

      {/* Overlay (móvil) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static 
        ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {!isCollapsed && (
              <Link to="/"><img src="/images/LogoMayorSearch.png" alt="Logo MayorSearch" className="w-40 object-contain"/></Link>
            )}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-700 transition"
              aria-label="Colapsar menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2 hover:bg-blue-50 hover:text-blue-800 transition-all ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? label : ""}
              >
                <Icon className="w-5 h-5 text-blue-700" />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
            {!isCollapsed && <p>© 2025 MayorSearch</p>}
          </div>
        </div>
      </aside>
    </>
  );
}
