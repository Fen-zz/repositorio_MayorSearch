// src/services/recursoTemaService.ts
import API from "./api";

export type RecursoTema = {
  idrecurso: number;
  idtema: number;
};

const RecursoTemaService = {
  // Crear vínculo recurso–tema
  async add(vinculo: RecursoTema) {
    const res = await API.post("/recurso_tema/", vinculo);
    return res.data;
  },

  // Listar todos los vínculos
  async getAll() {
    const res = await API.get("/recurso_tema/");
    return res.data;
  },

  //  Eliminar vínculo recurso–tema (usa query params)
  async delete(vinculo: RecursoTema) {
    const res = await API.delete("/recurso_tema/", {
      params: {
        idrecurso: vinculo.idrecurso,
        idtema: vinculo.idtema,
      },
    });
    return res.data;
  },
};

export default RecursoTemaService;
