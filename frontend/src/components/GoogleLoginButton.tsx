// src/components/GoogleLoginButton.tsx
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    console.log("Respuesta de Google:", credentialResponse);

    if (!credentialResponse || !credentialResponse.credential) {
      alert("No se recibió el token de Google.");
      return;
    }

    try {
      const id_token = credentialResponse.credential;
      const resp = await googleLogin(id_token);

      console.log("Respuesta del backend:", resp.data);
      // Usa el contexto para guardar sesión
      login(
        resp.data.usuario,     // user
        resp.data.rol,         // rol
        resp.data.access_token // token
      );

      console.log("Usuario guardado en contexto:", resp.data.usuario);
      console.log("Rol guardado en contexto:", resp.data.rol);

      alert("Inicio de sesión exitoso ✅");
      navigate("/Home");
    } catch (error) {
      console.error("Error en el login con Google:", error);
      alert("Error al iniciar sesión con Google 😩");
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Error al autenticar con Google")}
      />
    </div>
  );
}
