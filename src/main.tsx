import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registrarServiceWorker } from "./compartilhados/utils/registrar_service_worker";

createRoot(document.getElementById("root")!).render(<App />);

// Registro do service worker é condicional: nunca ativa dentro de iframe
// (preview do Lovable) nem em hosts de preview, evitando cache fantasma.
registrarServiceWorker();
