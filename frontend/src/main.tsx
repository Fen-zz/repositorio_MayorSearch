import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth"; // 👈 importa el AuthProvider
import "react-datepicker/dist/react-datepicker.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
      <AuthProvider> {/* 👈 aquí envuelves tu App */}
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
