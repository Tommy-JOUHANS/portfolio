// ========================================================================
// main.jsx - Point d'entree de l'application React.
// C'est le tout premier fichier execute : il "monte" React dans le DOM.
// ========================================================================

// StrictMode : composant React qui detecte les erreurs potentielles en dev.
import { StrictMode } from "react";
// createRoot : API React 18+/19 pour attacher l'application a une div HTML.
import { createRoot } from "react-dom/client";
// BrowserRouter : fournit la navigation par URL (historique du navigateur).
import { BrowserRouter } from "react-router-dom";

// App : composant racine qui contient la definition de toutes les routes.
import App from "./App.jsx";
// AuthProvider : contexte global qui memorise l'utilisateur connecte.
import { AuthProvider } from "./context/AuthContext.jsx";

// Importe les styles globaux (Tailwind + theme) pour toute l'application.
import "./global.css";

// createRoot cible la balise <div id="root"> presente dans index.html.
createRoot(document.getElementById("root")).render(
  // StrictMode enveloppe l'appli pour activer les verifications de dev.
  <StrictMode>
    {/* BrowserRouter active le routage : chaque page a sa propre URL.    */}
    <BrowserRouter>
      {/* AuthProvider rend l'utilisateur connecte accessible partout.    */}
      <AuthProvider>
        {/* App contient le <Routes> qui affiche la bonne page selon l'URL. */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
