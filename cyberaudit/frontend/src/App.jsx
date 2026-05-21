// ========================================================================
// App.jsx - Composant racine : routage global de l'application.
// Perimetre actuel : AUTHENTIFICATION + PORTAIL CLIENT.
//   - Pages publiques : accueil, inscription, connexion.
//   - Portail connecte : tableau de bord, demande d'audit, confirmation,
//     formation (avec menu lateral via PortalLayout).
// Architecture conforme a la doc technique Stage 3 (sections 4.3 et
// "Component tree").
// ========================================================================

// Routes / Route : conteneur et declaration des chemins de navigation.
// Navigate : redirige automatiquement vers une autre URL.
// Link : lien interne sans rechargement de page (utilise par la 404).
import { Routes, Route, Navigate, Link } from "react-router-dom";

// ErrorBoundary : capture les erreurs JS pour eviter un ecran blanc total.
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
// Header : barre violette superieure, toujours visible.
import Header from "./components/shared/Header.jsx";
// Footer : barre violette inferieure, toujours visible.
import Footer from "./components/shared/Footer.jsx";
// PortalLayout : mise en page des portails connectes (avec menu lateral).
import PortalLayout from "./components/shared/PortalLayout.jsx";
// ProtectedRoute : garde de route qui verifie la connexion et le role.
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// HomePage : ecran 1 de la doc - page d'accueil publique de presentation.
import HomePage from "./pages/HomePage.jsx";
// LoginPage : ecran 3 de la doc - formulaire de connexion.
import LoginPage from "./pages/LoginPage.jsx";
// RegisterPage : ecran 2 de la doc - formulaire de creation de compte.
import RegisterPage from "./pages/RegisterPage.jsx";
// DashboardPage : ecran 4 - tableau de bord (client ou admin selon le role).
import DashboardPage from "./pages/DashboardPage.jsx";
// NewAuditPage : ecran 5 - formulaire de demande d'audit.
import NewAuditPage from "./pages/NewAuditPage.jsx";
// ConfirmationPage : ecran 6 - confirmation / detail d'une demande.
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
// TrainingPage : ecran 7 - module de sensibilisation et formation.
import TrainingPage from "./pages/TrainingPage.jsx";
// AdminRequestDetailPage : ecran 9 - detail d'une demande (cote admin).
import AdminRequestDetailPage from "./pages/AdminRequestDetailPage.jsx";
// ReportViewerPage : ecran 10 - visionneuse du rapport de vulnerabilite.
import ReportViewerPage from "./pages/ReportViewerPage.jsx";

// Petit composant local affiche lorsqu'aucune route ne correspond a l'URL.
function NotFound() {
  // Bloc centre verticalement et horizontalement dans la zone de contenu.
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      {/* Code d'erreur affiche en gros caracteres violets.                */}
      <h1 className="text-6xl font-extrabold text-brand">404</h1>
      {/* Message explicatif pour l'utilisateur.                           */}
      <p className="text-gray-600">Cette page n'existe pas.</p>
      {/* Lien de retour vers la page d'accueil.                           */}
      <Link
        to="/"
        className="rounded-lg bg-brand px-5 py-2 font-semibold text-white transition hover:bg-brand-dark"
      >
        Retour a l'accueil
      </Link>
    </div>
  );
}

// Composant App : assemble la mise en page globale et la table de routage.
function App() {
  // ErrorBoundary englobe toute l'appli (bonne pratique citee dans la doc).
  return (
    <ErrorBoundary>
      {/* Colonne pleine hauteur : Header en haut, Footer colle en bas.    */}
      <div className="flex min-h-screen flex-col">
        {/* Barre de navigation superieure, presente sur toutes les pages. */}
        <Header />

        {/* <main> = zone de contenu ; flex-1 occupe l'espace disponible.  */}
        <main className="flex-1">
          {/* <Routes> choisit la page a afficher selon l'URL courante.    */}
          <Routes>
            {/* ---- Pages publiques (accessibles sans compte) ----------- */}
            {/* "/" : page d'accueil publique.                            */}
            <Route path="/" element={<HomePage />} />
            {/* "/login" : page de connexion.                             */}
            <Route path="/login" element={<LoginPage />} />
            {/* "/register" : page d'inscription.                         */}
            <Route path="/register" element={<RegisterPage />} />

            {/* ---- Portail : tableau de bord (roles client ET admin) --- */}
            {/* ProtectedRoute verifie connexion + role autorise.         */}
            <Route element={<ProtectedRoute allowedRoles={["client", "admin"]} />}>
              {/* PortalLayout ajoute le menu lateral autour de la page.   */}
              <Route element={<PortalLayout />}>
                {/* "/dashboard" : tableau de bord (client ou admin).     */}
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* ---- Portail : pages reservees au role "client" ---------- */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              {/* Meme mise en page avec menu lateral.                     */}
              <Route element={<PortalLayout />}>
                {/* "/audit/new" : formulaire de demande d'audit.         */}
                <Route path="/audit/new" element={<NewAuditPage />} />
                {/* Confirmation / detail d'une demande (:reference).     */}
                <Route
                  path="/audit/confirmation/:reference"
                  element={<ConfirmationPage />}
                />
                {/* "/training" : module de sensibilisation.              */}
                <Route path="/training" element={<TrainingPage />} />
              </Route>
            </Route>

            {/* ---- Portail : pages reservees au role "admin" ----------- */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              {/* Meme mise en page avec menu lateral.                     */}
              <Route element={<PortalLayout />}>
                {/* Detail editable d'une demande (ecran 9).              */}
                <Route
                  path="/admin/request/:reference"
                  element={<AdminRequestDetailPage />}
                />
                {/* Visionneuse du rapport de vulnerabilite (ecran 10).   */}
                <Route
                  path="/admin/report/:reference"
                  element={<ReportViewerPage />}
                />
              </Route>
            </Route>

            {/* ---- Redirections et route attrape-tout ------------------ */}
            {/* "/home" renvoie vers la racine "/".                       */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            {/* Toute URL inconnue affiche la page 404.                   */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Pied de page violet, present sur toutes les pages.            */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

// Exporte App pour qu'il soit monte par main.jsx.
export default App;
