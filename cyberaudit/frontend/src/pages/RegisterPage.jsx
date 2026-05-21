// ========================================================================
// RegisterPage.jsx - Page de creation de compte (ecran 2 de la doc).
// Role : mettre en page la "carte" d'inscription (icone, titre, sous-titre),
// y inserer le formulaire <RegisterForm /> et proposer un lien vers la
// connexion. La logique d'inscription est dans RegisterForm.
// ========================================================================

// Link : lien de navigation interne (vers la page de connexion).
import { Link } from "react-router-dom";
// UserPlus : icone "ajout d'utilisateur" de lucide-react.
import { UserPlus } from "lucide-react";
// RegisterForm : le formulaire d'inscription proprement dit.
import RegisterForm from "../components/auth/RegisterForm.jsx";

// RegisterPage : composant de la page d'inscription.
export default function RegisterPage() {
  // Rendu de la page.
  return (
    // Section pleine largeur sur fond creme, contenu centre horizontalement.
    <section className="flex justify-center bg-cream px-4 py-12">
      {/* Carte blanche centrale, coins arrondis, ombre douce.            */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        {/* ---- En-tete de la carte : icone + titre + sous-titre -------- */}
        <div className="flex flex-col items-center gap-2 text-center">
          {/* Pastille ronde violet clair contenant l'icone utilisateur.  */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
            {/* Icone "ajout d'utilisateur" en violet de la charte.       */}
            <UserPlus size={26} className="text-brand" />
          </div>
          {/* Titre principal de la page.                                 */}
          <h1 className="text-2xl font-bold text-gray-800">
            Create an account
          </h1>
          {/* Sous-titre explicatif.                                      */}
          <p className="text-sm text-gray-500">
            Fill in the information below to get started
          </p>
        </div>

        {/* ---- Le formulaire d'inscription ----------------------------- */}
        <div className="mt-6">
          {/* RegisterForm gere la saisie, la validation et register().    */}
          <RegisterForm />
        </div>

        {/* ---- Separateur visuel --------------------------------------- */}
        <div className="my-6 border-t border-gray-200" />

        {/* ---- Bas de carte : invitation a se connecter ---------------- */}
        <div className="flex flex-col items-center gap-3">
          {/* Phrase d'accroche.                                          */}
          <p className="text-sm text-gray-500">Already have an account?</p>
          {/* Bouton secondaire (contour) renvoyant vers /login.          */}
          <Link
            to="/login"
            className="w-full rounded-md border border-brand py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
