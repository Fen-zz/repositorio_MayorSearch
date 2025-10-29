// src/services/recursoAutorService.ts
import API from "./api";

export type RecursoAutor = {
  idrecurso: number;
  idautor: number;
  orden?: number;
};

const RecursoAutorService = {
  // Crear relación recurso–autor
  async add(vinculo: RecursoAutor) {
    const res = await API.post("/recurso_autor/", vinculo);
    return res.data;
  },

  // Listar todas las relaciones (solo si es necesario)
  async getAll() {
    const res = await API.get("/recurso_autor/");
    return res.data;
  },

  // Eliminar vínculo por ID único (en tu backend se elimina por {id})
  async delete(idrecurso: number, idautor: number) {
    const res = await API.delete(`/recurso_autor/${idrecurso}/${idautor}`);
    return res.data;
  },
};

export default RecursoAutorService;
