// src/pages/Login.tsx
import { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../hooks/useAuth";
import { loginManual } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleManualLogin = async () => {
    if (!email || !password) {
      alert("Por favor completa ambos campos.");
      return;
    }

    try {
      const resp = await loginManual(email, password);

      // ✅ Guarda el token en localStorage
      localStorage.setItem("access_token", resp.data.access_token);

      // Mantiene tu flujo actual
     login(resp.data.usuario, resp.data.usuario.rol, resp.data.access_token);

      alert("Inicio de sesión exitoso ✅");
      navigate("/home");
    } catch (error) {
      console.error("Error en login manual:", error);
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-[#081B33] flex flex-col">
      {/* Navbar superior simulada */}
      <nav className="flex items-center justify-between px-16 py-6 text-[#bcd0f7]">
        <div className="flex items-center gap-2">
          <Link to="/">
              <img
                src="/images/LogoMayorSearch2.png"
                alt="Logo MayorSearch"
                className="w-40 object-contain cursor-pointer"
              />
            </Link>
          
        </div>

        <ul className="flex items-center gap-8 text-sm">
          <Link to="/" className="font-semibold hover:text-white transition-colors">
              INICIO
            </Link>

            <Link to="/explorar" className="hover:text-white transition-colors">
              EXPLORAR
            </Link>

            <Link to="/autores" className="hover:text-white transition-colors">
              AUTORES
            </Link>

            {/* ASIGNATURAS (click para desplegar) */}
            <details className="relative">
              <summary className="flex items-center gap-1 hover:text-white transition-colors list-none">
                ASIGNATURAS
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mt-[2px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              {/* Dropdown fijo */}
              <div className="absolute left-0 mt-2 w-56 bg-white border border-blue-100 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-blue-100 text-xs font-semibold text-blue-600 uppercase">
                  Busca recursos por asignatura
                </div>

                <Link
                  to="/teoriadegrafos"
                  className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                >
                  Teoría de grafos
                </Link>

                <Link
                  to="/analisisnumerico"
                  className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                >
                  Análisis numérico
                </Link>
              </div>
            </details>

            <Link
              to="/home"
              className="hover:text-white transition-colors"
            >
              BUSCAR
            </Link>

            <a className="hover:text-white transition-colors" href="/">
              CONTÁCTANOS
            </a>
          <li className="hover:text-white cursor-pointer">
            <Link to="/register">REGISTRARSE</Link>
          </li>
          <li className="text-white font-semibold cursor-pointer">
            INICIAR SESIÓN
          </li>
        </ul>

      </nav>

      {/* Contenedor del login */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#0C2548] p-10 rounded-3xl shadow-2xl w-[400px] text-white">
          <h2 className="text-2xl font-bold text-center whitespace-nowrap mt-8 mb-1">
            Inicia sesión en{" "}
            <span className="font-bold text-white inline-block">MayorSearch</span>
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            Ingresa a tu cuenta de forma segura
          </p>

          {/* Inputs del login manual */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Correo electrónico o número de teléfono"
              className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white">
                👁️
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 accent-[#5C8DFF]" />
                Recordar usuario
              </label>
              <a href="#" className="text-[#5C8DFF] hover:underline">
                <Link to="/forgot-password">¿Olvidó su contraseña?</Link>
              </a>
            </div>

            {/* Botón de login manual */}
            <button
              onClick={handleManualLogin}
              className="w-full bg-[#5C8DFF] hover:bg-[#3b6ce0] text-white font-semibold py-3 rounded-md transition-all"
            >
              Iniciar sesión
            </button>

            {/* Separador visual */}
            <div className="flex items-center my-6">
              <hr className="grow border-gray-600" />
              <span className="mx-2 text-gray-400 text-sm">
                O accede a través de:
              </span>
              <hr className="grow border-gray-600" />
            </div>

            {/* Botón de Google */}
            <GoogleLoginButton />

            <p className="text-sm text-center mt-6 text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-[#5C8DFF] hover:underline"
              >
                Regístrate.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}