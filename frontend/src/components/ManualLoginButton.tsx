import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { loginManual } from "../services/authService";

export default function ManualLoginButton() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor completa ambos campos.");
      return;
    }

    try {
      const resp = await loginManual(email, password);
      login(resp.data.usuario, resp.data.rol, resp.data.access_token);
      alert("Inicio de sesión exitoso ✅");
      window.location.href = "/";
    } catch (error) {
      console.error("Error en login manual:", error);
      alert("Credenciales inválidas 😩");
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
