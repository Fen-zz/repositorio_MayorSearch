// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  roles?: string[]; // Ejemplo: ["admin", "docente"]
  children: React.ReactNode;
}

export default function PrivateRoute({ roles, children }: PrivateRouteProps) {
  const { rol, isAuthenticated } = useAuth(); // ✅ usamos `rol` directamente

  // 🧠 Si no está autenticado, lo mandamos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 Si tiene roles definidos y el rol del usuario no está permitido
  if (roles && !roles.includes(rol || "")) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">🚫 Acceso denegado</h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Si pasa las validaciones, mostramos el contenido
  return <>{children}</>;
}
