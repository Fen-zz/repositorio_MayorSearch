// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import { Link } from 'react-router-dom';
const ForgotPassword: React.FC = () => {
  const [input, setInput] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const response = await fetch(
        `http://localhost:8000/forgot-password?email=${encodeURIComponent(input)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      setMensaje(data.mensaje || "Revisa tu correo si la cuenta existe.");
    } catch (error) {
      console.error(error);
      setMensaje("Hubo un error al intentar enviar el enlace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1a2b] text-white">
      {/* Logo */}
      <Link to="/">
         <div className="flex flex-col items-center mb-8">
        <img
          src="/images/LogoMayorSearch2.png"
          alt="Logo MayorSearch"
          className="w-70 object-contain cursor-pointer"
        />
      </div>     
      </Link>

      {/* Card principal */}
      <div className="bg-[#162840] rounded-2xl p-10 w-[400px] text-center shadow-lg">
        <h2 className="text-xl font-semibold mb-2">
          ¿Olvidaste tu <span className="font-bold">contraseña</span>?
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Ingresa tu correo asociado con la cuenta
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            className="w-full px-4 py-3 mb-5 rounded-lg bg-[#0f1a2b] border border-[#2a3f5f] text-sm focus:outline-none focus:ring-2 focus:ring-[#007bff]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007bff] hover:bg-[#006ae6] text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        {mensaje && <p className="mt-4 text-sm text-green-400">{mensaje}</p>}
      </div>

      {/* Footer */}
      <footer className="mt-10 text-gray-500 text-sm">
        Proyecto de grado – Ingeniería Informática © 2025 Todos los derechos
        reservados
      </footer>
    </div>
  );
};

export default ForgotPassword;
