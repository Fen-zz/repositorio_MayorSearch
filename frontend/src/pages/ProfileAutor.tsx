import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { useAuth } from "../hooks/useAuth";
import AutorService from "../services/autorService";
import { Edit3, Search, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

export default function ProfileAutor() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [autor, setAutor] = useState<any>(null);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);

  const [editando, setEditando] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombreautor: "",
    orcid: "",
    profileurl: "",
  });

  // ---------------------------
  // Util: ordenar recursos por "titulo" (el correcto)
  // ---------------------------
  const sortResources = (arr: any[], asc: boolean) => {
    return [...arr].sort((a, b) => {
      const ta = (a?.titulo ?? "").toString();
      const tb = (b?.titulo ?? "").toString();
      return asc
        ? ta.localeCompare(tb, "es", { sensitivity: "base" })
        : tb.localeCompare(ta, "es", { sensitivity: "base" });
    });
  };

  // ---------------------------
  // Cargar datos del autor + recursos
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

        // Formateamos para que coincida con lo que usa ResourceCard
        const recursosFormateados = (dataRecursos || []).map((r: any) => ({
          ...r,
          autores: dataAutor?.nombreautor || "",
          temas: r.temas || "",
          etiquetas: r.etiquetas || "",
        }));

        const ordenadosInicial = sortResources(recursosFormateados, ordenAsc);
        setRecursos(ordenadosInicial);
        setFiltered(ordenadosInicial);
      } catch (err) {
        console.error("[ERROR] No se pudo obtener autor o recursos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------------------------
  // Filtrado por nombre del recurso (usando 'titulo')
  // ---------------------------
  useEffect(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) {
      setFiltered(sortResources(recursos, ordenAsc));
    } else {
      const filtrados = recursos.filter((r) =>
        (r?.titulo ?? "").toString().toLowerCase().includes(term)
      );
      setFiltered(sortResources(filtrados, ordenAsc));
    }
  }, [busqueda, recursos, ordenAsc]);

  // ---------------------------
  // Alternar orden A-Z / Z-A
  // ---------------------------
  const toggleOrden = () => {
    const nuevoOrdenAsc = !ordenAsc;
    setOrdenAsc(nuevoOrdenAsc);
    setFiltered((prev) => sortResources(prev, nuevoOrdenAsc));
    setRecursos((prev) => sortResources(prev, nuevoOrdenAsc));
  };

  // ---------------------------
  // Manejar cambios en el formulario
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

      const dataAutorActualizado = await AutorService.getById(Number(id));
      setAutor(dataAutorActualizado);

      alert("Autor actualizado correctamente");
      setEditando(false);
    } catch (err) {
      console.error("[ERROR] PUT /autores/:id", err);
      alert("No se pudieron actualizar los datos del autor");
    }
  };

  const esAdmin =
    typeof user === "object" && user !== null && "rol" in user
      ? (user as any).rol === "admin"
      : false;

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a1a3d] flex overflow-hidden">
      <Sidebar onCollapse={setIsCollapsed} />

      <div className="fixed top-6 right-8 z-9999">
        <UserMenu />
      </div>

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
                <div>
                  <h1 className="text-3xl font-bold text-[#8a6b12]">
                    {autor?.nombreautor || "Autor"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    ORCID: {autor?.orcid || "—"}
                  </p>
                  <p className="text-sm text-gray-600 break-all">
                    Perfil: {autor?.profileurl || "—"}
                  </p>
                </div>

                {esAdmin && (
                  <button
                    onClick={() => setEditando(!editando)}
                    className="absolute top-6 right-6 text-[#8a6b12] hover:text-[#6c540c] transition"
                  >
                    <Edit3 size={22} />
                  </button>
                )}
              </div>

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
                      className="bg-[#8a6b12] text-white px-4 py-2 rounded-lg hover:bg-[#6c540c] transition"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ---- Recursos del autor ---- */}
            <div className="mt-10 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-[#8a6b12]">
                Recursos de este autor
              </h2>

              {/* 🔍 Barra de búsqueda y ordenamiento */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleOrden}
                  className="flex items-center gap-2 text-[#8a6b12] font-semibold border border-[#8a6b12] rounded-md px-3 py-2 hover:bg-[#8a6b12] hover:text-white transition"
                  aria-label="Alternar orden A-Z Z-A"
                >
                  {ordenAsc ? (
                    <>
                      <ArrowUpAZ size={18} /> A-Z
                    </>
                  ) : (
                    <>
                      <ArrowDownAZ size={18} /> Z-A
                    </>
                  )}
                </button>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar recurso..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a6b12] transition w-48"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500 text-center animate-pulse">
                Cargando recursos...
              </p>
            ) : filtered.length > 0 ? (
              <div className="space-y-6">
                {filtered.map((r) => (
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
        className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-[#8a6b12] outline-none"
      />
    </div>
  );
}
