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
// Se asegura de crear las etiquetas sin borrar otros campos (como las fechas)
export const normalizarFiltros = (params: any) => {
  const etiquetas: string[] = [];

  // Copiamos el objeto para no alterar el original
  const normalizados = { ...params };

  // Filtros de Asignatura
  if (normalizados.asignatura && Array.isArray(normalizados.asignatura)) {
    etiquetas.push(...normalizados.asignatura.map((e: string) => e.trim()));
  }

  // Filtros de Tipo de Recurso
  if (normalizados.tipoRecurso && Array.isArray(normalizados.tipoRecurso)) {
    etiquetas.push(...normalizados.tipoRecurso.map((e: string) => e.trim()));
  }

  // Filtros de Nivel Académico
  if (normalizados.nivel && Array.isArray(normalizados.nivel)) {
    etiquetas.push(...normalizados.nivel.map((e: string) => e.trim()));
  }

  // Evitar duplicados y crear una cadena CSV
  if (etiquetas.length > 0) {
    normalizados.etiquetas = [...new Set(etiquetas)].join(",");
  }

  // 👇 MUY IMPORTANTE: preservar las fechas si existen
  if (params.fecha_inicio) normalizados.fecha_inicio = params.fecha_inicio;
  if (params.fecha_fin) normalizados.fecha_fin = params.fecha_fin;

  return normalizados;
};
// 🧩🔹 FIN DE MODIFICACIÓN 🔹


// ✅ Servicio de búsqueda con logs detallados
export const buscarRecursos = async (params: BuscarParams | any = {}) => {
  console.log("🧩 Antes de normalizar:", params);
  const normalizados = normalizarFiltros(params);
  console.log("🧩 Después de normalizar:", normalizados);

  // 🧹 Limpiar espacios en fechas si existen
  if (normalizados.fecha_inicio) normalizados.fecha_inicio = normalizados.fecha_inicio.trim();
  if (normalizados.fecha_fin) normalizados.fecha_fin = normalizados.fecha_fin.trim();

  // 🕵️‍♂️ Log para confirmar qué se manda al backend
  console.log("📤 Enviando params al backend:", normalizados);

  // Petición al backend
  const resp = await API.get("/recursos/recursos/buscar", { params: normalizados });

  return resp.data; // { total, limit, offset, resultados }
};

// ================================
// 🧩 FAVORITOS (frontend <-> backend)
// ================================

/**
 * Obtener los favoritos del usuario autenticado
 */
export const getFavoritos = async (token: string) => {
  const resp = await API.get("/favoritos/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data; // lista de favoritos
};

/**
 * Agregar un recurso a favoritos
 */
export const addFavorito = async (token: string, idrecurso: number) => {
  const resp = await API.post(
    "/favoritos/",
    { idrecurso },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return resp.data;
};

/**
 * Eliminar un recurso de favoritos
 */
export const removeFavorito = async (token: string, idrecurso: number) => {
  const resp = await API.delete(`/favoritos/${idrecurso}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data;
};
