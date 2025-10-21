import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../services/authService";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse: any) => {
  console.log("Respuesta de Google:", credentialResponse);

  if (!credentialResponse || !credentialResponse.credential) {
    alert("No se recibió el token de Google.");
    return;
  }

  try {
    const id_token = credentialResponse.credential;
    const resp = await googleLogin(id_token);
    localStorage.setItem("access_token", resp.data.access_token);
    alert("Inicio de sesión exitoso ✅");
    window.location.href = "/";
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
