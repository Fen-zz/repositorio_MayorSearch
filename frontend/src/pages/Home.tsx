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

  const mapFiltersToParams = (payload: Record<string, any>) => {
    const params: Record<string, any> = {};

    if (payload.q) {
      params.q = payload.q;
      setLastQuery(payload.q);
    }

    if (payload.idioma) {
      const idi = payload.idioma.toLowerCase();
      if (idi.includes("inglés") || idi.includes("ingles")) params.idioma = "en";
      else if (idi.includes("español") || idi.includes("espanol")) params.idioma = "es";
      else params.idioma = payload.idioma;
    }

    if (payload.tipo) {
      params.tiporecurso = payload.tipo;
    }

    const etiquetas: string[] = [];
    if (payload.asignatura) etiquetas.push(payload.asignatura);
    if (payload.nivel) etiquetas.push(payload.nivel);
    if (etiquetas.length > 0) params.etiquetas = etiquetas.join(",");

    // Mapeo rápido de 'fecha' (mantén string para que backend lo interprete)
    if (payload.fecha) {
      const f = (payload.fecha as string).toLowerCase();
      if (f.includes("recientes")) params.fecha = "recientes";
      else if (f.includes("último mes") || f.includes("ultimo mes")) params.fecha = "ultimo_mes";
      else if (f.includes("último año") || f.includes("ultimo año")) params.fecha = "ultimo_anio";
    }

    params.limit = 10;
    params.offset = 0;

    return params;
  };

  const handleSearch = async (payload: Record<string, any>) => {
    const isEmpty =
      !payload ||
      (!payload.q && !payload.tipo && !payload.asignatura && !payload.nivel && !payload.fecha && !payload.idioma);

    if (isEmpty) return;

    const params = mapFiltersToParams(payload);

    setLoading(true);
    try {
      const data = await buscarRecursos(params);
      console.log("✅ Resultados recibidos:", data);
      setResultados(data.resultados || []);
    } catch (err: any) {
      // Mejor logging: si axios devuelve 422, muéstralo claro
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
