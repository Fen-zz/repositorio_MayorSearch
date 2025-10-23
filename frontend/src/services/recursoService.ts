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

// 🧩🔹 INICIO DE MODIFICACIÓN 🔹
// Esta función se asegura de que si los filtros incluyen asignaturas, tipos o niveles,
// se construya un solo string de etiquetas separadas por comas, sin duplicados ni espacios.
export const normalizarFiltros = (params: any) => {
  const etiquetas = [];

  // Filtros de Asignatura
  if (params.asignatura && Array.isArray(params.asignatura)) {
    etiquetas.push(...params.asignatura.map((e: string) => e.trim()));
  }

  // Filtros de Tipo de Recurso
  if (params.tipoRecurso && Array.isArray(params.tipoRecurso)) {
    etiquetas.push(...params.tipoRecurso.map((e: string) => e.trim()));
  }

  // Filtros de Nivel Académico
  if (params.nivel && Array.isArray(params.nivel)) {
    etiquetas.push(...params.nivel.map((e: string) => e.trim()));
  }

  // Evitar duplicados y crear una cadena CSV
  if (etiquetas.length > 0) {
    params.etiquetas = [...new Set(etiquetas)].join(",");
  }

  return params;
};
// 🧩🔹 FIN DE MODIFICACIÓN 🔹

// Versión final del servicio, que usa la función de arriba
export const buscarRecursos = async (params: BuscarParams | any = {}) => {
  const normalizados = normalizarFiltros(params);
  const resp = await API.get("/recursos/recursos/buscar", { params: normalizados });
  return resp.data; // { total, limit, offset, resultados }
};
