// src/pages/RecursosCRUD.tsx
import { useEffect, useState } from "react";
import { PlusCircle, FileText, Search, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
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
  const [filtered, setFiltered] = useState<Recurso[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTop, setShowTop] = useState(true);

  // ✅ Extraemos rol e idusuario (maneja login manual y Google)
  const rol = typeof user === "object" && user?.rol ? user.rol : null;
  const idusuario = typeof user === "object" && user?.idusuario ? user.idusuario : null;

  // ✅ Cargar recursos
  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        const data = await recursoCrudService.getAll();
        const ordenados = data.sort((a, b) =>
          a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
        );
        setRecursos(ordenados);
        setFiltered(ordenados);
      } catch (err) {
        console.error("Error al obtener recursos:", err);
        setError("No se pudieron cargar los recursos 😭");
      } finally {
        setLoading(false);
      }
    };
    fetchRecursos();
  }, []);

  // 🧭 Mostrar/ocultar UserMenu al hacer scroll
  useEffect(() => {
    const scrollContainer = document.querySelector(".scroll-area") || window;
    let lastScrollTop = 0;
    const onScroll = () => {
      const currentScroll =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;
      const goingDown = currentScroll > lastScrollTop + 5;
      setShowTop(!goingDown || currentScroll < 80);
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    };
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, []);

  // 🔍 Filtrado en tiempo real por título
  useEffect(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) {
      setFiltered(recursos);
    } else {
      const filtrados = recursos.filter((r) =>
        r.titulo.toLowerCase().includes(term)
      );
      setFiltered(filtrados);
    }
  }, [busqueda, recursos]);

  // 🧩 Alternar orden A-Z / Z-A
  const toggleOrden = () => {
    const nuevoOrdenAsc = !ordenAsc;
    setOrdenAsc(nuevoOrdenAsc);
    const ordenados = [...filtered].sort((a, b) =>
      nuevoOrdenAsc
        ? a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
        : b.titulo.localeCompare(a.titulo, "es", { sensitivity: "base" })
    );
    setFiltered(ordenados);
  };

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

  // 🚫 Restringir acceso
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      {/* Sidebar con animación */}
      <Sidebar onCollapse={setIsCollapsed} />

      {/* UserMenu flotante */}
      <div
        className={`fixed top-6 right-8 z-50 transition-all duration-500 ease-in-out transform ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-6 pointer-events-none"
        }`}
      >
        <UserMenu />
      </div>

      {/* Contenido principal */}
      <main
        className={`flex-1 flex flex-col items-center justify-start relative transition-all duration-500 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
          <div
            className={`w-full max-w-6xl mt-20 px-8 transform transition-transform duration-500 ease-in-out ${
              isCollapsed ? "scale-100" : "scale-95"
            }`}
            style={{ transformOrigin: "center top" }}
          >
            {/* Breadcrumb */}
            <div className="text-sm text-[#8a6b12] mb-2">
              Inicio / Recursos
            </div>

            {/* Título, barra de búsqueda y botón A-Z */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h1 className="text-4xl font-bold text-[#8a6b12]">
                Gestión de Recursos
              </h1>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleOrden}
                  className="flex items-center gap-2 text-[#8a6b12] font-semibold border border-[#8a6b12] rounded-md px-3 py-2 hover:bg-[#8a6b12] hover:text-white transition"
                >
                  {ordenAsc ? (
                    <>
                      <ArrowUpAZ size={18} /> A-Z
                    </>
                  ) : (
                    <>
                      <ArrowDownAZ size={18} /> Z-A
                    </>
                  )}
                </button>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar recurso..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a6b12] transition w-48"
                  />
                </div>

                {/* Botón nuevo recurso */}
                <button
                  onClick={handleNew}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <PlusCircle className="w-5 h-5" /> Nuevo recurso
                </button>
              </div>
            </div>

            {/* Contenido */}
            {loading ? (
              <p className="text-gray-600">Cargando recursos... 🌀</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-600">
                No hay recursos aún. ¡Sube el primero! 🚀
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-10">
                {filtered.map((r) => (
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
      </main>
    </div>
  );
}
