import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ResourceCard from "../components/ResourceCard";
import { getFavoritos } from "../services/recursoService";
import { useAuth } from "../hooks/useAuth";
import axios from "../services/api";

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
  });

  // ----- Debug helpers (no tocar) -----
  const debugLog = (label: string, payload: any) => {
    try {
      console.log(label, payload);
    } catch {}
  };

  // ---------------------------
  // Obtener datos reales desde backend (/usuarios/me)
  // ---------------------------
  useEffect(() => {
    const fetchUsuarioMe = async (tk: string) => {
      try {
        debugLog("[DEBUG] Token usado para /usuarios/me (preview)", tk ? `${tk.slice(0, 10)}...` : null);
        const resp = await axios.get("/usuarios/me", {
          headers: { Authorization: `Bearer ${tk}` },
        });
        const data = resp.data;

        // logs claros y visibles
        debugLog("🟢 RESPUESTA /usuarios/me (resp.data)", data);

        // setear el estado exactamente con lo que viene
        setForm({
          nombreusuario: data?.nombreusuario ?? "",
          telefono: data?.telefono ?? "",
          email: data?.email ?? "",
          codigoestudiantil: data?.codigoestudiantil ?? "",
        });

        // confirmación post-set (React no garantiza que el state ya esté cuando aquí se ejecuta,
        // por eso vamos a esperar microtick para leerlo y loguearlo)
        setTimeout(() => debugLog("🟢 STATE after setForm (form)", { ...form }), 50);
      } catch (err: any) {
        debugLog("[ERROR] No se pudo obtener /usuarios/me (error)", err?.response?.data ?? err?.message ?? err);
        // fallback al contexto (por compatibilidad)
        if (user) {
          if (typeof user === "object") {
            setForm({
              nombreusuario: user.nombreusuario || "",
              telefono: user.telefono || "",
              email: user.email || "",
              codigoestudiantil: user.codigoestudiantil || "",
            });
            debugLog("[FALLBACK] se usó 'user' del contexto", user);
          } else {
            setForm({
              nombreusuario: user,
              telefono: "",
              email: "",
              codigoestudiantil: "",
            });
            debugLog("[FALLBACK] user es string (google)", user);
          }
        }
      }
    };

    const tk = token || localStorage.getItem("access_token") || localStorage.getItem("token");
    if (tk) fetchUsuarioMe(tk);
    else debugLog("[DEBUG] No se encontró token (localStorage/useAuth.token)", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        debugLog("[ERROR] favoritos:", err);
        setFavoritos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      debugLog("[DEBUG] Enviando PUT /usuarios/me payload:", payload);
      await axios.put("/usuarios/me", payload, {
        headers: { Authorization: `Bearer ${tk}` },
      });

      // re-fetch
      const resp = await axios.get("/usuarios/me", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      const data = resp.data;
      setForm({
        nombreusuario: data?.nombreusuario ?? "",
        telefono: data?.telefono ?? "",
        email: data?.email ?? "",
        codigoestudiantil: data?.codigoestudiantil ?? "",
      });

      alert("✅ Datos actualizados correctamente");
      setEditando(false);
    } catch (err: any) {
      debugLog("[ERROR] PUT /usuarios/me failed:", err?.response?.data ?? err?.message ?? err);
      const message = err?.response?.data?.detail || "No se pudieron actualizar los datos";
      alert("❌ " + message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-[#0a1a3d]">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-start p-8 relative">
        <div className="absolute top-6 right-8">
          <UserMenu />
        </div>

        <div className="w-full max-w-4xl mt-8">
          <h1 className="text-4xl font-bold text-[#0a3d91] mb-6 text-center">
            Perfil de Usuario
          </h1>

          <div className="bg-white shadow-md rounded-2xl p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre de Usuario" name="nombreusuario" value={form.nombreusuario} onChange={handleChange} disabled={!editando} />
              <InputField label="Correo electrónico" name="email" value={form.email} onChange={handleChange} disabled={true} />
              <InputField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} disabled={!editando} />
              <InputField label="Código Estudiantil" name="codigoestudiantil" value={form.codigoestudiantil} onChange={handleChange} disabled={!editando} />
            </div>

            <div className="flex justify-end mt-6">
              {!editando ? (
                <button onClick={() => setEditando(true)} className="bg-[#0a3d91] text-white px-4 py-2 rounded-lg hover:bg-[#082e70] transition">
                  Editar
                </button>
              ) : (
                <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Guardar Cambios
                </button>
              )}
            </div>
          </div>

          {/* --- DEBUG: muestra crudo lo que recibimos y el state --- */}
          <div className="bg-white p-4 rounded-md shadow-sm mb-6">
            <div style={{ fontSize: 13 }}>
              <strong>DEBUG - resp.data (si está):</strong>
              <pre id="debug-resp" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                {/* mostramos form como JSON */}
                {JSON.stringify(form, null, 2)}
              </pre>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0a3d91] mb-4">Mis recursos favoritos</h2>

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

function InputField({ label, name, value, onChange, disabled }: any) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border rounded-lg p-2 mt-1 ${disabled ? "bg-gray-100" : ""}`}
      />
    </div>
  );
}
