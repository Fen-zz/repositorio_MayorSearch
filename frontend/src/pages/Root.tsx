// src/pages/Root.tsx
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone} from "lucide-react";
//import { useAuth } from "../hooks/useAuth";
// import { Navigate } from "react-router-dom";
import UserMenu from "../components/UserMenu";

export default function HomeRoot() {
  
  //const { user, isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen w-full bg-white text-blue-50">
      {/* Header */}
      <header className="w-full bg-white text-blue-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-18 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/images/LogoMayorSearch.png"
                alt="Logo MayorSearch"
                className="w-40 object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* Nav links unificados */}
          <nav className="hidden md:flex items-center gap-10 text-sm">
            <Link to="/" className="font-semibold text-blue-800 hover:text-blue-900 transition-colors">
              INICIO
            </Link>

            <Link to="/explorar" className="text-blue-700/80 hover:text-blue-800 transition-colors">
              EXPLORAR
            </Link>

            <Link to="/autores" className="text-blue-700/80 hover:text-blue-800 transition-colors">
              AUTORES
            </Link>

            {/* ASIGNATURAS (click para desplegar) */}
            <details className="relative">
              <summary className="flex items-center gap-1 text-blue-700/80 cursor-pointer hover:text-blue-800 transition-colors list-none">
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
              className="text-blue-700/80 hover:text-blue-800 transition-colors"
            >
              BUSCAR
            </Link>

            <a className="text-blue-700/80 hover:text-blue-800 transition-colors" href="#contacto">
              CONTÁCTANOS
            </a>

            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative overflow-hidden">
        <div
          className="w-full 
               bg-linear-to-b from-[#072a52]/90 via-[#0a3a66]/90 to-[#04213d]/90
               bg-[url('/images/FondoRoot.png')] bg-no-repeat bg-cover bg-center bg-blend-overlay"
        >
          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
              {/* Left: contenido */}
              <div className="lg:col-span-7">
                <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">
                  ¡Bienvenido a
                  <span className="block mt-2">
                    <span className="text-yellow-400">Mayor</span>
                    <span className="text-blue-300/90 ml-2">Search!</span>
                  </span>
                </h1>

                <p className="mt-6 text-blue-100/90 text-3xl max-w-xl">
                  El conocimiento en orden y a la orden.
                </p>
                
                <Link to="/Home">
                <div className="mt-10">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center relative bg-blue-900 hover:bg-blue-600 px-8 py-3 rounded-full shadow-2xl
                               ring-2 ring-blue-800/30 transition-all duration-200"
                    aria-label="Inicia ahora"
                  >
                    <span className="text-yellow-300 font-bold tracking-wider text-lg">
                      INICIA AHORA
                    </span>
                  </a>
                </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* === ACERCA DE NOSOTROS === */}
      <section
        id="acerca"
        className="bg-white text-blue-900 py-20 border-t border-blue-100"
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <h2 className="text-4xl font-extrabold mb-6 text-blue-950">
              Acerca de MayorSearch
            </h2>
            <p className="text-lg leading-relaxed text-blue-800/90">
              Este repositorio reúne y organiza recursos académicos relacionados
              con <strong>Teoría de Grafos</strong> y{" "}
              <strong>Análisis Numérico</strong>, con el propósito de facilitar
              el acceso a materiales de estudio, proyectos y referencias útiles
              para estudiantes y docentes. Nuestro objetivo es ofrecer un
              espacio estructurado y confiable donde el conocimiento pueda
              compartirse, fortaleciendo el aprendizaje y la colaboración en
              estas áreas.
            </p>
          </div>

          {/* Imagen */}
          <div className="flex justify-center">
            <img
              src="/images/bicentenario.png"
              alt="Acerca de nosotros"
              className="w-full max-w-lg rounded-2xl shadow-lg border border-blue-100"
            />
          </div>
        </div>
      </section>

      {/* === CONTÁCTANOS === */}
      <section id="contacto" className="bg-gray-50 text-blue-900">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Contáctanos</h2>
          <p className="text-lg text-blue-800/90 max-w-2xl mx-auto">
            Ponte en contacto para resolver tus dudas, compartir sugerencias o
            colaborar con nuevos recursos académicos.
          </p>
        </div>

        {/* Mapa */}
        <div className="w-full h-[400px] mb-10">
    <iframe
      title="Mapa Colegio Mayor del Cauca"
      src="https://www.google.com/maps?q=2.444039058381452,-76.60595634673528&z=16&output=embed"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    ></iframe>
  </div>

        {/* Formulario */}
        <div className="max-w-4xl mx-auto px-6 py-14">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Nombre de usuario"
                className="w-full border border-blue-800 rounded-lg px-4 py-3 text-blue-900 placeholder-blue-700/60 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Dirección de correo"
                className="w-full border border-blue-800 rounded-lg px-4 py-3 text-blue-900 placeholder-blue-700/60 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Asunto"
              className="w-full border border-blue-800 rounded-lg px-4 py-3 text-blue-900 placeholder-blue-700/60 focus:outline-none"
            />
            <textarea
              placeholder="Mensaje..."
              className="w-full border border-blue-800 rounded-lg px-4 py-3 h-48 text-blue-900 placeholder-blue-700/60 resize-none focus:outline-none"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-700 text-white font-bold px-10 py-2 rounded-full"
              >
                ENVIAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* === FOOTER === */}
