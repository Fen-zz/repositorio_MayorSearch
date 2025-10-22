// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/Home";
import Root from "./pages/Root"; // Componente que se muestra en "/"
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta principal para usuarios logueados */}
        <Route path="/home" element={<Home />} />

        {/* Ruta raíz, accesible para todos */}
        <Route path="/" element={<Root />} />

        {/* Ruta del Registro */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
