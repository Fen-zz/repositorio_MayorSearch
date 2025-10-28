import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { buscarRecursos } from "../services/recursoService";
import { Search, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

export default function RecursosAnalisisNumerico() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [showTop, setShowTop] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [filtered, setFiltered] = useState<any[]>([]);

  // 🧭 Mostrar/ocultar UserMenu según scroll (igual que otras vistas)
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

  // 🔤 Ordenamiento local (por título)
  const sortByTitle = (arr: any[], asc: boolean) =>
    [...arr].sort((a, b) => {
      const ta = (a?.titulo ?? "").toString();
      const tb = (b?.titulo ?? "").toString();
      return asc
        ? ta.localeCompare(tb, "es", { sensitivity: "base" })
        : tb.localeCompare(ta, "es", { sensitivity: "base" });
    });

  // 📥 Cargar TODOS los recursos de "Analisis numerico"
  const fetchAllAnalisis = async (q?: string) => {
    setLoading(true);
    try {
      const params: any = {
        q: q ?? "",
        etiquetas: "Analisis numerico", // 🎯 etiqueta fija
      };
      const data = await buscarRecursos(params);
      const items = data?.resultados ?? [];
      const ordenados = sortByTitle(items, ordenAsc);
      setResultados(ordenados);
      setFiltered(ordenados);
      setLastQuery(q ?? "");
    } catch (err) {
      console.error("Error al cargar recursos Analisis numerico:", err);
      setResultados([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Carga inicial
  useEffect(() => {
    fetchAllAnalisis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔎 Filtrado local (busqueda + orden)
  useEffect(() => {
    const term = (busqueda ?? "").trim().toLowerCase();
    if (!term) {
      setFiltered(sortByTitle(resultados, ordenAsc));
    } else {
      const filtrados = resultados.filter((r) =>
        (r?.titulo ?? "").toString().toLowerCase().includes(term)
      );
      setFiltered(sortByTitle(filtrados, ordenAsc));
    }
  }, [busqueda, resultados, ordenAsc]);

  // ↕️ Alternar orden
  const toggleOrden = () => {
    const nuevo = !ordenAsc;
    setOrdenAsc(nuevo);
    setFiltered((prev) => sortByTitle(prev, nuevo));
    setResultados((prev) => sortByTitle(prev, nuevo));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      <Sidebar onCollapse={setIsCollapsed} />

      {/* 🔝 UserMenu flotante */}
      <div
        className={`fixed top-6 right-8 z-9999 transition-all duration-500 ease-in-out transform ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-6 pointer-events-none"
        }`}
      >
        <UserMenu />
      </div>

      {/* 🌎 Contenido principal */}
      <main
        className={`flex-1 flex flex-col items-center justify-start relative transition-all duration-500 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
          <div
            className="w-full max-w-6xl mt-20 px-8 transform transition-transform duration-500 ease-in-out"
            style={{ transformOrigin: "center top" }}
          >
            {/* 🧭 Título + búsqueda + orden */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-[#a4161a]">
                Recursos — Análisis Numérico
              </h1>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleOrden}
                  className="flex items-center gap-2 text-[#a4161a] font-semibold border border-[#a4161a] rounded-md px-3 py-2 hover:bg-[#a4161a] hover:text-white transition"
                >
                  {ordenAsc ? (
                    <>
                      <ArrowUpAZ size={16} /> A-Z
                    </>
                  ) : (
                    <>
                      <ArrowDownAZ size={16} /> Z-A
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
                    placeholder="Buscar título..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a4161a] transition w-56"
                  />
                </div>
              </div>
            </div>

            {/* 🔙 Enlace de regreso */}
            <div className="mb-6 text-sm">
              <Link to="/analisisnumerico" className="text-[#a4161a] hover:underline">
                ← Volver a Análisis Numérico
              </Link>
            </div>

            {/* 📚 Grid: 2 por fila (responsive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-12">
              {loading ? (
                <p className="text-center text-gray-500 col-span-full">Cargando...</p>
              ) : filtered.length > 0 ? (
                filtered.map((r) => <ResourceCard key={r.idrecurso} r={r} />)
              ) : (
                <p className="text-center text-gray-400 italic col-span-full">
                  No se encontraron recursos
                  {lastQuery ? ` para “${lastQuery}”` : ""}.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
