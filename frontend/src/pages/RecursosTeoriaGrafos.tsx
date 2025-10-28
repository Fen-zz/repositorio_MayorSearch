// src/pages/RecursosTeoriaGrafos.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { buscarRecursos } from "../services/recursoService";
import { Search, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

export default function RecursosTeoriaGrafos() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [showTop, setShowTop] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // búsqueda local + ordenamiento local sobre "titulo"
  const [busqueda, setBusqueda] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [filtered, setFiltered] = useState<any[]>([]);

  // efecto scroll (igual que en otras páginas)
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

  // util: ordena por 'titulo' (seguro ante undefined)
  const sortByTitle = (arr: any[], asc: boolean) =>
    [...arr].sort((a, b) => {
      const ta = (a?.titulo ?? "").toString();
      const tb = (b?.titulo ?? "").toString();
      return asc
        ? ta.localeCompare(tb, "es", { sensitivity: "base" })
        : tb.localeCompare(ta, "es", { sensitivity: "base" });
    });

  // función para pedir TODOS los recursos con la etiqueta "Teoria de grafos"
  const fetchAllTeoria = async (q?: string) => {
    setLoading(true);
    try {
      const params: any = {
        q: q ?? "",
        etiquetas: "Teoria de grafos",
        // puedes agregar otros params por defecto si quieres
      };
      const data = await buscarRecursos(params);
      const items = data?.resultados ?? [];
      const ordenados = sortByTitle(items, ordenAsc);
      setResultados(ordenados);
      setFiltered(ordenados);
      setLastQuery(q ?? "");
    } catch (err) {
      console.error("Error al cargar recursos Teoria de grafos:", err);
      setResultados([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  // carga inicial: traemos todos de Teoria de grafos (sin query)
  useEffect(() => {
    fetchAllTeoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtro local por 'titulo' cada vez que cambie busqueda/resultados/ordenAsc
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

  const toggleOrden = () => {
    const nuevo = !ordenAsc;
    setOrdenAsc(nuevo);
    setFiltered((prev) => sortByTitle(prev, nuevo));
    setResultados((prev) => sortByTitle(prev, nuevo));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      <Sidebar onCollapse={setIsCollapsed} />

      <div
        className={`fixed top-6 right-8 z-9999 transition-all duration-500 ease-in-out transform ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"
        }`}
      >
        <UserMenu />
      </div>

      <main
        className={`flex-1 flex flex-col items-center justify-start relative transition-all duration-500 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
          <div className="w-full max-w-6xl mt-20 px-8 transform transition-transform duration-500 ease-in-out" style={{ transformOrigin: "center top" }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-[#0f5d38]">Recursos — Teoría de grafos</h1>

              {/* search + orden (local) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleOrden}
                  className="flex items-center gap-2 text-[#0f5d38] font-semibold border border-[#0f5d38] rounded-md px-3 py-2 hover:bg-[#0f5d38] hover:text-white transition"
                >
                  {ordenAsc ? <><ArrowUpAZ size={16} /> A-Z</> : <><ArrowDownAZ size={16} /> Z-A</>}
                </button>

                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar título..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0f5d38] transition w-56"
                  />
                </div>
              </div>
            </div>

            {/* frase discreta para volver a la página principal de Teoría de grafos */}
            <div className="mb-6 text-sm">
              <Link to="/teoriadegrafos" className="text-[#0f5d38] hover:underline">
                ← Volver a Teoría de grafos
              </Link>
            </div>

            {/* grid: 2 por fila (igual que Autores.tsx) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-12">
              {loading ? (
                <p className="text-center text-gray-500 col-span-full">Cargando...</p>
              ) : filtered.length > 0 ? (
                filtered.map((r) => <ResourceCard key={r.idrecurso} r={r} />)
              ) : (
                <p className="text-center text-gray-400 italic col-span-full">
                  No se encontraron recursos{lastQuery ? ` para “${lastQuery}”` : ""}.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
