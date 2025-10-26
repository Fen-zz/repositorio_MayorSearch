// src/services/favoritosService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 🧠 Helper para obtener el token actual del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================
// 📥 Obtener todos los favoritos del usuario autenticado
// ============================================================
export const getFavoritos = async () => {
  const response = await axios.get(`${API_URL}/favoritos/`, getAuthHeaders());
  return response.data;
};

// ============================================================
// ✅ Agregar un recurso a favoritos
// ============================================================
export const addFavorito = async (idrecurso: number) => {
  const response = await axios.post(
    `${API_URL}/favoritos/`,
    { idrecurso },
    getAuthHeaders()
  );
  return response.data;
};

// ============================================================
// ❌ Eliminar un recurso de favoritos
// ============================================================
export const removeFavorito = async (idrecurso: number) => {
  const response = await axios.delete(
    `${API_URL}/favoritos/${idrecurso}`,
    getAuthHeaders()
  );
  return response.data;
};

// ============================================================
// 🔍 Verificar si un recurso está marcado como favorito
// ============================================================
export const checkFavorito = async (idrecurso: number) => {
  const response = await axios.get(
    `${API_URL}/favoritos/check/${idrecurso}`,
    getAuthHeaders()
  );
  return response.data.favorito; // devuelve true o false
};
