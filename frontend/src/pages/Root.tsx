//import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function HomeRoot() {
  return (
    <div className="min-h-screen w-full bg-white text-blue-50">
      {/* Header */}
      <header className="w-full bg-white text-blue-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <img
                src="/images/LogoMayorSearch.png"
                alt="Logo MayorSearch"
                className="w-40 object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="font-semibold text-blue-800" href="#">INICIO</a>
            <a className="text-blue-700/80" href="#">RECURSOS ▾</a>
            <a className="text-blue-700/80" href="#">AUTORES ▾</a>
            <div className="relative">
              <input
                aria-label="Buscar"
                className="w-64 h-9 rounded-full border border-blue-200 px-4 text-sm outline-none"
                placeholder="Buscar..."
              />
            </div>
          </nav>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a className="text-blue-700/90" href="#contacto">
              CONTÁCTANOS
            </a>
            <a className="text-blue-700/90" href="#">REGISTRARSE</a>
            <a className="text-blue-700/90" href="#">INICIAR SESIÓN</a>
          </div>
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
              </div>
            </div>
          </div>
        </div>
      </main>

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
        src="/images/LogoMayorSearch.png"
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
          <a href="#" className="hover:text-yellow-400 transition">
            Recursos
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Autores
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Contáctanos
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Registrarse
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Iniciar Sesión
          </a>
        </li>
      </ul>
    </div>

    {/* Columna 3 - Contenidos */}
    <div>
      <h3 className="text-xl font-semibold mb-3 text-white">Contenidos</h3>
      <div className="border-t border-gray-600/40 mb-3 w-3/4" />
      <ul className="space-y-2">
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Búsqueda
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Teoría de grafos
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Análisis numérico
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Autores
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-yellow-400 transition">
            Recursos
          </a>
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
