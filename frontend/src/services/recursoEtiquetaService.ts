// src/services/recursoEtiquetaService.ts
import API from "./api";

export type RecursoEtiqueta = {
  idrecurso: number;
  idetiqueta: number;
};

const RecursoEtiquetaService = {
  // Crear vínculo recurso–etiqueta
  async add(vinculo: RecursoEtiqueta) {
    const res = await API.post("/recurso_etiqueta/", vinculo);
    return res.data;
  },

  // Listar todos los vínculos
  async getAll() {
    const res = await API.get("/recurso_etiqueta/");
    return res.data;
  },

  // Eliminar vínculo recurso–etiqueta (usa body)
  async delete(vinculo: RecursoEtiqueta) {
    const res = await API.delete("/recurso_etiqueta/", { data: vinculo });
    return res.data;
  },
};

export default RecursoEtiquetaService;
