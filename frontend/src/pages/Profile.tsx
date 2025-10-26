import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { getFavoritos } from "../services/recursoService";
import { useAuth } from "../hooks/useAuth";
import axios from "../services/api";
import { Edit3, UserCircle2 } from "lucide-react"; // <- íconos

export default function Profile() {
  const { user, token } = useAuth();
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  const [form, setForm] = useState({
    nombreusuario: "",
    telefono: "",
    email: "",
    codigoestudiantil: "",
    rol: "normal",
  });

  // ---------------------------
  // Obtener datos reales desde backend (/usuarios/me)
  // ---------------------------
  useEffect(() => {
    const fetchUsuarioMe = async (tk: string) => {
      try {
        const resp = await axios.get("/usuarios/me", {
          headers: { Authorization: `Bearer ${tk}` },
        });
        const data = resp.data;
        setForm({
          nombreusuario: data?.nombreusuario ?? "",
          telefono: data?.telefono ?? "",
          email: data?.email ?? "",
          codigoestudiantil: data?.codigoestudiantil ?? "",
          rol: data?.rol ?? "normal",
        });
      } catch (err: any) {
        console.error("[ERROR] No se pudo obtener /usuarios/me", err);
      }
    };

    const tk = token || localStorage.getItem("access_token") || localStorage.getItem("token");
    if (tk) fetchUsuarioMe(tk);
  }, [token, user]);

  // ---------------------------
  // Cargar favoritos
  // ---------------------------
  useEffect(() => {
    const tk = token || localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!tk) {
      setLoading(false);
      setFavoritos([]);
      return;
    }

    const fetchFavoritos = async () => {
      try {
        const data = await getFavoritos(tk);
        setFavoritos(data || []);
      } catch (err) {
        console.error("[ERROR] favoritos:", err);
        setFavoritos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritos();
  }, [token]);

  // ---------------------------
  // Manejar cambios en formulario
  // ---------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------------------
  // Guardar perfil (igual que antes)
  // ---------------------------
  const handleGuardar = async () => {
    try {
      const tk = token || localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!tk) {
        alert("⚠️ No hay token válido. Inicia sesión nuevamente.");
        return;
      }

      const payload: Record<string, any> = {};
      if (form.nombreusuario) payload.nombreusuario = form.nombreusuario;
      if (form.telefono !== undefined) payload.telefono = form.telefono;
      if (form.codigoestudiantil !== undefined) payload.codigoestudiantil = form.codigoestudiantil;

      await axios.put("/usuarios/me", payload, {
        headers: { Authorization: `Bearer ${tk}` },
      });

      alert("✅ Datos actualizados correctamente");
      setEditando(false);
    } catch (err: any) {
      console.error("[ERROR] PUT /usuarios/me failed:", err);
      alert("❌ No se pudieron actualizar los datos");
    }
  };

  // ---------------------------
  // 🎨 Colores dinámicos según rol
  // ---------------------------
  const getColorByRol = (rol: string) => {
    switch (rol?.toLowerCase()) {
      case "docente":
        return { color: "text-purple-700", bg: "bg-purple-100", accent: "#7e22ce" };
      case "admin":
        return { color: "text-orange-700", bg: "bg-orange-100", accent: "#ea580c" };
      default:
        return { color: "text-blue-700", bg: "bg-blue-100", accent: "#1e40af" };
    }
  };

  const rolColor = getColorByRol(form.rol);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-[#0a1a3d]">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-start p-8 relative">
        <div className="absolute top-6 right-8">
          <UserMenu />
        </div>

        <div className="w-full max-w-3xl mt-8">
          <div className="bg-white shadow-lg rounded-2xl p-8 relative">
            {/* Ícono de usuario */}
            <div className="flex items-center mb-6">
              <UserCircle2
                size={90}
                className={`mr-4 ${rolColor.color}`}
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-3xl font-bold">{form.nombreusuario || "Usuario"}</h1>
                <p className="text-sm text-gray-600">Correo: {form.email}</p>
                <p className="text-sm text-gray-600">Teléfono: {form.telefono || "—"}</p>
                <p className="text-sm text-gray-600">Código estudiantil: {form.codigoestudiantil || "—"}</p>
                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${rolColor.bg} ${rolColor.color}`}>
                  Rol: {form.rol?.charAt(0).toUpperCase() + form.rol?.slice(1)}
                </div>
              </div>
              {/* Botón de edición */}
              <button
                onClick={() => setEditando(!editando)}
                className="absolute top-6 right-6 text-[#0a3d91] hover:text-[#082e70] transition"
              >
                <Edit3 size={22} />
              </button>
            </div>

            {/* Campos editables */}
            {editando && (
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nombre de Usuario" name="nombreusuario" value={form.nombreusuario} onChange={handleChange} />
                  <InputField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
                  <InputField label="Código Estudiantil" name="codigoestudiantil" value={form.codigoestudiantil} onChange={handleChange} />
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

          {/* ---- Favoritos ---- */}
          <h2 className="text-2xl font-bold text-[#0a3d91] mt-10 mb-4">Mis recursos favoritos</h2>
          {loading ? (
            <p className="text-gray-500 text-center animate-pulse">🔄 Cargando favoritos...</p>
          ) : favoritos.length > 0 ? (
            <div className="space-y-6">{favoritos.map((r) => (<ResourceCard key={r.idrecurso} r={r} />))}</div>
          ) : (
            <p className="text-gray-400 italic text-center">Aún no tienes recursos favoritos. ¡Ve y marca alguno con el 🔖!</p>
          )}
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
        className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
}
