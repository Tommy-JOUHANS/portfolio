// ========================================================================
// AuditRequestForm.jsx - Formulaire de demande d'audit (ecran 5 de la doc).
// Champs : Username, Company Name, choix du pack (PackSelector), Message.
// A la soumission : creation de la demande puis redirection vers la page
// de confirmation (ecran 6).
// ========================================================================

// useState : etats locaux. useEffect : chargement des packs au montage.
import { useState, useEffect } from "react";
// useNavigate : redirection apres la soumission.
import { useNavigate } from "react-router-dom";
// useAuth : pour pre-remplir le formulaire avec le client connecte.
import { useAuth } from "../../hooks/useAuth.js";
// Service de donnees : liste des packs et creation d'une demande.
import { getPackages, createRequest } from "../../services/dataService.js";
// PackSelector : composant de selection du pack.
import PackSelector from "./PackSelector.jsx";
// Outils de validation reutilises (presence + longueur max 50).
import {
  isRequired,
  isWithinMaxLength,
  MISSING_FIELD_MESSAGE,
  MAX_FIELD_LENGTH,
} from "../../utils/validators.js";

// AuditRequestForm : composant du formulaire de demande d'audit.
export default function AuditRequestForm() {
  // Client connecte (sert a pre-remplir et a relier la demande).
  const { user } = useAuth();
  // navigate : pour rediriger vers la page de confirmation.
  const navigate = useNavigate();

  // packages : la liste des 4 packs (chargee au montage).
  const [packages, setPackages] = useState([]);
  // form : valeurs des champs du formulaire.
  const [form, setForm] = useState({
    username: "", // nom d'utilisateur (pre-rempli ci-dessous)
    companyName: "", // raison sociale (pre-remplie ci-dessous)
    packCode: "", // code du pack choisi (vide au depart)
    message: "", // message libre, facultatif
  });
  // errors : messages d'erreur de validation, par champ.
  const [errors, setErrors] = useState({});

  // useEffect : au montage, on charge les packs et on pre-remplit le form.
  useEffect(() => {
    // Chargement de la liste des packs.
    setPackages(getPackages());
    // Pre-remplissage du nom et de l'entreprise avec le profil du client.
    setForm((previous) => ({
      ...previous,
      username: user.first_name, // prenom du client connecte
      companyName: user.company_name, // entreprise du client connecte
    }));
  }, [user.first_name, user.company_name]); // depend du profil du client

  // handleChange : met a jour un champ texte a chaque frappe.
  function handleChange(event) {
    // On recupere le nom du champ et sa nouvelle valeur.
    const { name, value } = event.target;
    // On met a jour uniquement ce champ.
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // handleSelectPack : met a jour le pack choisi (appele par PackSelector).
  function handleSelectPack(code) {
    // On enregistre le code du pack selectionne dans l'etat du formulaire.
    setForm((previous) => ({ ...previous, packCode: code }));
  }

  // validate : verifie le formulaire et retourne un objet d'erreurs.
  function validate() {
    // Objet qui accumulera les messages d'erreur.
    const found = {};
    // Username : obligatoire puis limite a 50 caracteres.
    if (!isRequired(form.username)) {
      found.username = MISSING_FIELD_MESSAGE;
    } else if (!isWithinMaxLength(form.username)) {
      found.username = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
    }
    // Company Name : obligatoire puis limite a 50 caracteres.
    if (!isRequired(form.companyName)) {
      found.companyName = MISSING_FIELD_MESSAGE;
    } else if (!isWithinMaxLength(form.companyName)) {
      found.companyName = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
    }
    // Pack : un pack doit obligatoirement etre selectionne.
    if (!isRequired(form.packCode)) {
      found.packCode = "Veuillez selectionner un pack.";
    }
    // On retourne la liste des erreurs trouvees.
    return found;
  }

  // handleSubmit : declenchee a l'envoi du formulaire.
  function handleSubmit(event) {
    // On bloque le rechargement de page par defaut.
    event.preventDefault();

    // Etape 1 : validation du formulaire.
    const found = validate();
    // S'il y a des erreurs, on les affiche et on s'arrete.
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    // Aucune erreur : on remet a zero les erreurs affichees.
    setErrors({});

    // Etape 2 : creation de la demande via le service de donnees.
    const created = createRequest({
      clientId: user.id, // identifiant du client connecte
      username: form.username, // nom d'utilisateur saisi
      companyName: form.companyName, // entreprise saisie
      contactName: `${user.first_name} ${user.last_name}`, // nom complet du contact
      clientEmail: user.email, // email du client connecte
      packCode: form.packCode, // pack choisi
      message: form.message, // message libre (peut etre vide)
    });

    // Etape 3 : redirection vers la page de confirmation de la demande.
    navigate(`/audit/confirmation/${created.reference}`);
  }

  // Rendu du formulaire.
  return (
    // <form> : onSubmit relie l'envoi a handleSubmit ; pas de validation native.
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* ---- Champ Username -------------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ.                                           */}
        <label htmlFor="username" className="text-sm font-semibold text-gray-700">
          Username :
        </label>
        {/* Champ de saisie du nom d'utilisateur.                         */}
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
        />
        {/* Message d'erreur eventuel.                                    */}
        {errors.username && (
          <span className="text-xs text-red-600">{errors.username}</span>
        )}
      </div>

      {/* ---- Champ Company Name ---------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ.                                           */}
        <label
          htmlFor="companyName"
          className="text-sm font-semibold text-gray-700"
        >
          Company Name :
        </label>
        {/* Champ de saisie de la raison sociale.                         */}
        <input
          id="companyName"
          name="companyName"
          type="text"
          value={form.companyName}
          onChange={handleChange}
          maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
        />
        {/* Message d'erreur eventuel.                                    */}
        {errors.companyName && (
          <span className="text-xs text-red-600">{errors.companyName}</span>
        )}
      </div>

      {/* ---- Selection du pack (composant PackSelector) ---------------- */}
      <div className="flex flex-col gap-1">
        {/* Le selecteur recoit la liste, le pack choisi et le callback.  */}
        <PackSelector
          packages={packages}
          selectedCode={form.packCode}
          onSelect={handleSelectPack}
        />
        {/* Message d'erreur si aucun pack n'est selectionne.             */}
        {errors.packCode && (
          <span className="text-xs text-red-600">{errors.packCode}</span>
        )}
      </div>

      {/* ---- Champ Message (facultatif) -------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Etiquette du champ.                                           */}
        <label htmlFor="message" className="text-sm font-semibold text-gray-700">
          Message :
        </label>
        {/* Zone de texte multiligne pour le message libre.               */}
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          placeholder="Describe your audit request (optional)"
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2"
        />
      </div>

      {/* ---- Bouton de soumission -------------------------------------- */}
      <button
        type="submit"
        className="self-start rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Sent the audit request
      </button>
    </form>
  );
}
