import { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";

export default function Home() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Función que conecta con tu backend
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recursos/recursos/buscar?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data = await res.json();
      console.log("✅ Resultados recibidos:", data);
      setResultados(data.resultados || []);
    } catch (err) {
      console.error("❌ Error al buscar recursos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-start p-8 relative">
        {/* UserMenu flotante arriba a la derecha */}
        <div className="absolute top-6 right-8">
          <UserMenu />
        </div>

        {/* Contenido central */}
        <div className="w-full max-w-5xl flex flex-col items-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
            ¿Qué estás buscando ahora?
          </h1>

          {/* Barra de búsqueda */}
          <SearchBar onSearch={handleSearch} />

          {/* Resultados de búsqueda */}
          <div className="mt-10 w-full grid gap-4">
            {loading && (
              <p className="text-gray-500 text-center">Buscando...</p>
            )}

            {!loading && resultados.length > 0 &&
              resultados.map((r) => <ResourceCard key={r.idrecurso} r={r} />)
            }

            {!loading && resultados.length === 0 && (
              <p className="text-gray-400 text-center italic mt-6">
                No hay resultados aún.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
