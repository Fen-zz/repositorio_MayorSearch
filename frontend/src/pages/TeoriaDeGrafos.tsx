// src/pages/TeoriaDeGrafos.tsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import SearchBarTeoriaGrafos from "../components/SearchBarTeoriaGrafos";
import { buscarRecursos } from "../services/recursoService";
import { Link } from "react-router-dom";
import { ArrowUpAZ, ArrowDownAZ } from "lucide-react"; // 🧠 nuevo import

export default function TeoriaDeGrafos() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTop, setShowTop] = useState(true);
  const [ordenAsc, setOrdenAsc] = useState(true); // 🧠 nuevo estado

  // 👇 Efecto del scroll como en Home
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

  // ---- handleSearch actualizado: asegura que "Teoria de grafos" esté activo ----
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

    // Aseguramos que "Teoria de grafos" esté presente en etiquetas (sin tilde)
    const etiquetasActuales = payload.etiquetas ? String(payload.etiquetas).trim() : "";
    const etiquetasArray = etiquetasActuales
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (!etiquetasArray.includes("Teoria de grafos")) {
      etiquetasArray.push("Teoria de grafos");
    }

    const etiquetasFinal = etiquetasArray.join(",");

    const params: any = {
      ...payload,
      etiquetas: etiquetasFinal,
    };

    if (params.asignatura) delete params.asignatura;

    console.log("🚀 Parámetros enviados a buscarRecursos:", params);

    setLoading(true);
    try {
      const data = await buscarRecursos(params);
      // Ordenamos por defecto A-Z (igual que en Home)
      const sorted = (data.resultados || []).sort((a: any, b: any) =>
        a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
      );
      setResultados(sorted);
      setLastQuery(params.q || "");
      setOrdenAsc(true);
    } catch (err: any) {
      console.error("Error al buscar recursos:", err);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Nuevo: función para alternar orden alfabético
  const toggleOrden = () => {
    const nuevoOrdenAsc = !ordenAsc;
    setOrdenAsc(nuevoOrdenAsc);
    const ordenados = [...resultados].sort((a, b) =>
      nuevoOrdenAsc
        ? a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
        : b.titulo.localeCompare(a.titulo, "es", { sensitivity: "base" })
    );
    setResultados(ordenados);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      {/* Sidebar sincronizada */}
      <Sidebar onCollapse={setIsCollapsed} />

      {/* UserMenu con animación */}
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
            <h1 className="text-4xl font-bold mb-8 text-center text-[#0f5d38] transition-all duration-500">
              Teoría de grafos
            </h1>

            {/* Barra especializada */}
            <SearchBarTeoriaGrafos onSearch={handleSearch} />

            {lastQuery && (
              <div className="mt-10 text-left ml-[30px]">
                <p className="text-sm text-[#0f5d38] mb-2">
                  Búsqueda / <span className="font-semibold">“{lastQuery}”</span>
                </p>

                {/* Encabezado con botón A-Z/Z-A */}
                <div className="flex items-center justify-between pr-6">
                  <h2 className="text-3xl font-bold mb-1 text-[#0f5d38]">
                    Resultados para: <span className="text-[#0f5d38]">“{lastQuery}”</span>
                  </h2>

                  {/* 🧩 Botón de orden alfabético */}
                  {resultados.length > 0 && (
                    <button
                      onClick={toggleOrden}
                      className="flex items-center gap-2 text-[#0f5d38] font-semibold border border-[#0f5d38] rounded-md px-3 py-2 hover:bg-[#0f5d38] hover:text-white transition text-sm"
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
                  )}
                </div>
              </div>
            )}

            {/* ---> Frase-enlace discreta centrada */}
            <div className="mt-3 mb-6 text-sm text-[#0f5d38] text-center">
              ¿Quieres navegar por todos los recursos de{" "}
              <Link
                to="/recursosteoriadegrafos"
                className="font-semibold underline hover:text-[#0f5d38] transition-colors"
              >
                Teoría de grafos
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
