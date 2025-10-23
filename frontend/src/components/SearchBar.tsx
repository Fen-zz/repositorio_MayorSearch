// src/components/SearchBar.tsx
import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type FiltersState = {
  asignatura: string;
  tipo: string;
  nivel: string;
  fecha: string;
  idioma: string;
};

type Props = {
  onSearch: (params: Partial<FiltersState & { q: string }>) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "Busca un autor, un tema, categoría o asignatura específica",
}: Props) {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    asignatura: "",
    tipo: "",
    nivel: "",
    fecha: "",
    idioma: "",
  });

  const handleFilterClick = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      q: q.trim(),
      ...filters,
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Barra de búsqueda */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-3/4 max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-2"
      >
        <Search className="text-gray-500 mr-2 w-5 h-5" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="grow outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="ml-2 p-2 rounded-full hover:bg-gray-100"
          aria-label="Mostrar filtros"
        >
          <SlidersHorizontal className="text-gray-600" />
        </button>
        <button
          type="submit"
          className="ml-3 w-10 h-10 bg-[#0C4A7B] text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Filtros desplegables */}
      {showFilters && (
        <div className="mt-4 p-4 w-3/4 max-w-3xl bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="font-semibold mb-2 text-blue-800">Filtros de búsqueda</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-gray-700">
            <div>
              <strong>Asignatura</strong>
              {["Teoría de grafos", "Análisis numérico"].map((x) => (
                <p
                  key={x}
                  onClick={() => handleFilterClick("asignatura", x)}
                  className={`cursor-pointer hover:text-blue-700 ${
                    filters.asignatura === x ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {x}
                </p>
              ))}
            </div>
            <div>
              <strong>Tipo de recurso</strong>
              {["Apuntes", "Libro/PDF", "Artículo"].map((x) => (
                <p
                  key={x}
                  onClick={() => handleFilterClick("tipo", x)}
                  className={`cursor-pointer hover:text-blue-700 ${
                    filters.tipo === x ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {x}
                </p>
              ))}
            </div>
            <div>
              <strong>Nivel académico</strong>
              {["Básico", "Intermedio", "Avanzado"].map((x) => (
                <p
                  key={x}
                  onClick={() => handleFilterClick("nivel", x)}
                  className={`cursor-pointer hover:text-blue-700 ${
                    filters.nivel === x ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {x}
                </p>
              ))}
            </div>
            <div>
              <strong>Fecha</strong>
              {["Recientes", "Último mes", "Último año"].map((x) => (
                <p
                  key={x}
                  onClick={() => handleFilterClick("fecha", x)}
                  className={`cursor-pointer hover:text-blue-700 ${
                    filters.fecha === x ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {x}
                </p>
              ))}
            </div>
            <div>
              <strong>Idioma</strong>
              {["Inglés", "Español", "Otro..."].map((x) => (
                <p
                  key={x}
                  onClick={() => handleFilterClick("idioma", x)}
                  className={`cursor-pointer hover:text-blue-700 ${
                    filters.idioma === x ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {x}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
