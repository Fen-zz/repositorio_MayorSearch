import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { buscarRecursos } from "../services/recursoService";

export default function Home() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false); // ← Estado sincronizado con la Sidebar

  const mapFiltersToParams = (payload: Record<string, any> = {}) => {
    const params: Record<string, any> = {};
    if (payload.q && String(payload.q).trim() !== "") {
      params.q = String(payload.q).trim();
      setLastQuery(String(payload.q).trim());
    }
    if (payload.idioma) {
      const idi = String(payload.idioma).toLowerCase();
      if (idi.includes("inglés") || idi.includes("ingles")) params.idioma = "en";
      else if (idi.includes("español") || idi.includes("espanol")) params.idioma = "es";
      else params.idioma = payload.idioma;
    }
    const etiquetas: string[] = [];
    if (payload.asignatura) etiquetas.push(String(payload.asignatura).trim());
    if (payload.tipo) etiquetas.push(String(payload.tipo).trim());
    if (payload.nivel) etiquetas.push(String(payload.nivel).trim());
    if (payload.etiquetas && String(payload.etiquetas).trim() !== "") {
      params.etiquetas = String(payload.etiquetas).trim();
    } else if (etiquetas.length > 0) {
      params.etiquetas = etiquetas.join(",");
    }
    if (payload.fecha_inicio) params.fecha_inicio = payload.fecha_inicio;
    if (payload.fecha_fin) params.fecha_fin = payload.fecha_fin;
    if (payload.verificado !== undefined) params.verificado = payload.verificado;
    if (payload.ubicacion) params.ubicacion = payload.ubicacion;
    params.limit = payload.limit ?? 10;
    params.offset = payload.offset ?? 0;
    return params;
  };

  const handleSearch = async (payload: Record<string, any> | undefined) => {
    if (!payload) return;
    const params = mapFiltersToParams(payload);
    const hasAnyFilter =
      Boolean(params.q) ||
      Boolean(params.etiquetas) ||
      (params.fecha_inicio && params.fecha_fin) ||
      Boolean(params.idioma) ||
      params.verificado !== undefined ||
      Boolean(params.ubicacion);
    if (!hasAnyFilter) return;
    setLoading(true);
    try {
      const data = await buscarRecursos(params);
      setResultados(data.resultados || []);
    } catch (err: any) {
      console.error("Error al buscar recursos:", err);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

const [showTop, setShowTop] = useState(true);

useEffect(() => {
  const scrollContainer =
    document.querySelector(".scroll-area") || window;

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

return (
  <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
    {/* Sidebar sincronizada */}
    <Sidebar onCollapse={setIsCollapsed} />

    {/* UserMenu fijo con animación de desaparición */}
    <div
      className={`fixed top-6 right-8 z-9999 transition-all duration-500 ease-in-out transform ${
        showTop
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-6 pointer-events-none"
      }`}
    >
      <UserMenu />
    </div>

    {/* Contenedor principal */}
    <main
      className={`flex-1 flex flex-col items-center justify-start relative transition-all duration-500 ease-in-out ${
        isCollapsed ? "md:pl-20" : "md:pl-64"
      }`}
    >
      {/* Contenedor scrollable como en Profile */}
      <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
        <div
          className={`w-full max-w-6xl mt-20 transform transition-transform duration-500 ease-in-out ${
            isCollapsed ? "scale-100" : "scale-95"
          }`}
          style={{ transformOrigin: "center top" }}
        >
          {/* Título y barra */}
          <h1 className="text-4xl font-bold mb-8 text-center text-[#0a3d91] transition-all duration-500">
            ¿Qué estás buscando ahora?
          </h1>

          <SearchBar onSearch={handleSearch} />

          {lastQuery && (
            <div className="mt-10 text-left ml-[30px]">
              <p className="text-sm text-[#0a3d91] mb-2">
                Búsqueda / <span className="font-semibold">“{lastQuery}”</span>
              </p>

              <h2 className="text-3xl font-bold mb-1 text-[#0a3d91]">
                Resultados para:{" "}
                <span className="text-[#0a3d91]">“{lastQuery}”</span>
              </h2>
            </div>
          )}

          <div className="mt-6">
            {loading && (
              <p className="text-gray-500 text-center">Buscando...</p>
            )}

            {!loading && resultados.length > 0 ? (
              <div
                className={`space-y-6 transition-all duration-500 ease-in-out ${
                  isCollapsed ? "scale-95 opacity-90" : "scale-100 opacity-100"
                }`}
              >
                {resultados.map((r) => (
                  <ResourceCard key={r.idrecurso} r={r} />
                ))}
              </div>
            ) : (
              !loading &&
              lastQuery && (
                <p className="text-gray-400 text-center italic mt-6">
                  No se encontraron resultados para “{lastQuery}”.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
