import GoogleLoginButton from "../components/googleLoginButton";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#081B33] flex flex-col">
      {/* Navbar superior simulada */}
      <nav className="flex items-center justify-between px-16 py-6 text-[#bcd0f7]">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="MayorSearch"
            className="w-6 h-6"
          />
          <span className="font-semibold text-white text-lg">
            MayorSearch
          </span>
        </div>

        <ul className="flex items-center gap-8 text-sm">
          <li className="hover:text-white cursor-pointer">INICIO</li>
          <li className="hover:text-white cursor-pointer">RECURSOS ⌄</li>
          <li className="hover:text-white cursor-pointer">AUTORES ⌄</li>
          <li className="hover:text-white cursor-pointer">CONTÁCTANOS</li>
          <li className="hover:text-white cursor-pointer">REGISTRARSE</li>
          <li className="text-white font-semibold cursor-pointer">
            INICIAR SESIÓN
          </li>
        </ul>
      </nav>

      {/* Contenedor del login */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#0C2548] p-10 rounded-3xl shadow-2xl w-[400px] text-white">
          <h2 className="text-2xl font-bold text-center whitespace-nowrap mt-8 mb-1">
            Inicia sesión en <span className="font-bold text-white inline-block">MayorSearch</span>
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            Ingresa a tu cuenta de forma segura
          </p>

          {/* Inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Correo electrónico o número de teléfono"
              className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-3 rounded-md bg-[#102A52] border border-[#1E3A6E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8DFF]"
              />
              <span className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white">
                👁️
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-400 mb-12">
                <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-[#5C8DFF]" />{" "}
                    Recordar usuario
                </label>
                    <a href="#" className="text-[#5C8DFF] hover:underline">
                    ¿Olvidó su contraseña?
                    </a>
            </div>

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
              <a href="#" className="text-[#5C8DFF] hover:underline">
                Regístrate.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
