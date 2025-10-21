// src/components/SearchBar.tsx
import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "Busca un autor, un tema, categoría o asignatura específica",
}: Props) {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q.trim());
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
              <p className="cursor-pointer hover:text-blue-700">Teoría de grafos</p>
              <p className="cursor-pointer hover:text-blue-700">Análisis numérico</p>
            </div>
            <div>
              <strong>Tipo de recurso</strong>
              <p className="cursor-pointer hover:text-blue-700">Apuntes</p>
              <p className="cursor-pointer hover:text-blue-700">Libro/PDF</p>
              <p className="cursor-pointer hover:text-blue-700">Artículo</p>
            </div>
            <div>
              <strong>Nivel académico</strong>
              <p className="cursor-pointer hover:text-blue-700">Básico</p>
              <p className="cursor-pointer hover:text-blue-700">Intermedio</p>
              <p className="cursor-pointer hover:text-blue-700">Avanzado</p>
            </div>
            <div>
              <strong>Fecha</strong>
              <p className="cursor-pointer hover:text-blue-700">Recientes</p>
              <p className="cursor-pointer hover:text-blue-700">Último mes</p>
              <p className="cursor-pointer hover:text-blue-700">Último año</p>
            </div>
            <div>
              <strong>Idioma</strong>
              <p className="cursor-pointer hover:text-blue-700">Inglés</p>
              <p className="cursor-pointer hover:text-blue-700">Español</p>
              <p className="cursor-pointer hover:text-blue-700">Otro...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
