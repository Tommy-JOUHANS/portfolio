// ========================================================================
// NewAuditPage.jsx - Page du formulaire de demande d'audit (ecran 5).
// Role : afficher le titre puis le formulaire <AuditRequestForm />.
// Cette page est rendue a l'interieur du PortalLayout (avec le menu lateral).
// ========================================================================

// AuditRequestForm : le formulaire de demande d'audit.
import AuditRequestForm from "../components/audit/AuditRequestForm.jsx";

// NewAuditPage : composant de la page "Audit Request".
export default function NewAuditPage() {
  // Rendu de la page.
  return (
    // Carte blanche contenant le titre et le formulaire.
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Titre de la page, centre comme sur la maquette.                 */}
      <h1 className="mb-6 text-center text-xl font-bold text-brand">
        Audit request form
      </h1>
      {/* Le formulaire de demande d'audit.                               */}
      <AuditRequestForm />
    </div>
  );
}
