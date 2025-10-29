import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import recursoCrudService from "../services/recursoCrudService";
import type { Recurso } from "../services/recursoCrudService";
import { useAuth } from "../hooks/useAuth";
import { Save, FileUp, ArrowLeft } from "lucide-react";

export default function RecursoForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Si existe, estamos editando
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Recurso>>({
    titulo: "",
    descripcion: "",
    tiporecurso: "",
    idioma: "",
    verificado: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Cargar recurso existente si estamos editando
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await recursoCrudService.getById(Number(id));
          setFormData(data);
          setPreviewFile(data.archivo?.ruta_archivo || null);
        } catch (error) {
          alert("Error al cargar el recurso 😵");
        }
      })();
    }
  }, [id]);

  // ✅ Manejar cambios en campos (corregido para checkbox)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    const fieldValue =
      type === "checkbox" ? (target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  // ✅ Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewFile(URL.createObjectURL(selectedFile));
    }
  };

  // ✅ Guardar (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.tiporecurso || !formData.idioma) {
      alert("Por favor completa todos los campos obligatorios 🙏");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await recursoCrudService.update(Number(id), formData, file || undefined);
        alert("Recurso actualizado correctamente ✨");
      } else {
        await recursoCrudService.create(formData, file || undefined);
        alert("Recurso creado con éxito 🎉");
      }
      navigate("/admin/recursos");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el recurso 😭");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {id ? "✏️ Editar Recurso" : "🆕 Nuevo Recurso"}
          </h1>

          <button
            onClick={() => navigate("/admin/recursos")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block font-semibold mb-1">Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Título del recurso"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-semibold mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Describe brevemente el contenido..."
            />
          </div>

          {/* Tipo de recurso */}
          <div>
            <label className="block font-semibold mb-1">Tipo de recurso *</label>
            <select
              name="tiporecurso"
              value={formData.tiporecurso || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Seleccionar tipo...</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="documento">Documento</option>
              <option value="presentacion">Presentación</option>
            </select>
          </div>

          {/* Idioma */}
          <div>
            <label className="block font-semibold mb-1">Idioma *</label>
            <select
              name="idioma"
              value={formData.idioma || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Seleccionar idioma...</option>
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
              <option value="Francés">Francés</option>
            </select>
          </div>

          {/* Verificado (solo admin o docente, con tipo seguro) */}
          {typeof user === "object" &&
            (user?.rol === "admin" || user?.rol === "docente") && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="verificado"
                  checked={!!formData.verificado}
                  onChange={handleChange}
                />
                <label className="font-semibold">Recurso verificado</label>
              </div>
            )}

          {/* Subida de archivo */}
          <div>
            <label className="block font-semibold mb-1">Archivo PDF</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 border rounded-lg cursor-pointer"
              />
              <FileUp className="text-blue-600 w-6 h-6" />
            </div>

            {previewFile && (
              <div className="mt-3 border rounded-lg overflow-hidden">
                <iframe
                  src={previewFile}
                  className="w-full h-64"
                  title="Vista previa del archivo"
                ></iframe>
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Guardando..." : id ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
