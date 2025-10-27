import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import AuthorCard from "../components/AuthorCard";
import AutorService from "../services/autorService";
import type { Autor } from "../services/autorService";
import { Search } from "lucide-react";

export default function Autores() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTop, setShowTop] = useState(true);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [filtered, setFiltered] = useState<Autor[]>([]);
  const [busqueda, setBusqueda] = useState("");

  // 🎢 Mostrar/ocultar el UserMenu igual que en Explorar
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

  // 🧠 Cargar todos los autores al inicio
  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const data = await AutorService.getAll();
        const ordenados = data.sort((a, b) =>
          a.nombreautor.localeCompare(b.nombreautor, "es", { sensitivity: "base" })
        );
        setAutores(ordenados);
        setFiltered(ordenados);
      } catch (err) {
        console.error("Error al cargar autores:", err);
      }
    };
    fetchAutores();
  }, []);

  // 🔍 Filtrado en tiempo real por nombreautor
  useEffect(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) {
      setFiltered(autores);
    } else {
      const filtrados = autores.filter((a) =>
        a.nombreautor.toLowerCase().includes(term)
      );
      setFiltered(filtrados);
    }
  }, [busqueda, autores]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      {/* Sidebar sincronizada */}
      <Sidebar onCollapse={setIsCollapsed} />

      {/* UserMenu flotante con animación */}
      <div
        className={`fixed top-6 right-8 z-9999 transition-all duration-500 ease-in-out transform ${
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
            <div className="text-sm text-[#8a6b12] mb-2">Inicio / Autores</div>

            {/* Título y barra de búsqueda */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-[#8a6b12] transition-all duration-500">
                Autores
              </h1>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Buscar autor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a6b12] transition w-48"
                />
              </div>
            </div>

            {/* Grid de autores */}
            {filtered.length === 0 ? (
              <div className="text-center text-gray-600 mt-12">
                No se encontraron autores.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {filtered.map((autor) => (
                  <AuthorCard key={autor.idautor} autor={autor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
