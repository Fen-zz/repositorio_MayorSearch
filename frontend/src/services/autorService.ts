// src/services/autorService.ts
import API from "./api";

// Coincide con tu modelo y esquema del backend (models.autor + schemas.autor)
export type Autor = {
  idautor: number;
  nombreautor: string;     // ← coincide con el backend
  profileurl?: string;     // ← coincide con backend
  orcid?: string;
  // Si luego agregas foto, se puede incluir aquí
};

export type RecursoAutor = {
  idrecurso: number;
  idautor: number;
  orden?: number;
  recurso?: {
    idrecurso: number;
    titulo: string;
    descripcion?: string;
    fecha_subida?: string;
    tipo?: string;
    idioma?: string;
    verificado?: boolean;
  };
};

const AutorService = {
  // 🧭 Obtener todos los autores
  async getAll(): Promise<Autor[]> {
    const response = await API.get("/autores");
    return response.data;
  },

  // 🔍 Obtener un autor por ID
  async getById(idautor: number): Promise<Autor> {
    const response = await API.get(`/autores/${idautor}`);
    return response.data;
  },

  // 📚 Obtener recursos asociados a un autor
  async getRecursosByAutor(idautor: number): Promise<RecursoAutor[]> {
    // Asegúrate de tener esta ruta en tu backend: /autores/{idautor}/recursos
    const response = await API.get(`/autores/${idautor}/recursos`);
    return response.data;
  },

  // 🌟 Obtener un autor con sus recursos (2 llamadas en una función)
  async getAutorConRecursos(idautor: number): Promise<{
    autor: Autor;
    recursos: RecursoAutor[];
  }> {
    const [autorResponse, recursosResponse] = await Promise.all([
      API.get(`/autores/${idautor}`),
      API.get(`/autores/${idautor}/recursos`),
    ]);

    return {
      autor: autorResponse.data,
      recursos: recursosResponse.data,
    };
  },

  // ✏️ Crear un nuevo autor (solo admin)
  async create(data: Omit<Autor, "idautor">): Promise<Autor> {
    const response = await API.post("/autores", data);
    return response.data;
  },

  // 🧩 Actualizar un autor (solo admin)
  async update(idautor: number, data: Partial<Autor>): Promise<Autor> {
    const response = await API.put(`/autores/${idautor}`, data);
    return response.data;
  },

  // 🗑️ Eliminar un autor (solo admin)
  async delete(idautor: number): Promise<void> {
    await API.delete(`/autores/${idautor}`);
  },
};

export default AutorService;
