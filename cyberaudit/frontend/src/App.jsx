// ========================================================================
// App.jsx - Composant racine : routage global de l'application.
// Perimetre actuel : AUTHENTIFICATION + PORTAIL CLIENT + PAGES LEGALES.
//   - Pages publiques : accueil, inscription, connexion, RGPD.
//   - Portail connecte : tableau de bord, demande d'audit, confirmation,
//     formation (avec menu lateral via PortalLayout).
// Architecture conforme a la doc technique Stage 3 (sections 4.3 et
// "Component tree").
// ========================================================================
import { Routes, Route, Navigate, Link } from "react-router-dom";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import Header from "./components/shared/Header.jsx";
import Footer from "./components/shared/Footer.jsx";
import PortalLayout from "./components/shared/PortalLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
// Pages legales (RGPD + LCEN) : mentions legales, confidentialite, CGU.
import MentionsLegales from "./pages/legal/MentionsLegales.jsx";
import Confidentialite from "./pages/legal/Confidentialite.jsx";
import CGU from "./pages/legal/CGU.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NewAuditPage from "./pages/NewAuditPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import TrainingPage from "./pages/TrainingPage.jsx";
import AdminRequestDetailPage from "./pages/AdminRequestDetailPage.jsx";
import ReportViewerPage from "./pages/ReportViewerPage.jsx";

// Petit composant local affiche lorsqu'aucune route ne correspond a l'URL.
function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand">404</h1>
      <p className="text-gray-600">Cette page n'existe pas.</p>
      <Link
        to="/"
        className="rounded-lg bg-brand px-5 py-2 font-semibold text-white transition hover:bg-brand-dark"
      >
        Return to the home page
      </Link>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* ---- Pages publiques (accessibles sans compte) ----------- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ---- Pages legales (RGPD + LCEN) ------------------------- */}
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/cgu" element={<CGU />} />

            {/* ---- Portail : tableau de bord (roles client ET admin) --- */}
            <Route element={<ProtectedRoute allowedRoles={["client", "admin"]} />}>
              <Route element={<PortalLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* ---- Portail : pages reservees au role "client" ---------- */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              <Route element={<PortalLayout />}>
                <Route path="/audit/new" element={<NewAuditPage />} />
                <Route
                  path="/audit/confirmation/:reference"
                  element={<ConfirmationPage />}
                />
                <Route path="/training" element={<TrainingPage />} />
              </Route>
            </Route>

            {/* ---- Portail : pages reservees au role "admin" ----------- */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<PortalLayout />}>
                <Route
                  path="/admin/request/:reference"
                  element={<AdminRequestDetailPage />}
                />
                <Route
                  path="/admin/report/:reference"
                  element={<ReportViewerPage />}
                />
              </Route>
            </Route>

            {/* ---- Redirections et route attrape-tout ------------------ */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
