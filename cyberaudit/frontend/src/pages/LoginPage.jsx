// ========================================================================
// LoginPage.jsx - Page de connexion (ecran 3 de la doc).
// Role : mettre en page la "carte" de connexion (icone, titre, sous-titre),
// y inserer le formulaire <LoginForm /> et proposer un lien vers
// l'inscription. La logique de connexion est dans LoginForm.
// ========================================================================

// Link : lien de navigation interne (vers la page d'inscription).
import { Link } from "react-router-dom";
// Lock : icone "cadenas" de lucide-react, affichee en haut de la carte.
import { Lock } from "lucide-react";
// LoginForm : le formulaire de connexion proprement dit.
import LoginForm from "../components/auth/LoginForm.jsx";

// LoginPage : composant de la page de connexion.
export default function LoginPage() {
  // Rendu de la page.
  return (
    // Section pleine largeur sur fond creme, contenu centre horizontalement.
    // py-8 sur mobile (ecran court), sm:py-12 a partir de 640px
    <section className="flex justify-center bg-cream px-4 py-8 sm:py-12">
      {/* Carte blanche centrale, coins arrondis, ombre douce.
          Mobile (< 480px)  : p-5  — evite que la carte touche les bords
          xs     (≥ 480px)  : p-6
          sm+    (≥ 640px)  : p-8  — standard confortable                  */}
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-sm xs:p-6 sm:p-8">
        {/* ---- En-tete de la carte : icone + titre + sous-titre -------- */}
        <div className="flex flex-col items-center gap-2 text-center">
          {/* Pastille ronde violet clair contenant l'icone cadenas.      */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
            {/* Icone cadenas en violet de la charte.                     */}
            <Lock size={26} className="text-brand" />
          </div>
          {/* Titre principal de la page.                                 */}
          <h1 className="text-2xl font-bold text-gray-800">Log In</h1>
          {/* Sous-titre explicatif.                                      */}
          <p className="text-sm text-gray-500">
            Enter your credentials to access your account
          </p>
        </div>

        {/* ---- Le formulaire de connexion ------------------------------ */}
        <div className="mt-6">
          {/* LoginForm gere la saisie, la validation et l'appel a login(). */}
          <LoginForm />
        </div>

        {/* ---- Separateur visuel --------------------------------------- */}
        <div className="my-6 border-t border-gray-200" />

        {/* ---- Bas de carte : invitation a creer un compte ------------- */}
        <div className="flex flex-col items-center gap-3">
          {/* Phrase d'accroche.                                          */}
          <p className="text-sm text-gray-500">Don't have an account?</p>
          {/* Bouton secondaire (contour) renvoyant vers /register.       */}
          <Link
            to="/register"
            className="w-full rounded-md border border-brand py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
