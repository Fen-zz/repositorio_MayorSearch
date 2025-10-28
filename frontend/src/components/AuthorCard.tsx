// src/components/AuthorCard.tsx
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink } from "lucide-react"; // 🧹 Eliminado UserCircle2 (ya no se usa)
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
      className="relative border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all p-5 text-[#8a6b12]" // 🟡 color principal dorado
    >
      {/* 🧱 Cabecera del autor (foto eliminada) */}
      <div className="mb-3">
        <h3 className="font-bold text-xl truncate">{autor.nombreautor}</h3>
        {autor.orcid && (
          <p className="text-sm flex items-center gap-1 mt-1 truncate max-w-full overflow-hidden text-[#8a6b12]">
            <ExternalLink size={14} />
            ORCID:&nbsp;
            <a
              href={`https://orcid.org/${autor.orcid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline text-[#8a6b12] break-all"
              style={{ wordBreak: "break-word" }} // 🆕 Evita que ORCID muy largo se desborde
            >
              {autor.orcid}
            </a>
          </p>
        )}
      </div>

      {/* 📚 Cantidad de recursos */}
      <div className="flex items-center gap-2 text-sm text-[#8a6b12] mb-4">
        <BookOpen size={16} />
        {recursos.length > 0 ? (
          <span>
            {recursos.length} recurso{recursos.length > 1 ? "s" : ""} asociado
          </span>
        ) : (
          <span>Sin recursos registrados</span>
        )}
      </div>

      {/* 🔗 Botón de perfil */}
      <div className="flex justify-end">
        <Link
          to={`/autores/${autor.idautor}`}
          className="inline-flex items-center gap-1 border border-[#8a6b12] text-[#8a6b12] text-xs px-3 py-1.5 rounded-md hover:bg-[#8a6b12] hover:text-white transition shadow-sm"
        >
          <ExternalLink size={14} /> Ver perfil
        </Link>
      </div>
    </div>
  );
}
