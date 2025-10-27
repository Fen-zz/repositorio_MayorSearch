// src/components/AuthorCard.tsx
import { Link } from "react-router-dom";
import { UserCircle2, BookOpen, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import autorService from "../services/autorService";
import type { Autor, RecursoAutor } from "../services/autorService";

type Props = {
  autor: Autor;
};

export default function AuthorCard({ autor }: Props) {
  const [recursos, setRecursos] = useState<RecursoAutor[]>([]);

  // 🧠 Cargar los recursos asociados al autor
  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        const data = await autorService.getRecursosByAutor(autor.idautor);
        setRecursos(data || []);
      } catch (err) {
        console.error("Error al cargar recursos del autor:", err);
      }
    };
    fetchRecursos();
  }, [autor.idautor]);

  return (
    <div
      key={autor.idautor}
      className="relative border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all p-5"
    >
      {/* Cabecera del autor */}
      <div className="flex items-center gap-3 mb-3">
        {autor.profileurl ? (
          <img
            src={autor.profileurl}
            alt={autor.nombreautor}
            className="w-14 h-14 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <UserCircle2 size={56} className="text-[#0f5d38]" />
        )}
        <div>
          <h3 className="font-semibold text-lg text-[#0f5d38]">
            {autor.nombreautor}
          </h3>
          {autor.orcid && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <ExternalLink size={14} /> ORCID:{" "}
              <a
                href={`https://orcid.org/${autor.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                {autor.orcid}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Cantidad de recursos */}
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
        <BookOpen size={16} className="text-green-700" />
        {recursos.length > 0 ? (
          <span>
            {recursos.length} recurso{recursos.length > 1 ? "s" : ""} asociado
          </span>
        ) : (
          <span>Sin recursos registrados</span>
        )}
      </div>

      {/* Botón de perfil */}
      <div className="flex justify-end">
        <Link
          to={`/autores/${autor.idautor}`}
          className="inline-flex items-center gap-1 border border-[#0f5d38] text-[#0f5d38] text-xs px-3 py-1.5 rounded-md hover:bg-green-50 transition shadow-sm"
        >
          <ExternalLink size={14} /> Ver perfil
        </Link>
      </div>
    </div>
  );
}
