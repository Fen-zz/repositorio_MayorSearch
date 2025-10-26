// src/pages/Register.tsx
import { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { registerManual } from "../services/authService"; // Asegúrate de tener esta función creada
import { Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !emailOrPhone || !password || !confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      await registerManual(username, emailOrPhone, password);
      alert("Registro exitoso 🎉 Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Hubo un error al registrarte");
    }
  };

  return (
    <div className="min-h-screen bg-[#081B33] flex flex-col">
      {/* Navbar superior simulada */}
      <nav className="flex items-center justify-between px-16 py-6 text-[#bcd0f7]">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="MayorSearch" className="w-6 h-6" />
          <span className="font-semibold text-white text-lg">MayorSearch</span>
        </div>

        <ul className="flex items-center gap-8 text-sm">
          <li className="hover:text-white cursor-pointer"><Link to="/">INICIO</Link></li>
          <li className="hover:text-white cursor-pointer">RECURSOS ⌄</li>
          <li className="hover:text-white cursor-pointer">AUTORES ⌄</li>
          <li className="hover:text-white cursor-pointer"><Link to="#contacto">CONTÁCTANOS</Link></li>
          <li className="text-white font-semibold cursor-pointer">
            REGISTRARSE
          </li>
          <li className="hover:text-white cursor-pointer"><Link to="/login">INICIAR SESIÓN</Link></li>
        </ul>
      </nav>

      {/* Contenedor del formulario */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#0C2548] p-10 rounded-3xl shadow-2xl w-[400px] text-white">
          <h2 className="text-2xl font-bold text-center whitespace-nowrap mt-8 mb-1">
            Regístrate en{" "}
            <span className="font-bold text-white inline-block">
              MayorSearch
            </span>
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            Accede a todos los recursos
          </p>

          {/* Inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de usuario"
              className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Correo electrónico o número de teléfono"
              className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁️
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                👁️
              </span>
            </div>

            <label className="flex items-center text-sm text-gray-400 mb-4">
              <input type="checkbox" className="mr-2 accent-[#5C8DFF]" />
              Recordar usuario
            </label>

            {/* Botón de registro */}
            <button
              onClick={handleRegister}
              className="w-full bg-[#5C8DFF] hover:bg-[#3b6ce0] text-white font-semibold py-3 rounded-md transition-all"
            >
              Registrarse
            </button>

            {/* Separador */}
            <div className="flex items-center my-6">
              <hr className="grow border-gray-600" />
              <span className="mx-2 text-gray-400 text-sm">
                O regístrate a través de:
              </span>
              <hr className="grow border-gray-600" />
            </div>

            {/* Google Button */}
            <GoogleLoginButton />

            <p className="text-sm text-center mt-6 text-gray-400">
            <Link to="/login"> ¿Ya tienes una cuenta?{" "}</Link>
              <span
                onClick={() => navigate("/login")}
                className="text-[#5C8DFF] hover:underline cursor-pointer"
              >
                Inicia sesión.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
