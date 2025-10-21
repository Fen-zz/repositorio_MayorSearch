// src/components/Sidebar.tsx
// import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 min-h-screen border-r">
      <div className="p-6">
        <img src="/logo.png" alt="MayorSearch" className="w-32 mb-6" />
        <nav className="space-y-3 text-sm text-blue-800">
          <Link to="/" className="block py-2 px-2 rounded hover:bg-blue-50">Buscar</Link>
          <div className="mt-3">
            <div className="font-semibold mb-2">Explorar</div>
            <ul className="text-sm text-gray-600 space-y-1 ml-3">
              <li>Por materia</li>
              <li>Por autor</li>
              <li>Por etiqueta/tema</li>
            </ul>
          </div>
          <Link to="/perfil" className="block py-2 px-2 rounded hover:bg-blue-50 mt-4">Mi perfil</Link>
          <Link to="/guardados" className="block py-2 px-2 rounded hover:bg-blue-50">Guardados</Link>
        </nav>
      </div>
    </aside>
  );
}
