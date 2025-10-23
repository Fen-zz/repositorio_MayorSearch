import {
  FileText,
  Globe,
  CheckCircle,
  Download,
  Eye,
  Users,
  Tag,
  BookOpen,
  Bookmark,
} from "lucide-react";

type Recurso = {
  idrecurso: number;
  titulo: string;
  descripcion?: string;
  idioma?: string;
  ubicacion?: string;
  creadofecha?: string;
  verificado?: boolean;
  rank?: number;
  autores?: string;
  temas?: string;
  etiquetas?: string;
};

export default function ResourceCard({ r }: { r: Recurso }) {
  return (
    <div
      key={r.idrecurso}
      className="relative border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all p-5"
    >
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#0a3d91]" />
          <h3 className="font-semibold text-lg text-[#0a1a3d]">{r.titulo}</h3>
        </div>
        <Bookmark
          size={20}
          className="text-[#0a3d91] cursor-pointer hover:scale-110 transition-transform"
        />
      </div>

      {/* 🔹 Descripción */}
      <p className="text-gray-700 text-sm mb-3">
        {r.descripcion || "Sin descripción disponible"}
      </p>

      {/* 🔹 Autores, temas y etiquetas en líneas separadas */}
      {r.autores && (
        <p className="text-xs text-gray-700 mb-1">
          <span className="font-semibold text-blue-700 flex items-center gap-1">
            <Users size={14} /> Autores:
          </span>{" "}
          {r.autores}
        </p>
      )}

      {r.temas && (
        <p className="text-xs text-gray-700 mb-1">
          <span className="font-semibold text-purple-700 flex items-center gap-1">
            <FileText size={14} /> Temas:
          </span>{" "}
          {r.temas}
        </p>
      )}

      {r.etiquetas && (
        <p className="text-xs text-gray-700 mb-3">
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <Tag size={14} /> Etiquetas:
          </span>{" "}
          {r.etiquetas}
        </p>
      )}

      {/* 🔹 Detalles rápidos */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
        {r.idioma && (
          <span className="flex items-center gap-1">
            <Globe size={15} className="text-[#0a3d91]" />{" "}
            {r.idioma.toUpperCase()}
          </span>
        )}
        {r.verificado && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle size={15} /> Verificado
          </span>
        )}
        {r.creadofecha && (
          <span className="flex items-center gap-1">
            📅 {new Date(r.creadofecha).toLocaleDateString("es-CO")}
          </span>
        )}
      </div>

      {/* 🔹 Botones “Ver” y “Descargar” */}
      <div className="absolute bottom-4 right-5 flex gap-2">
        {r.ubicacion && (
          <>
            <a
              href={r.ubicacion}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-[#0a3d91] text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#082e6a] transition shadow-sm"
            >
              <Eye size={14} /> Ver
            </a>
            <a
              href={r.ubicacion}
              download
              className="flex items-center gap-1 border border-[#0a3d91] text-[#0a3d91] text-xs px-3 py-1.5 rounded-md hover:bg-blue-50 transition shadow-sm"
            >
              <Download size={14} /> Descargar
            </a>
          </>
        )}
      </div>
    </div>
  );
}
