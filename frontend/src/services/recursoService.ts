// src/services/recursoService.ts
import API from "./api";

export type BuscarParams = {
  q?: string;
  tiporecurso?: string;
  idioma?: string;
  verificado?: boolean;
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string;    // YYYY-MM-DD
  ubicacion?: string;
  limit?: number;
  offset?: number;
};

export const buscarRecursos = async (params: BuscarParams = {}) => {
  const resp = await API.get("/recursos/buscar", { params });
  return resp.data; // { total, limit, offset, resultados }
};
