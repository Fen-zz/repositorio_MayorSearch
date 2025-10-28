// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMensaje("Token no válido o faltante.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setMensaje("Las contraseñas no coinciden.");
    return;
  }

  setLoading(true);
  setMensaje("");

  try {
    const response = await fetch("http://localhost:8000/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        nueva_contrasena: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMensaje(data.mensaje || "Contraseña actualizada correctamente.");
    } else {
      setMensaje(data.detail || "Error al restablecer la contraseña.");
    }
  } catch (error) {
    console.error(error);
    setMensaje("Error al restablecer la contraseña.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1a2b] text-white">
      <Link to="/">
         <div className="flex flex-col items-center mb-8">
        <img
          src="/images/LogoMayorSearch2.png"
          alt="Logo MayorSearch"
          className="w-70 object-contain cursor-pointer"
        />
      </div>     
      </Link>
      

      <div className="bg-[#162840] rounded-2xl p-10 w-[400px] text-center shadow-lg">
        <h2 className="text-xl font-semibold mb-8">
          Restablece tu <span className="font-bold">contraseña</span>
        </h2>

        {token ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg bg-[#0f1a2b] border border-[#2a3f5f] text-sm focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg bg-[#0f1a2b] border border-[#2a3f5f] text-sm focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007bff] hover:bg-[#006ae6] text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Restablecer contraseña"}
            </button>
          </form>
        ) : (
          <p className="text-red-400">Token no válido o expirado.</p>
        )}

        {mensaje && <p className="mt-4 text-sm text-green-400">{mensaje}</p>}
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        Proyecto de grado – Ingeniería Informática © 2025 Todos los derechos
        reservados
      </footer>
    </div>
  );
};

export default ResetPassword;
