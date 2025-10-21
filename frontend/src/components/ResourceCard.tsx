// src/components/ResourceCard.tsx
//import React from "react";

type Recurso = {
  idrecurso: number;
  titulo: string;
  descripcion?: string;
  idioma?: string;
  ubicacion?: string;
  creadofecha?: string;
  verificado?: boolean;
  rank?: number;
};

export default function ResourceCard({ r }: { r: Recurso }) {
  return (
    <article className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-slate-800">{r.titulo}</h3>
        <span className="text-xs text-gray-500">{r.idioma || "—"}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{r.descripcion || "Sin descripción"}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{r.creadofecha ? new Date(r.creadofecha).toLocaleDateString() : ""}</span>
        <div className="flex items-center gap-3">
          {r.verificado ? <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">Verificado</span> : null}
          <a href={r.ubicacion} target="_blank" rel="noreferrer" className="underline">Abrir</a>
        </div>
      </div>
    </article>
  );
}
