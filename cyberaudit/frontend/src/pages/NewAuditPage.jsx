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
  // @container sur la carte : le contenu interne (titre, formulaire)
  // s'adapte a la largeur de CETTE carte, pas au viewport.
  return (
    <div className="@container rounded-xl border border-gray-100 bg-white p-4 shadow-sm @sm:p-6">
      {/* Titre de la page, centre comme sur la maquette.                 */}
      <h1 className="mb-4 text-center text-lg font-bold text-brand @sm:mb-6 @sm:text-xl">
        Audit request form
      </h1>
      {/* Le formulaire de demande d'audit.                               */}
      <AuditRequestForm />
    </div>
  );
}
