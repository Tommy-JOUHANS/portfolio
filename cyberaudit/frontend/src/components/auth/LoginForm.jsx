// ========================================================================
// LoginForm.jsx - Formulaire de connexion (ecran 3 de la doc).
// La doc (4.3) precise : "LoginPage : Login form. Submits to
// AuthStore.login() and then redirects according to the user's role."
// ========================================================================

// useState : etat local du composant. (gestion des champs et erreurs)
import { useState } from "react";
// useNavigate : pour rediriger apres une connexion reussie.
import { useNavigate } from "react-router-dom";
// Icones lucide-react : oeil ouvert/barre pour afficher/masquer le mot de passe.
import { Eye, EyeOff } from "lucide-react";
// useAuth : hook qui fournit la fonction login() globale.
import { useAuth } from "../../hooks/useAuth.js";
// validateLoginForm : verifie email + mot de passe avant l'envoi.
import { validateLoginForm } from "../../utils/validators.js";

// LoginForm : composant du formulaire de connexion.
export default function LoginForm() {
  // login : fonction de connexion fournie par le contexte d'authentification.
  const { login } = useAuth();
  // navigate : permet de changer de page apres connexion.
  const navigate = useNavigate();

  // form : valeurs saisies dans les deux champs du formulaire.
  const [form, setForm] = useState({ email: "", password: "" });
  // fieldErrors : erreurs de validation par champ ({ email: "...", ... }).
  const [fieldErrors, setFieldErrors] = useState({});
  // globalError : message d'erreur global (identifiants incorrects, etc.).
  const [globalError, setGlobalError] = useState("");
  // info : petit message d'information (liens "Lost Mail / Lost Password").
  const [info, setInfo] = useState("");
  // showPassword : true = le mot de passe est affiche en clair.
  const [showPassword, setShowPassword] = useState(false);
  // loading : true pendant le traitement de la connexion (bouton desactive).
  const [loading, setLoading] = useState(false);

  // handleChange : met a jour le champ modifie a chaque frappe clavier.
  function handleChange(event) {
    // On extrait le nom du champ (name) et sa nouvelle valeur (value).
    const { name, value } = event.target;
    // On recopie l'ancien etat et on remplace uniquement le champ concerne.
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // handleSubmit : declenchee a l'envoi du formulaire.
  async function handleSubmit(event) {
    // On empeche le rechargement de page par defaut du navigateur.
    event.preventDefault();
    // On efface les anciens messages avant une nouvelle tentative.
    setGlobalError("");
    setInfo("");

    // Etape 1 : validation cote client (presence + format de l'email).
    const errors = validateLoginForm(form);
    // Si des erreurs existent, on les affiche et on arrete ici.
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    // Aucune erreur de format : on vide la liste des erreurs de champ.
    setFieldErrors({});

    // Etape 2 : tentative de connexion via le service d'authentification.
    try {
      // On active l'etat de chargement (le bouton devient inactif).
      setLoading(true);
      // login() verifie les identifiants ; il leve une erreur si echec.
      const session = login(form.email, form.password);
      // Connexion reussie : on redirige vers la page post-connexion.
      // (client comme admin arrivent sur /dashboard pour l'instant).
      navigate("/dashboard", { replace: true, state: { role: session.user.role } });
    } catch (error) {
      // Echec : on affiche le message d'erreur renvoye par le service.
      setGlobalError(error.message);
    } finally {
      // Dans tous les cas, on desactive l'etat de chargement.
      setLoading(false);
    }
  }

  // handleLostLink : reaction aux liens "Lost Mail" / "Lost Password".
  // Ces fonctionnalites sont prevues "plus tard" selon la doc (ecran 3).
  function handleLostLink() {
    // On affiche un simple message d'information temporaire.
    setInfo("Fonctionnalite disponible prochainement.");
  }

  // Rendu du formulaire.
  return (
    // <form> : onSubmit relie l'envoi a notre fonction handleSubmit.
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* ---- Champ Email / nom d'utilisateur ---------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ email.                                      */}
        <label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email / User name
        </label>
        {/* Champ de saisie de l'email.                                    */}
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
        />
        {/* Message d'erreur du champ email, affiche seulement si besoin.  */}
        {fieldErrors.email && (
          <span className="text-xs text-red-600">{fieldErrors.email}</span>
        )}
      </div>

      {/* ---- Champ Mot de passe ----------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ mot de passe.                               */}
        <label htmlFor="password" className="text-sm font-semibold text-gray-700">
          Password
        </label>
        {/* Conteneur "relative" pour positionner le bouton oeil a droite. */}
        <div className="relative">
          {/* Champ mot de passe : type texte si showPassword, sinon masque.*/}
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            maxLength={50}
            className="w-full rounded-md bg-gray-100 px-3 py-2 pr-10 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
          />
          {/* Bouton oeil : bascule l'affichage du mot de passe.           */}
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {/* On affiche l'icone oeil barre ou oeil ouvert selon l'etat. */}
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {/* Message d'erreur du champ mot de passe, si necessaire.         */}
        {fieldErrors.password && (
          <span className="text-xs text-red-600">{fieldErrors.password}</span>
        )}
      </div>

      {/* ---- Liens "Lost Mail" / "Lost Password" (prevus plus tard) ----- */}
      <div className="flex flex-col gap-1">
        {/* Lien de recuperation d'email.                                  */}
        <button
          type="button"
          onClick={handleLostLink}
          className="self-start text-xs text-brand hover:underline"
        >
          Lost Mail ?
        </button>
        {/* Lien de recuperation de mot de passe.                          */}
        <button
          type="button"
          onClick={handleLostLink}
          className="self-start text-xs text-brand hover:underline"
        >
          Lost Password ?
        </button>
      </div>

      {/* ---- Zone de message d'information (liens ci-dessus) ------------ */}
      {info && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {info}
        </p>
      )}

      {/* ---- Zone d'erreur globale (identifiants incorrects) ------------ */}
      {globalError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {globalError}
        </p>
      )}

      {/* ---- Bouton de soumission "Connection" -------------------------- */}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-md bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {/* Le libelle change pendant le chargement.                       */}
        {loading ? "Connexion..." : "Connection"}
      </button>
    </form>
  );
}
