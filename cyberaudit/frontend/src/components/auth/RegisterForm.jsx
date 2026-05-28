// ========================================================================
// RegisterForm.jsx - Formulaire de creation de compte (ecran 2 de la doc).
// Champs imposes par la doc : Company Name, First Name, Last Name, Email,
// Password. Regles de validation : voir utils/validators.js.
// ========================================================================

// useState : etat local du composant.
import { useState } from "react";
// useNavigate : redirection apres une inscription reussie.
import { useNavigate } from "react-router-dom";
// Icones lucide-react : oeil ouvert/barre pour le champ mot de passe.
import { Eye, EyeOff } from "lucide-react";
// useAuth : hook fournissant la fonction register() globale.
import { useAuth } from "../../hooks/useAuth.js";
// validateRegisterForm : applique toutes les regles de l'ecran 2.
import { validateRegisterForm } from "../../utils/validators.js";

// RegisterForm : composant du formulaire d'inscription.
export default function RegisterForm() {
  // register : fonction d'inscription fournie par le contexte d'auth.
  const { register } = useAuth();
  // navigate : pour rediriger l'utilisateur apres creation du compte.
  const navigate = useNavigate();

  // form : valeurs des 5 champs du formulaire d'inscription.
  const [form, setForm] = useState({
    companyName: "", // raison sociale de l'entreprise
    firstName: "", // prenom de l'utilisateur
    lastName: "", // nom de famille de l'utilisateur
    email: "", // adresse email (servira d'identifiant)
    password: "", // mot de passe choisi
  });
  // fieldErrors : erreurs de validation, une par champ concerne.
  const [fieldErrors, setFieldErrors] = useState({});
  // globalError : erreur globale (ex. email deja utilise).
  const [globalError, setGlobalError] = useState("");
  // showPassword : true = mot de passe affiche en clair.
  const [showPassword, setShowPassword] = useState(false);
  // loading : true pendant le traitement de l'inscription.
  const [loading, setLoading] = useState(false);

  // handleChange : met a jour le champ modifie a chaque frappe.
  function handleChange(event) {
    // On recupere le nom et la valeur du champ saisi.
    const { name, value } = event.target;
    // On met a jour uniquement ce champ dans l'objet "form".
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // handleSubmit : declenchee a l'envoi du formulaire.
  async function handleSubmit(event) {
    // On bloque le rechargement de page par defaut.
    event.preventDefault();
    // On efface l'eventuelle erreur globale precedente.
    setGlobalError("");

    // Etape 1 : validation de tous les champs selon les regles de la doc.
    const errors = validateRegisterForm(form);
    // S'il y a au moins une erreur, on l'affiche et on s'arrete.
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    // Formulaire valide : on remet a zero les erreurs de champ.
    setFieldErrors({});

    // Etape 2 : creation du compte via le service d'authentification.
    try {
      // On active l'indicateur de chargement.
      setLoading(true);
      // register() crée le compte via l'API ; il lève une erreur si l'email existe.
      await register(form);
      // Inscription reussie : l'utilisateur est connecte, on le redirige.
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Echec : on affiche le message d'erreur (ex. email deja pris).
      setGlobalError(error.message);
    } finally {
      // On desactive l'indicateur de chargement dans tous les cas.
      setLoading(false);
    }
  }

  // Petit tableau decrivant les 3 premiers champs texte simples.
  // Cela evite de repeter le meme bloc JSX trois fois.
  const textFields = [
    { name: "companyName", label: "Company Name", placeholder: "Enter company name" },
    { name: "firstName", label: "First Name", placeholder: "Enter first name" },
    { name: "lastName", label: "Last Name", placeholder: "Enter last name" },
  ];

  // Rendu du formulaire.
  return (
    
    // <form> : onSubmit relie l'envoi a handleSubmit ; noValidate desactive
    // la validation native du navigateur (on gere tout nous-memes).
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      {/* ---- Les 3 champs texte simples, generes par une boucle -------- */}
      {textFields.map((field) => (
        // Cle unique requise par React pour chaque element d'une liste.
        <div key={field.name} className="flex flex-col gap-1">
          {/* Etiquette du champ.                                          */}
          <label
            htmlFor={field.name}
            className="text-sm font-semibold text-gray-700"
          >
            {field.label}
          </label>
          {/* Champ de saisie texte.                                       */}
          <input
            id={field.name}
            name={field.name}
            type="text"
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            maxLength={50}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
          />
          {/* Message d'erreur eventuel pour ce champ.                     */}
          {fieldErrors[field.name] && (
            <span className="text-xs text-red-600">
              {fieldErrors[field.name]}
            </span>
          )}
        </div>
      ))}

      {/* ---- Champ Email ------------------------------------------------ */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ email.                                      */}
        <label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email
        </label>
        {/* Champ de saisie de l'email.                                    */}
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email address"
          maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
        />
        {/* Message d'erreur eventuel pour l'email.                        */}
        {fieldErrors.email && (
          <span className="text-xs text-red-600">{fieldErrors.email}</span>
        )}
      </div>

      {/* ---- Champ Mot de passe ----------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ mot de passe.                               */}
        <label
          htmlFor="password"
          className="text-sm font-semibold text-gray-700"
        >
          Password
        </label>
        {/* Conteneur relatif pour positionner le bouton oeil.             */}
        <div className="relative">
          {/* Champ mot de passe : visible en clair si showPassword.       */}
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            maxLength={50}
            className="w-full rounded-md bg-gray-100 px-3 py-2 pr-10 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
          />
          {/* Bouton oeil : affiche ou masque le mot de passe.             */}
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand "
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {/* Icone oeil barre (visible) ou oeil ouvert (masque).        */}
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {/* Message d'erreur du mot de passe, si la regle n'est pas tenue. */}
        {fieldErrors.password ? (
          <span className="text-xs text-red-600">{fieldErrors.password}</span>
        ) : (
          // Sinon : rappel discret de la regle de robustesse a respecter.
          <span className="text-xs text-gray-500">
            10 caracteres min., 1 majuscule, 1 minuscule, 1 chiffre, 1 special.
          </span>
        )}
      </div>

      {/* ---- Zone d'erreur globale (email deja pris, etc.) -------------- */}
      {globalError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {globalError}
        </p>
      )}

      {/* ---- Bouton de soumission "Create an account" ------------------ */}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-md bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      >
        {/* Le libelle change pendant le traitement.                       */}
        {loading ? "Creation..." : "Create an account"}
      </button>
    </form>
  );
}
