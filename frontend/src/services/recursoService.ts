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
  etiquetas?: string;    // añadí por si mandas etiquetas
  fecha?: string;        // recientes/ultimo_mes/ultimo_anio
  limit?: number;
  offset?: number;
};

export const buscarRecursos = async (params: BuscarParams = {}) => {
  // <- ruta CORRECTA según tu router prefix + path actual en backend
  const resp = await API.get("/recursos/recursos/buscar", { params });
  return resp.data; // { total, limit, offset, resultados }
};
