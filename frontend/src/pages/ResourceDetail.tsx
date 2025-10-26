import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download,
  User,
  Tags,
  BookOpen,
  Globe,
  Calendar,
  FileText,
} from "lucide-react";
import { getRecursoDetalle } from "../services/recursoService";

type RecursoDetalle = {
  idrecurso: number;
  titulo: string;
  descripcion?: string;
  idioma?: string;
  ubicacion?: string;
  creadofecha?: string;
  verificado?: boolean;
  autores?: string;
  temas?: string;
  etiquetas?: string;
  tiporecurso?: string;
  fechapublicacion?: string | null;
};

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [recurso, setRecurso] = useState<RecursoDetalle | null>(null);

  useEffect(() => {
    if (!id) return;
    getRecursoDetalle(Number(id))
      .then((data) => setRecurso(data))
      .catch((err) => console.error("Error cargando detalle:", err));
  }, [id]);

  if (!recurso) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando detalles del recurso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 px-6 py-24 overflow-y-auto">
      {/* Ruta de navegación */}
      <p className="text-sm text-gray-500 mb-2">
        <Link to="/home" className="hover:underline text-blue-600">
          Inicio
        </Link>{" "}
        / {recurso.titulo}
      </p>

      {/* Título */}
      <h1 className="text-4xl font-bold text-[#102A43] mb-4">
        {recurso.titulo}
      </h1>

      {/* Info general arriba */}
      <div className="text-sm mb-8 space-y-2">
        {recurso.ubicacion && (
          <p>
            <span className="font-semibold">URL:</span>{" "}
            <a
              href={recurso.ubicacion}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {recurso.ubicacion}
            </a>
          </p>
        )}
        {recurso.fechapublicacion && (
          <p>
            <span className="font-semibold">Fecha publicación:</span>{" "}
            {new Date(recurso.fechapublicacion).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vista previa */}
        <div className="flex-1 bg-white shadow-md rounded-2xl p-6">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
            Vista previa del PDF (próximamente 👀)
          </div>
          <div className="mt-6 text-center">
            {recurso.ubicacion && (
              <a
                href={recurso.ubicacion}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <Download size={18} /> Descargar PDF
              </a>
            )}
          </div>
        </div>

        {/* Resumen y metadatos (sin borde/sombra) */}
        <div className="flex-1 rounded-2xl p-1">
          <h2 className="font-bold text-lg mb-3">Resumen</h2>
          <p className="text-sm leading-relaxed text-gray-700 mb-5">
            {recurso.descripcion || "Sin descripción disponible."}
          </p>

          <div className="space-y-4 text-sm">
            {/* Tipo */}
            <div className="flex items-center gap-2 text-gray-700">
              <BookOpen className="text-blue-600" size={16} />
              <span className="font-semibold text-gray-800">Tipo:</span>{" "}
              {recurso.tiporecurso || "No especificado"}
            </div>

            {/* Idioma */}
            <div className="flex items-center gap-2 text-gray-700">
              <Globe className="text-blue-600" size={16} />
              <span className="font-semibold text-gray-800">Idioma:</span>{" "}
              {recurso.idioma?.toUpperCase() || "No definido"}
            </div>

            {/* Fecha */}
            {recurso.fechapublicacion && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="text-blue-600" size={16} />
                <span className="font-semibold text-gray-800">Fecha:</span>{" "}
                {new Date(recurso.fechapublicacion).toLocaleDateString()}
              </div>
            )}

            {/* Autores */}
            {recurso.autores && (
              <div>
                <p className="font-semibold text-[#004aad] flex items-center gap-2 mb-1">
                  <User size={16} /> Autores:
                </p>
                <p className="text-gray-700 ml-6">{recurso.autores}</p>
              </div>
            )}

            {/* Temas */}
            {recurso.temas && (
              <div>
                <p className="font-semibold text-[#9333ea] flex items-center gap-2 mb-1">
                  <FileText size={16} /> Temas:
                </p>
                <p className="text-gray-700 ml-6">{recurso.temas}</p>
              </div>
            )}

            {/* Etiquetas */}
            {recurso.etiquetas && (
              <div>
                <p className="font-semibold text-green-600 flex items-center gap-2 mb-1">
                  <Tags size={16} /> Etiquetas:
                </p>
                <p className="text-gray-700 ml-6">
                  {recurso.etiquetas.split(",").map((etq, i) => (
                    <span key={i}>
                      {etq.trim()}
                      {i < recurso.etiquetas!.split(",").length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comentarios */}
      <div className="mt-10 bg-white shadow-md rounded-2xl p-5">
        <h2 className="font-bold text-lg mb-3">Comentarios</h2>
        <div className="flex items-center bg-gray-50 rounded-xl p-2 border border-gray-200">
          <User className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Escribe un comentario..."
            className="flex-1 px-3 py-2 outline-none text-sm bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
