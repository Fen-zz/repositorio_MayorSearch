// src/services/recursoCrudService.ts
import API from "./api";

export interface Archivo {
  id?: number;
  nombre_original: string;
  ruta_archivo: string;
}

export interface Recurso {
  idrecurso: number;               // ahora requerido
  titulo: string;
  descripcion?: string;
  tiporecurso: string;
  idioma: string;
  verificado?: boolean;
  fechapublicacion?: string;
  idarchivo?: number;
  archivo?: Archivo;
  idusuario_creador?: number;     // opcional, lo usamos para control de acceso
}

const recursoCrudService = {
  // ✅ Obtener todos los recursos
  async getAll(): Promise<Recurso[]> {
    const res = await API.get("/recursos/");
    return res.data;
  },

  // ✅ Obtener un recurso por ID
  async getById(id: number): Promise<Recurso> {
    const res = await API.get(`/recursos/${id}`);
    return res.data;
  },

  // ✅ Crear recurso (con archivo PDF)
  async create(recursoData: Partial<Recurso>, file?: File): Promise<Recurso> {
    const formData = new FormData();

    if (file) formData.append("file", file);
    formData.append("titulo", recursoData.titulo || "");
    formData.append("descripcion", recursoData.descripcion || "");
    formData.append("tiporecurso", recursoData.tiporecurso || "");
    formData.append("idioma", recursoData.idioma || "");
    formData.append("verificado", String(recursoData.verificado ?? false));

    const res = await API.post("/recursos/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ Actualizar recurso (puede cambiar el archivo o no)
  async update(id: number, recursoData: Partial<Recurso>, file?: File): Promise<Recurso> {
    const formData = new FormData();

    if (file) formData.append("file", file);
    formData.append("titulo", recursoData.titulo || "");
    formData.append("descripcion", recursoData.descripcion || "");
    formData.append("tiporecurso", recursoData.tiporecurso || "");
    formData.append("idioma", recursoData.idioma || "");
    formData.append("verificado", String(recursoData.verificado ?? false));

    const res = await API.put(`/recursos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ Eliminar recurso
  async delete(id: number): Promise<void> {
    await API.delete(`/recursos/${id}`);
  },
};

export default recursoCrudService;
