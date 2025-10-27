import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  Calculator,
  Feather,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { buscarRecursos } from "../services/recursoService";
import type { BuscarParams } from "../services/recursoService";

export default function Explorar() {
  // sincronizamos con Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [ultimos, setUltimos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Mostrar/ocultar user menu por scroll (igual que en Home)
  const [showTop, setShowTop] = useState(true);
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

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const params: Partial<BuscarParams> = { limit: 10, offset: 0 };
        const resp = await buscarRecursos(params);
        if (resp && resp.resultados) setUltimos(resp.resultados);
      } catch (err) {
        console.error("Error cargando últimos recursos:", err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // 🔧 Carrusel corregido
  const scrollBy = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector("div > div"); // primera tarjeta
    const cardWidth = card ? (card as HTMLElement).offsetWidth + 16 : 720; // 16 = gap-4
    el.scrollBy({
      left: direction === "right" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  };

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

      {/* Contenedor principal con efecto de zoom y padding dinámico */}
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
            <div className="text-sm text-[#0a3d91] mb-2">Inicio / Explorar</div>

            {/* Título principal */}
            <h1 className="text-4xl font-bold mb-10 text-left text-[#0a3d91] transition-all duration-500">
              Explorar
            </h1>

            {/* Tres contenedores superiores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
              {/* Teoría de Grafos */}
              <div
                className="border rounded-xl p-6 shadow-sm"
                style={{ borderColor: "#2f6b3f" }}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold text-[#0f5d38]">
                    Teoría de Grafos
                  </h2>
                  <div
                    className="p-3 rounded-full border"
                    style={{ borderColor: "#2f6b3f" }}
                  >
                    <GitBranch size={28} className="text-[#0f5d38]" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-[#0f5d38] mb-2">
                    Explora todos los recursos
                  </h3>
                  <p className="text-sm">
                    Rama de las matemáticas que estudia los grafos, estructuras
                    compuestas por vértices (nodos) y aristas (líneas que los
                    conectan) para modelar relaciones entre objetos.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/teoriadegrafos"
                    className="inline-flex items-center gap-2 text-[#0f5d38] font-medium hover:underline"
                  >
                    Explorar <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Análisis numérico */}
              <div
                className="border rounded-xl p-6 shadow-sm"
                style={{ borderColor: "#7a1212" }}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold text-[#7a1212]">
                    Análisis numérico
                  </h2>
                  <div
                    className="p-3 rounded-full border"
                    style={{ borderColor: "#7a1212" }}
                  >
                    <Calculator size={28} className="text-[#7a1212]" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-[#7a1212] mb-2">
                    Explora todos los recursos
                  </h3>
                  <p className="text-sm">
                    Rama de las matemáticas y la informática que desarrolla y
                    aplica algoritmos para encontrar soluciones numéricas
                    aproximadas a problemas matemáticos complejos.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/analisisnumerico"
                    className="inline-flex items-center gap-2 text-[#7a1212] font-medium hover:underline"
                  >
                    Explorar <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Autores */}
              <div
                className="border rounded-xl p-6 shadow-sm"
                style={{ borderColor: "#8a6b12" }}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold text-[#8a6b12]">Autores</h2>
                  <div
                    className="p-3 rounded-full border"
                    style={{ borderColor: "#8a6b12" }}
                  >
                    <Feather size={28} className="text-[#8a6b12]" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-[#8a6b12] mb-2">
                    Explora todos los autores
                  </h3>
                  <p className="text-sm">
                    Encuentra todos los autores y sus recursos subidos en el
                    repositorio MayorSearch.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/autores"
                    className="inline-flex items-center gap-2 text-[#8a6b12] font-medium hover:underline"
                  >
                    Explorar <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Últimos recursos subidos */}
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-[#0a3d91]">
                Últimos recursos subidos:
              </h3>
            </div>

            {/* 🧩 Carrusel corregido */}
            <div className="relative flex justify-center">
              {/* Reservamos espacio lateral para las flechas */}
              <div className="overflow-hidden pr-20 w-full">
                <div
                  ref={carouselRef}
                  className="flex gap-4 pb-4 overflow-x-auto"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {loading ? (
                    <div className="p-8">Cargando...</div>
                  ) : ultimos.length === 0 ? (
                    <div className="p-8 text-gray-600">
                      No hay recursos recientes.
                    </div>
                  ) : (
                    ultimos.map((r) => (
                      <div key={r.idrecurso} className="min-w-[720px]">
                        <ResourceCard r={r} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Flecha izquierda */}
              <button
                onClick={() => scrollBy("left")}
                className="hidden md:flex absolute -left-14 top-1/3 bg-white border rounded-full p-3 shadow-md hover:scale-105 transition z-30"
                aria-label="Anterior"
              >
                <ArrowLeft size={20} className="text-[#0a3d91]" />
              </button>

              {/* Flecha derecha */}
              <button
                onClick={() => scrollBy("right")}
                className="hidden md:flex absolute right-6 top-1/3 bg-white border rounded-full p-3 shadow-md hover:scale-105 transition z-30"
                aria-label="Siguiente"
              >
                <ArrowRight size={20} className="text-[#0a3d91]" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
