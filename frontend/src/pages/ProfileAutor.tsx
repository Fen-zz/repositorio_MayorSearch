// src/pages/ProfileAutor.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { useAuth } from "../hooks/useAuth";
import AutorService from "../services/autorService";
import { Edit3, UserCircle2 } from "lucide-react";

export default function ProfileAutor() {
  const { id } = useParams(); // 👈 viene desde /autores/:id
  const { user, token } = useAuth();

  const [autor, setAutor] = useState<any>(null);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [editando, setEditando] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombreautor: "",
    orcid: "",
    profileurl: "",
  });

  // ---------------------------
  // Cargar datos del autor
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const dataAutor = await AutorService.getById(Number(id));
        setAutor(dataAutor);
        setForm({
          nombreautor: dataAutor.nombreautor || "",
          orcid: dataAutor.orcid || "",
          profileurl: dataAutor.profileurl || "",
        });

        const dataRecursos = await AutorService.getRecursosByAutor(Number(id));

        // ✅ Ajuste: añadir autores, temas y etiquetas para ResourceCard
        const recursosFormateados = (dataRecursos || []).map((r: any) => ({
          ...r,
          autores: dataAutor?.nombreautor || "",
          temas: r.temas || "",
          etiquetas: r.etiquetas || "",
        }));

        setRecursos(recursosFormateados);
      } catch (err) {
        console.error("[ERROR] No se pudo obtener autor o recursos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ---------------------------
  // Manejar cambios en formulario
  // ---------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------------------
  // Guardar cambios (solo admin)
  // ---------------------------
  const handleGuardar = async () => {
    try {
      const tk =
        token ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (!tk) {
        alert("Token inválido. Inicia sesión nuevamente.");
        return;
      }

      await AutorService.update(Number(id), form);

      // ✅ Refrescar autor con los datos nuevos
      const dataAutorActualizado = await AutorService.getById(Number(id));
      setAutor(dataAutorActualizado);

      alert("Autor actualizado correctamente");
      setEditando(false);
    } catch (err) {
      console.error("[ERROR] PUT /autores/:id", err);
      alert("No se pudieron actualizar los datos del autor");
    }
  };

  // ---------------------------
  // Mostrar solo si el usuario es admin
  // ---------------------------
  const esAdmin =
    typeof user === "object" && user !== null && "rol" in user
      ? (user as any).rol === "admin"
      : false;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      <Sidebar onCollapse={setIsCollapsed} />

      {/* UserMenu fijo arriba a la derecha */}
      <div className="fixed top-6 right-8 z-9999">
        <UserMenu />
      </div>

      {/* Contenido principal */}
      <main
        className={`flex-1 flex flex-col items-center justify-start transition-all duration-500 ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <div className="overflow-y-auto h-[calc(100vh-40px)] w-full flex justify-center scroll-area">
          <div className="w-full max-w-3xl mt-20 transform transition-transform duration-500 ease-in-out scale-110">
            {/* Tarjeta principal */}
            <div className="bg-white shadow-lg rounded-2xl p-8 relative hover:scale-[1.02] transition">
              <div className="flex items-center mb-6">
                {autor?.profileurl ? (
                  <img
                    src={autor.profileurl}
                    alt={autor.nombreautor}
                    className="w-[90px] h-[90px] rounded-full object-cover border border-gray-300 mr-4"
                  />
                ) : (
                  <UserCircle2
                    size={90}
                    className="mr-4 text-[#0f5d38]"
                    strokeWidth={1.5}
                  />
                )}

                <div>
                  <h1 className="text-3xl font-bold text-[#0f5d38]">
                    {autor?.nombreautor || "Autor"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    ORCID: {autor?.orcid || "—"}
                  </p>
                  <p className="text-sm text-gray-600 break-all">
                    Perfil: {autor?.profileurl || "—"}
                  </p>
                </div>

                {/* ✏️ Solo visible si es admin */}
                {esAdmin && (
                  <button
                    onClick={() => setEditando(!editando)}
                    className="absolute top-6 right-6 text-[#0a3d91] hover:text-[#082e70] transition"
                  >
                    <Edit3 size={22} />
                  </button>
                )}
              </div>

              {/* Campos editables (solo admin) */}
              {editando && esAdmin && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Nombre del Autor"
                      name="nombreautor"
                      value={form.nombreautor}
                      onChange={handleChange}
                    />
                    <InputField
                      label="ORCID"
                      name="orcid"
                      value={form.orcid}
                      onChange={handleChange}
                    />
                    <InputField
                      label="URL de perfil"
                      name="profileurl"
                      value={form.profileurl}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleGuardar}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ---- Recursos del autor ---- */}
            <h2 className="text-2xl font-bold text-[#0f5d38] mt-10 mb-4">
              Recursos de este autor
            </h2>

            {loading ? (
              <p className="text-gray-500 text-center animate-pulse">
                Cargando recursos...
              </p>
            ) : recursos.length > 0 ? (
              <div className="space-y-6">
                {recursos.map((r) => (
                  <ResourceCard key={r.idrecurso} r={r} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center">
                Este autor aún no tiene recursos asociados.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-400 outline-none"
      />
    </div>
  );
}
