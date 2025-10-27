import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
import { Document, Page} from "react-pdf";

// =========================
// Tipos
// =========================
type Archivo = {
  idarchivo: number;
  nombreoriginal?: string;
  rutaarchivo?: string;
  tipoarchivo?: string;
  tamano?: number;
};

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
  archivo?: Archivo;
};

// Configuración del worker de PDF.js


export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [recurso, setRecurso] = useState<RecursoDetalle | null>(null);

  useEffect(() => {
  if (!id) return;
  getRecursoDetalle(Number(id))
    .then((data) => {
      console.log("🧩 Recurso recibido del backend:", data);
      if (data.ubicacion) {
        data.ubicacion = data.ubicacion.replace(/\\/g, "/");
        }
      setRecurso(data);
    })
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
        {/* Vista previa del PDF y botón */}
        <div className="flex-1 bg-white shadow-md rounded-2xl p-6">
  <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center overflow-hidden p-4">
    {recurso.ubicacion ? (
  <>

  <div className="flex justify-center w-full">
  <div className="flex flex-col items-center justify-center 
                  w-full max-w-[550px] max-h-[650px]
                  overflow-y-auto bg-gray-100 rounded-xl shadow-inner p-4">
    <Document
      file={`http://localhost:8000/${recurso.ubicacion.replace(/\\/g, "/")}`}
      renderMode="canvas"
      loading={
        <div className="text-gray-500 py-10 italic">
          Cargando vista previa del PDF...
        </div>
      }
      onLoadError={(err) => console.error("❌ Error PDF:", err.message)}
      onLoadSuccess={({ numPages }) =>
        console.log(`✅ PDF cargado con ${numPages} páginas`)
      }
      className="flex flex-col items-center"
    >
      <Page
        pageNumber={1}
        width={500}
        renderTextLayer={false}   // Desactiva el texto flotante (mejor para ver imágenes)
        renderAnnotationLayer={false} // Quita bordes azules de links, etc.
        renderMode="canvas"
      />
    </Document>
  </div>
</div>
    {/* Botón de descarga / visualización */}
    <div className="mt-6 text-center">
      <a
        href={`http://localhost:8000/${recurso.ubicacion.replace(/\\/g, "/")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
      >
        <Download size={18} /> Ver / Descargar PDF
      </a>
    </div>
  </>
) : (
  <div className="text-gray-400 italic py-20">
    Sin vista previa disponible
  </div>
)}
  </div>
</div>

        {/* Resumen y metadatos */}
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
