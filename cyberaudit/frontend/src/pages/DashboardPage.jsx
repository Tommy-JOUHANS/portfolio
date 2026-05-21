// ========================================================================
// DashboardPage.jsx - Page tableau de bord, affichee apres la connexion.
// Conforme a la doc (section "Component tree") : DashboardPage choisit
// d'afficher ClientDashboard ou AdminDashboard selon le role.
// Cette page est rendue a l'interieur du PortalLayout (avec menu lateral).
// ========================================================================

// useAuth : pour connaitre le role de l'utilisateur connecte.
import { useAuth } from "../hooks/useAuth.js";
// ClientDashboard : le tableau de bord du client (ecran 4).
import ClientDashboard from "../components/dashboard/ClientDashboard.jsx";
// AdminDashboard : le tableau de bord de l'administrateur (ecran 8).
import AdminDashboard from "../components/admin/AdminDashboard.jsx";

// DashboardPage : composant de la page tableau de bord.
export default function DashboardPage() {
  // On recupere l'utilisateur connecte.
  const { user } = useAuth();

  // Si l'utilisateur est un client -> on affiche le tableau de bord client.
  if (user.role === "client") {
    return <ClientDashboard />;
  }

  // Sinon (role admin) -> on affiche le tableau de bord administrateur.
  return <AdminDashboard />;
}
