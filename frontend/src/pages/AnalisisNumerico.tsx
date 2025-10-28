import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import SearchBarAnalisisNumerico from "../components/SearchBarAnalisisNumerico";
import { buscarRecursos } from "../services/recursoService";
import { Link } from "react-router-dom";
export default function AnalisisNumerico() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTop, setShowTop] = useState(true);

  // 🎢 Efecto de scroll (mismo que en Teoría de Grafos)
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

  // 🚀 handleSearch con "Analisis numerico" fijo
  type SearchPayload = {
    q?: string;
    etiquetas?: string;
    tipo?: string;
    nivel?: string;
    idioma?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    [k: string]: any;
  };

  const handleSearch = async (payload: SearchPayload | undefined) => {
    if (!payload) return;

    // Aseguramos que "Analisis numerico" esté presente en etiquetas
    const etiquetasActuales = payload.etiquetas ? String(payload.etiquetas).trim() : "";
    const etiquetasArray = etiquetasActuales
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (!etiquetasArray.includes("Analisis numerico")) {
      etiquetasArray.push("Analisis numerico");
    }

    const etiquetasFinal = etiquetasArray.join(",");

    const params: any = {
      ...payload,
      etiquetas: etiquetasFinal,
    };

    if (params.asignatura) delete params.asignatura;

    console.log("🚀 Parámetros enviados a buscarRecursos (Análisis Numérico):", params);

    setLoading(true);
    try {
      const data = await buscarRecursos(params);
      setResultados(data.resultados || []);
      setLastQuery(params.q || "");
    } catch (err: any) {
      console.error("Error al buscar recursos:", err);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#3d0a0a] flex overflow-hidden">
      {/* Sidebar sincronizada */}
      <Sidebar onCollapse={setIsCollapsed} />

      {/* UserMenu animado */}
      <div
        className={`fixed top-6 right-8 z-9999 transition-all duration-500 ease-in-out transform ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"
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
        <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
          <div
            className={`w-full max-w-6xl mt-20 transform transition-transform duration-500 ease-in-out ${
              isCollapsed ? "scale-100" : "scale-95"
            }`}
            style={{ transformOrigin: "center top" }}
          >
            {/* Título y barra */}
            <h1 className="text-4xl font-bold mb-8 text-center text-[#7B0C0C] transition-all duration-500">
              Análisis Numérico
            </h1>

            {/* Barra especializada */}
            <SearchBarAnalisisNumerico onSearch={handleSearch} />

            {lastQuery && (
              <div className="mt-10 text-left ml-[30px]">
                <p className="text-sm text-[#7B0C0C] mb-2">
                  Búsqueda / <span className="font-semibold">“{lastQuery}”</span>
                </p>
                <h2 className="text-3xl font-bold mb-1 text-[#7B0C0C]">
                  Resultados para: <span className="text-[#7B0C0C]">“{lastQuery}”</span>
                </h2>
              </div>
            )}

            {/* ---> Frase-enlace discreta centrada */}
            <div className="mt-3 mb-6 text-sm text-[#7B0C0C] text-center">
              ¿Quieres navegar por todos los recursos de{" "}
              <Link
                to="/recursosanalisisnumerico"
                className="font-semibold underline hover:text-[#a4161a] transition-colors"
              >
                Análisis numérico
              </Link>
              ?
            </div>

            {/* Resultados */}
            <div className="mt-6">
              {loading && <p className="text-gray-500 text-center">Buscando...</p>}

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
