// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  roles?: string[]; // Ejemplo: ["admin", "docente"]
  children: React.ReactNode;
}

export default function PrivateRoute({ roles, children }: PrivateRouteProps) {
  const { rol, isAuthenticated, loading } = useAuth();

  // 🧩 Si todavía está cargando la sesión, mostramos un loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Cargando sesión... 🔄
        </div>
      </div>
    );
  }

  // 🧠 Si no está autenticado, lo mandamos al login
  if (!isAuthenticated) {
    console.log("⛔ No autenticado — redirigiendo al login");
    return <Navigate to="/login" replace />;
  }

  // 🧠 Si tiene roles definidos y el rol del usuario no está permitido
  if (roles && !roles.map(r => r.toLowerCase()).includes((rol || "").toLowerCase())) {
  console.log("🚫 Acceso denegado: tu rol es", rol);
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
