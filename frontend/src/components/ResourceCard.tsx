// src/components/ResourceCard.tsx
import { useEffect, useState } from "react";
import { addFavorito, removeFavorito, checkFavorito } from "../services/favoritosService"; // 🧩 NUEVO
import { useAuth } from "../hooks/useAuth"; // 🧩 NUEVO
import { Link } from "react-router-dom";
import {
  FileText,
  Globe,
  CheckCircle,
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
  tiporecurso?: string;
  fechapublicacion?: string | null;
};

export default function ResourceCard({ r }: { r: Recurso }) {
  // 🧩 Estado de favorito y auth (no obligatorio pasar token a las funciones del service)
  const { token } = useAuth();
  const [esFavorito, setEsFavorito] = useState(false);

  // 🧩 Verificar si ya es favorito al montar el componente
  useEffect(() => {
    const verificarFavorito = async () => {
      // Si no hay token no consultamos (evita llamadas innecesarias)
      if (!token) return;
      if (r.idrecurso == null) return;

      try {
        // ← CORRECCIÓN: llamamos checkFavorito solo con el id, el servicio toma el token interno
        const esFav = await checkFavorito(r.idrecurso);
        setEsFavorito(esFav);
      } catch (err) {
        console.error("Error al verificar favorito:", err);
      }
    };
    verificarFavorito();
  }, [r.idrecurso, token]);

  // 🧩 Manejar clic en el ícono de favorito
  const manejarFavorito = async () => {
    if (!token) {
      alert("Debes iniciar sesión para agregar favoritos 😅");
      return;
    }

    try {
      if (esFavorito) {
        // ← CORRECCIÓN: removeFavorito sólo con idrecurso
        await removeFavorito(r.idrecurso);
        setEsFavorito(false);
      } else {
        // ← CORRECCIÓN: addFavorito sólo con idrecurso
        await addFavorito(r.idrecurso);
        setEsFavorito(true);
      }
    } catch (err) {
      console.error("Error al actualizar favorito:", err);
      alert("Ocurrió un error al actualizar favoritos. Revisa la consola.");
    }
  };

  // 💎 LÓGICA ORIGINAL (intacta)
  return (
    <div
      key={r.idrecurso}
      className="relative border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all p-5"
    >
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#0a3d91]" />
          <h3 className="font-semibold text-lg text-[#0a1a3d]">{r.titulo}</h3>
        </div>

        {/* Bookmark con lógica de favoritos */}
        <Bookmark
          size={20}
          onClick={manejarFavorito}
          className={`cursor-pointer hover:scale-110 transition-transform ${
            esFavorito ? "text-yellow-500" : "text-[#0a3d91]"
          }`}
        />
      </div>

      {/* Descripción */}
      <p className="text-gray-700 text-sm mb-3">
        {r.descripcion || "Sin descripción disponible"}
      </p>

      {/* Autores, temas y etiquetas */}
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

      {/* Detalles rápidos */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
        {r.tiporecurso && (
          <span className="flex items-center gap-1">
            <FileText size={15} className="text-[#0a3d91]" /> {r.tiporecurso}
          </span>
        )}
        {r.idioma && (
          <span className="flex items-center gap-1">
            <Globe size={15} className="text-[#0a3d91]" /> {r.idioma.toUpperCase()}
          </span>
        )}
        {r.verificado && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle size={15} /> Verificado
          </span>
        )}
        {r.fechapublicacion && (
          <span className="flex items-center gap-1">
            📅 {new Date(r.fechapublicacion + "T00:00:00").toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Botones */}
      <div className="absolute bottom-4 right-5 flex gap-2">
        {r.ubicacion && (
          <>
            <Link
              to={`/recurso/${r.idrecurso}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Eye size={16} /> Ver detalles
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
