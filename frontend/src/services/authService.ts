import API from "./api";
import axios from "axios";

const API_URL = "http://localhost:8000";

export const googleLogin = (id_token: string) => {
  const formData = new FormData();
  formData.append("id_token_str", id_token); 
  return API.post("/login/google", formData);
};

export const loginManual = (email: string, password: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  // 👇 aquí está el cambio importante
  return axios.post(`${API_URL}/login`, formData);
};

import api from "./api";

// register conexión
// 🧩 Aquí ajustamos los nombres exactamente como el backend espera
export const registerManual = (
  nombreusuario: string,
  email: string,
  password: string
) => {
  return api.post("/usuarios", {
    nombreusuario,
    email,
    password,
    telefono: "",        // opcional
    proveedor: "manual", // para dejarlo documentado
    rol: "normal"        // por defecto
  });
};
