// src/pages/Home.tsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { buscarRecursos } from "../services/recursoService";

export default function Home() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");

  /**
   * mapFiltersToParams
   * - No borra campos desconocidos.
   * - Normaliza idioma y etiquetas.
   * - Conserva fecha_inicio/fecha_fin si vienen.
   */
  const mapFiltersToParams = (payload: Record<string, any> = {}) => {
    const params: Record<string, any> = {};

    // q (texto libre)
    if (payload.q && String(payload.q).trim() !== "") {
      params.q = String(payload.q).trim();
      setLastQuery(String(payload.q).trim());
    }

    // Idioma (simple mapping)
    if (payload.idioma) {
      const idi = String(payload.idioma).toLowerCase();
      if (idi.includes("inglés") || idi.includes("ingles")) params.idioma = "en";
      else if (idi.includes("español") || idi.includes("espanol")) params.idioma = "es";
      else params.idioma = payload.idioma;
    }

    // Construcción de etiquetas a partir de los filtros conocidos
    const etiquetas: string[] = [];

    if (payload.asignatura) {
      const asig = String(payload.asignatura).trim();
      if (asig) etiquetas.push(asig);
    }

    if (payload.tipo) {
      const tipo = String(payload.tipo).trim();
      if (tipo) etiquetas.push(tipo);
    }

    if (payload.nivel) {
      const nivel = String(payload.nivel).trim();
      if (nivel) etiquetas.push(nivel);
    }

    // Si el propio payload ya traía 'etiquetas' explícitas, respetarlas (se antepone)
    if (payload.etiquetas && String(payload.etiquetas).trim() !== "") {
      params.etiquetas = String(payload.etiquetas).trim();
    } else if (etiquetas.length > 0) {
      params.etiquetas = etiquetas.join(",");
    }

    // Fechas (importante: aceptar fecha_inicio / fecha_fin que vienen del SearchBar)
    if (payload.fecha_inicio) params.fecha_inicio = payload.fecha_inicio;
    if (payload.fecha_fin) params.fecha_fin = payload.fecha_fin;

    // Mantener cualquier otro filtro "útil" que venga crudo (no destructuramos todo)
    // Pero no copie cosas vacías o funciones por accidente.
    // Aquí podrías mapear más campos si los usas en el backend.
    // Ej: verificado, ubicacion, etc.
    if (payload.verificado !== undefined) params.verificado = payload.verificado;
    if (payload.ubicacion) params.ubicacion = payload.ubicacion;

    // límites por defecto (puedes exponer esto al UI más tarde)
    params.limit = payload.limit ?? 10;
    params.offset = payload.offset ?? 0;

    return params;
  };

  const handleSearch = async (payload: Record<string, any> | undefined) => {
    // Si no vino nada, no hacemos nada
    if (!payload) return;

    // Construimos params y conservamos TODO lo relevante, incluidas las fechas
    const params = mapFiltersToParams(payload);

    // Si no hay filtro alguno (ni texto ni etiquetas ni fechas), no lanzamos la petición
    const hasAnyFilter =
      Boolean(params.q) ||
      Boolean(params.etiquetas) ||
      (params.fecha_inicio && params.fecha_fin) ||
      Boolean(params.idioma) ||
      params.verificado !== undefined ||
      Boolean(params.ubicacion);

    if (!hasAnyFilter) {
      // Evitamos peticiones vacías que retornan todo el catálogo (opcional)
      return;
    }

    setLoading(true);
    try {
      console.log("🔥 Params enviados a buscarRecursos:", params);
      const data = await buscarRecursos(params);
      console.log("✅ Resultados recibidos:", data);
      setResultados(data.resultados || []);
    } catch (err: any) {
      if (err?.response) {
        console.error("API error", err.response.status, err.response.data);
      } else {
        console.error("Error al buscar recursos:", err);
      }
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] relative text-[#0a1a3d]">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-start p-8 relative">
        <div className="absolute top-6 right-8">
          <UserMenu />
        </div>

        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold text-[#0a3d91] mb-8 text-center">
            ¿Qué estás buscando ahora?
          </h1>

          <SearchBar onSearch={handleSearch} />

          {lastQuery && (
            <div className="mt-10">
              <p className="text-sm text-[#0a3d91] mb-2">
                Búsqueda / <span className="font-semibold">“{lastQuery}”</span>
              </p>

              <h2 className="text-3xl font-bold mb-1 text-[#0a3d91]">
                Resultados para: <span className="text-[#0a3d91]">“{lastQuery}”</span>
              </h2>
            </div>
          )}

          <div className="mt-6">
            {loading && <p className="text-gray-500 text-center">Buscando...</p>}

            {!loading && resultados.length > 0 ? (
              <div className="space-y-6">
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
      </main>
    </div>
  );
}
