import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>🏠 Bienvenido a MayorSearch</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
