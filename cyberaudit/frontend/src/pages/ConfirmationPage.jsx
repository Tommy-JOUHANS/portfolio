// ========================================================================
// ConfirmationPage.jsx - Page de confirmation de demande (ecran 6 de la doc).
// Affiche le recapitulatif d'une demande d'audit a partir de son numero de
// dossier (passe dans l'URL : /audit/confirmation/:reference).
// Sert a la fois d'accuse de reception (apres soumission) et de vue detail
// (depuis le lien "View details" du tableau de bord).
// ========================================================================

// useParams : lit les parametres de l'URL. Link : navigation interne.
import { useParams, Link } from "react-router-dom";
// CheckCircle2 : icone "coche verte" de lucide-react.
import { CheckCircle2 } from "lucide-react";
// Service de donnees : recuperation de la demande et du pack.
import {
  getRequestByReference,
  getPackageByCode,
} from "../services/dataService.js";

// formatDateTime : convertit une date ISO en "JJ/MM/AAAA HH:MM".
function formatDateTime(isoString) {
  // On construit un objet Date a partir de la chaine ISO.
  const date = new Date(isoString);
  // Partie date au format francais.
  const datePart = date.toLocaleDateString("fr-FR");
  // Partie heure au format heures:minutes.
  const timePart = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  // On assemble les deux parties.
  return `${datePart} ${timePart}`;
}

// ConfirmationPage : composant de la page de confirmation.
export default function ConfirmationPage() {
  // On lit le numero de dossier (reference) depuis l'URL.
  const { reference } = useParams();
  // On recupere la demande correspondante (ou null si introuvable).
  const request = getRequestByReference(reference);
  // On recupere le pack lie a cette demande (ou null).
  const pack = request ? getPackageByCode(request.pack_code) : null;

  // --- Cas d'erreur : aucune demande ne correspond a cette reference ----
  if (!request || !pack) {
    return (
      // Carte blanche affichant un message d'erreur.
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {/* Message d'erreur.                                             */}
        <p className="text-gray-600">
          Aucune demande trouvee pour la reference "{reference}".
        </p>
        {/* Lien de retour vers le tableau de bord.                       */}
        <Link
          to="/dashboard"
          className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Go to my Dashboard
        </Link>
      </div>
    );
  }

  // --- Cas normal : on affiche le recapitulatif de la demande -----------
  return (
    <div className="flex flex-col items-center">
      {/* ---- Bandeau de succes : coche verte + titre ------------------- */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Icone coche verte.                                            */}
        <CheckCircle2 size={44} className="text-green-600" />
        {/* Titre de confirmation.                                        */}
        <h1 className="text-xl font-bold text-green-700">
          Request Submitted Successfully
        </h1>
      </div>

      {/* ---- Carte recapitulative de la demande ------------------------ */}
      <div className="mt-6 w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Liste de description : un couple "terme : valeur" par ligne.  */}
        <dl className="flex flex-col gap-3 text-sm">
          {/* Numero de dossier.                                          */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Case number :</dt>
            <dd className="text-right text-gray-800">{request.reference}</dd>
          </div>
          {/* Nom d'utilisateur.                                          */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Username :</dt>
            <dd className="text-right text-gray-800">{request.username}</dd>
          </div>
          {/* Nom de l'entreprise.                                        */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Company Name :</dt>
            <dd className="text-right text-gray-800">{request.company_name}</dd>
          </div>
          {/* Pack selectionne.                                           */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Selected pack :</dt>
            <dd className="text-right text-gray-800">{pack.name}</dd>
          </div>
          {/* Services inclus (3 lignes : services, public, perimetre).   */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Services included :</dt>
            <dd className="text-right text-gray-800">
              {pack.included_services}
              <br />
              {pack.for_whom}
              <br />
              {pack.perimeter}
            </dd>
          </div>
          {/* Prix du pack.                                               */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Price :</dt>
            <dd className="text-right font-bold text-gray-800">
              {pack.price} EUR
            </dd>
          </div>
          {/* Date et heure de soumission.                                */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Submission date :</dt>
            <dd className="text-right text-gray-800">
              {formatDateTime(request.submitted_at)}
            </dd>
          </div>
          {/* Delai estime de traitement (duree du pack).                 */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">
              Estimated processing time :
            </dt>
            <dd className="text-right text-gray-800">
              {pack.duration_days} business days
            </dd>
          </div>
          {/* Message libre du client (ou tiret si vide).                 */}
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand">Message :</dt>
            <dd className="text-right text-gray-800">
              {request.message || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* ---- Encadre d'information : email de confirmation ------------- */}
      <p className="mt-4 w-full max-w-xl rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-700">
        A confirmation email has been sent to your address. You can track your
        request status in real time from your dashboard.
      </p>

      {/* ---- Boutons d'action ------------------------------------------ */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {/* Bouton principal : retour au tableau de bord.                 */}
        <Link
          to="/dashboard"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Go to my Dashboard
        </Link>
        {/* Bouton secondaire : creer une nouvelle demande.               */}
        <Link
          to="/audit/new"
          className="rounded-md border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-soft"
        >
          Submit a new request
        </Link>
      </div>
    </div>
  );
}
