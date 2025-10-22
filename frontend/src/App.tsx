// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/Home";
import Root from "./pages/Root"; // Componente que se muestra en "/"
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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

        {/* Ruta del Olvido */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Ruta del Resset */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