<footer className="bg-[#041423] text-gray-300 pt-12 pb-4 border-t border-blue-900/50 text-base">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
    {/* Columna 1 - Logo e info */}
    <div>
      <img
        src="/images/LogoMayorSearch2.png"
        alt="Logo MayorSearch"
        className="w-48 mb-4"
      />
      <div className="border-t border-gray-600/40 my-3 w-3/4" />
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <MapPin size={18} className="text-blue-400" />
          <span>Cl. 3 #6-42, Centro</span>
        </li>
        <li className="flex items-center gap-2">
          <Phone size={18} className="text-blue-400" />
          <span>111-22-333-44</span>
        </li>
        <li className="flex items-center gap-2">
          <Mail size={18} className="text-blue-400" />
          <span>correo@email.com</span>
        </li>
      </ul>

      {/* Redes sociales */}
      <div className="border-t border-gray-600/40 my-4 w-3/4" />
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="bg-blue-950 hover:bg-blue-800 text-white p-2 rounded-full transition"
          aria-label="Facebook"
        >
          <Facebook size={20} />
        </a>
        <a
          href="#"
          className="bg-blue-950 hover:bg-blue-800 text-white p-2 rounded-full transition"
          aria-label="Instagram"
        >
          <Instagram size={20} />
        </a>
      </div>
    </div>

    {/* Columna 2 - Enlaces */}
    <div>
      <h3 className="text-xl font-semibold mb-3 text-white">Enlaces</h3>
      <div className="border-t border-gray-600/40 mb-3 w-3/4" />
      <ul className="space-y-2">
        <li>
          <Link to="/" className="hover:text-yellow-400 transition">
            Inicio
          </Link>
        </li>
        <li>
          <Link to="/explorar" className="hover:text-yellow-400 transition">
            Explorar
          </Link>
        </li>
        
        <li>
          <a href="#contacto" className="hover:text-yellow-400 transition">
            Contáctanos
          </a>
        </li>
        <li>
          <Link to="/register" className="hover:text-yellow-400 transition">
            Registrarse
          </Link>
        </li>
        <li>
          <Link to="/login" className="hover:text-yellow-400 transition">
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </div>

    {/* Columna 3 - Contenidos */}
    <div>
      <h3 className="text-xl font-semibold mb-3 text-white">Contenidos</h3>
      <div className="border-t border-gray-600/40 mb-3 w-3/4" />
      <ul className="space-y-2">
        <li>
          <Link to="/Home" className="hover:text-yellow-400 transition">
            Buscar
          </Link>
        </li>
        <li>
          <Link to="/teoriadegrafos" className="hover:text-yellow-400 transition">
            Teoría de grafos
          </Link>
        </li>
        <li>
          <Link to="/analisisnumerico" className="hover:text-yellow-400 transition">
            Análisis numérico
          </Link>
        </li>
        <li>
          <Link to="/autores" className="hover:text-yellow-400 transition">
            Autores
          </Link>
        </li>
      </ul>
    </div>
  </div>

  {/* Línea inferior */}
  <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-400">
    Proyecto de grado – Ingeniería Informática © 2025 Todos los derechos reservados
  </div>
</footer>
    </div>
  );
}
