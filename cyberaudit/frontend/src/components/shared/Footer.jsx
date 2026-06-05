// ========================================================================
// Footer.jsx - Pied de page (barre violette de la charte).
// Toujours visible, en bas de chaque ecran, comme sur les 11 maquettes.
// ========================================================================
import { Copyright } from "lucide-react";
// Footer : composant du pied de page.
export default function Footer() {
  // On calcule l'annee courante pour ne pas la coder en dur.
  const year = new Date().getFullYear();

  // Rendu du pied de page.
  return (
    // <footer> : fond violet, texte blanc centre, espace interieur vertical.
    <footer className="bg-brand py-4 text-center">
      {/* Ligne de texte de la plateforme, en blanc et en gras.           */}
      <p className="text-sm font-semibold text-white">
        Copyright <Copyright className="inline-block h-4 w-4" /> {year}. All rights reserved CyberAudit &amp; Solutions.
      </p>
    </footer>
  );
}
