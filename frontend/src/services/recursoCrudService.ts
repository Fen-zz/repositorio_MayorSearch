// src/services/recursoCrudService.ts
import API from "./api";

export interface Archivo {
  id?: number;
  nombre_original: string;
  ruta_archivo: string;
}

// 🧠 Actualizamos el tipo Recurso para incluir los campos que vienen de /recursos/buscar
export interface Recurso {
  idrecurso: number;
  titulo: string;
  descripcion?: string;
  tiporecurso: string;
  idioma: string;
  verificado?: boolean;
  fechapublicacion?: string;
  idarchivo?: number;
  archivo?: Archivo;
  idusuario_creador?: number;

  // 👇 Nuevos campos agregados por el endpoint /recursos/buscar
  autores?: string;
  temas?: string;
  etiquetas?: string;
  ubicacion?: string;
}

const recursoCrudService = {
  // ✅ Obtener todos los recursos (ahora desde /recursos/buscar)
  async getAll(): Promise<Recurso[]> {
    const res = await API.get("/recursos/recursos/buscar");
    // El endpoint /recursos/buscar devuelve algo tipo { resultados: [...] }
    return res.data.resultados || res.data || [];
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
    formData.append("fechapublicacion", recursoData.fechapublicacion || "");
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
    formData.append("fechapublicacion", recursoData.fechapublicacion || "");
    formData.append("idioma", recursoData.idioma || "");
    formData.append("verificado", recursoData.verificado ? "true" : "false");

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
