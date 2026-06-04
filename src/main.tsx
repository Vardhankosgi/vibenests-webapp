import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AppDataProvider } from "@/components/admin/AppDataContext";
import { SuitesProvider } from "@/components/admin/SuitesContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <SuitesProvider>
            <App />
          </SuitesProvider>
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
