// src/pages/RecursosCRUD.tsx
import { useEffect, useState } from "react";
import { PlusCircle, FileText } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import recursoCrudService from "../services/recursoCrudService";
import type { Recurso } from "../services/recursoCrudService";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

export default function RecursosCRUD() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Extraemos rol e idusuario (maneja login manual y Google)
  const rol = typeof user === "object" && user?.rol ? user.rol : null;
  const idusuario = typeof user === "object" && user?.idusuario ? user.idusuario : null;

  // ✅ Cargar recursos
  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        const data = await recursoCrudService.getAll();
        setRecursos(data);
      } catch (err) {
        console.error("Error al obtener recursos:", err);
        setError("No se pudieron cargar los recursos 😭");
      } finally {
        setLoading(false);
      }
    };
    fetchRecursos();
  }, []);

  // ✅ Eliminar recurso
  const handleDelete = async (id?: number) => {
    if (!id) {
      alert("ID inválido");
      return;
    }
    if (!confirm("¿Seguro que deseas eliminar este recurso? 🗑️")) return;
    try {
      await recursoCrudService.delete(id);
      setRecursos((prev) => prev.filter((r) => r.idrecurso !== id));
      alert("Recurso eliminado correctamente 💨");
    } catch (err) {
      alert("Error al eliminar el recurso 😵");
    }
  };

  // ✅ Editar recurso
  const handleEdit = (id?: number) => {
    if (!id) {
      alert("ID del recurso no disponible 😬");
      return;
    }
    navigate(`/admin/recursos/editar/${id}`);
  };

  // ✅ Crear recurso nuevo
  const handleNew = () => {
    navigate(`/admin/recursos/nuevo`);
  };

  // 🚫 Restringir acceso solo a admin o docente
  if (!rol || (rol !== "admin" && rol !== "docente")) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-xl font-semibold">🚫 Acceso denegado</p>
        <p className="text-gray-600">
          Solo los administradores o docentes pueden gestionar recursos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <UserMenu />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Recursos</h1>

          <button
            onClick={handleNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <PlusCircle className="w-5 h-5" /> Nuevo recurso
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Cargando recursos... 🌀</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : recursos.length === 0 ? (
          <p className="text-gray-600">No hay recursos aún. ¡Sube el primero! 🚀</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursos.map((r) => (
              <div
                key={r.idrecurso}
                className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="text-blue-600 w-6 h-6" />
                  <h2 className="text-lg font-semibold">{r.titulo}</h2>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {r.descripcion || "Sin descripción 😅"}
                </p>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>{r.idioma || "Sin idioma"}</span>
                  <span>{r.tiporecurso || "Sin tipo"}</span>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  {/* ✅ Solo admin o el docente creador pueden editar */}
                  {(rol === "admin" || idusuario === r.idusuario_creador) && (
                    <button
                      onClick={() =>
                        r.idrecurso
                          ? handleEdit(r.idrecurso)
                          : alert("ID del recurso no disponible")
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>
                  )}

                  {/* 🚨 Solo admin o el creador pueden eliminar */}
                  {(rol === "admin" || idusuario === r.idusuario_creador) && (
                    <button
                      onClick={() =>
                        r.idrecurso
                          ? handleDelete(r.idrecurso)
                          : alert("ID del recurso no disponible")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
