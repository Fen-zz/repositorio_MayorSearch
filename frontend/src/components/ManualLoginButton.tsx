// src/components/ManualLoginButton.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { loginManual } from "../services/authService";

export default function ManualLoginButton() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  console.log("🟦 Botón de login manual presionado");

  if (!email || !password) {
    alert("Por favor completa ambos campos.");
    return;
  }

  try {
    console.log("📡 Enviando petición a loginManual...");
    const resp = await loginManual(email, password);
    console.log("✅ Respuesta login manual:", resp.data);

    // ⚠️ Detectamos el rol correctamente
    const userData = resp.data.usuario;
    const rolDetectado =
      resp.data.rol ||
      userData?.rol ||
      (userData?.email?.includes("admin") ? "admin" : "normal"); // fallback provisional

    login(userData, rolDetectado, resp.data.access_token);

    alert(`Inicio de sesión exitoso ✅ (Rol: ${rolDetectado})`);
    console.log("📦 Datos completos recibidos:", resp.data);
  } catch (error) {
    console.error("💥 Error en login manual:", error);
  }
};

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Correo electrónico"
        className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-[#5C8DFF] hover:bg-[#3b6ce0] text-white font-semibold py-3 rounded-md transition-all"
      >
        Iniciar sesión
      </button>
    </div>
  );
}
