// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/Home";
import Root from "./pages/Root";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal (login) */}
        <Route path="/login" element={<Login />} />

        {/* Ruta del Home */}
        <Route path="/home" element={<Home />} />

        {/* Ruta raíz temporal (puede redirigir luego al login o home) */}
        <Route path="/" element={<Root />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
