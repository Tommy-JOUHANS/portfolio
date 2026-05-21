// ========================================================================
// AdminRequestDetailPage.jsx - Detail d'une demande, cote admin (ecran 9).
// L'operateur peut consulter la demande, changer son statut, l'assigner,
// ajouter des notes internes, generer le rapport PDF, envoyer une
// notification et archiver la demande. L'historique est immuable (GDPR).
// ========================================================================

// useState : etats locaux. useEffect : chargement de la demande au montage.
import { useState, useEffect } from "react";
// useParams : lit la reference dans l'URL. useNavigate : navigation par code.
// Link : lien interne (retour a la liste).
import { useParams, useNavigate, Link } from "react-router-dom";
// useAuth : pour connaitre l'operateur connecte (auteur des actions).
import { useAuth } from "../hooks/useAuth.js";
// Fonctions du service de donnees utilisees par cette page.
import {
  getRequestByReference,
  getPackageByCode,
  updateRequest,
  archiveRequest,
  addRequestHistory,
  generateReport,
} from "../services/dataService.js";
// StatusBadge : pastille de statut reutilisable.
import StatusBadge from "../components/dashboard/StatusBadge.jsx";

// Liste des operateurs assignables ("" = aucune assignation).
const ASSIGNEES = ["", "Karim", "Sophie", "James"];

// formatDateTime : convertit une date ISO en "JJ/MM/AAAA HH:MM".
function formatDateTime(isoString) {
  // Objet Date construit a partir de la chaine ISO.
  const date = new Date(isoString);
  // Assemblage date + heure au format francais.
  return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// AdminRequestDetailPage : composant de la page de detail.
export default function AdminRequestDetailPage() {
  // Reference du dossier, lue dans l'URL (/admin/request/:reference).
  const { reference } = useParams();
  // navigate : pour rediriger (retour liste, ouverture du rapport).
  const navigate = useNavigate();
  // user : l'operateur connecte (auteur des actions journalisees).
  const { user } = useAuth();

  // request : la demande chargee (ou null si introuvable).
  const [request, setRequest] = useState(null);
  // status / assignedTo / internalNotes : champs editables du panneau actions.
  const [status, setStatus] = useState("pending");
  const [assignedTo, setAssignedTo] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  // notice : message d'information temporaire (apres une action).
  const [notice, setNotice] = useState("");

  // loadRequest : (re)charge la demande et synchronise les champs editables.
  function loadRequest() {
    // On lit la demande correspondant a la reference de l'URL.
    const found = getRequestByReference(reference);
    // On la memorise dans l'etat.
    setRequest(found);
    // Si elle existe, on initialise les champs editables avec ses valeurs.
    if (found) {
      setStatus(found.status);
      setAssignedTo(found.assigned_to);
      setInternalNotes(found.internal_notes);
    }
  }

  // useEffect : charge la demande au montage et a chaque changement d'URL.
  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]); // se relance si la reference change

  // --- Cas : aucune demande ne correspond a la reference ---------------
  if (!request) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {/* Message d'erreur.                                             */}
        <p className="text-gray-600">
          Aucune demande trouvee pour "{reference}".
        </p>
        {/* Lien de retour vers la liste.                                 */}
        <Link
          to="/dashboard"
          className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Back to list
        </Link>
      </div>
    );
  }

  // Pack lie a la demande (pour afficher son nom).
  const pack = getPackageByCode(request.pack_code);

  // handleSave : enregistre statut + assignation + notes internes.
  function handleSave() {
    // Mise a jour de la demande ; l'auteur est l'operateur connecte.
    updateRequest(
      reference,
      {
        status, // nouveau statut
        assigned_to: assignedTo, // nouvel operateur assigne
        internal_notes: internalNotes, // nouvelles notes internes
      },
      user.first_name,
    );
    // On recharge la demande pour afficher l'historique mis a jour.
    loadRequest();
    // On informe l'operateur que les changements sont enregistres.
    setNotice("Changes saved.");
  }

  // handleGenerateReport : genere le rapport PDF puis l'ouvre.
  function handleGenerateReport() {
    // Creation du rapport (ou recuperation s'il existe deja).
    generateReport(reference, user.first_name);
    // Redirection vers la visionneuse du rapport.
    navigate(`/admin/report/${reference}`);
  }

  // handleSendNotification : journalise l'envoi d'une notification au client.
  function handleSendNotification() {
    // On ajoute une entree d'historique (envoi de notification).
    addRequestHistory(
      reference,
      user.first_name,
      "Notification sent to the client (email)",
    );
    // On recharge la demande pour voir la nouvelle entree d'historique.
    loadRequest();
    // On informe l'operateur.
    setNotice("Notification sent to the client.");
  }

  // handleArchive : archive la demande (suppression douce).
  function handleArchive() {
    // Archivage de la demande par l'operateur connecte.
    archiveRequest(reference, user.first_name);
    // On recharge la demande (le statut devient "archived").
    loadRequest();
    // On informe l'operateur.
    setNotice("Request archived.");
  }

  // Rendu de la page.
  return (
    <div className="flex flex-col gap-5">
      {/* ---- En-tete : titre + bouton retour --------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Titre avec le numero de dossier.                              */}
        <h1 className="text-2xl font-bold text-brand">
          Request {request.reference}
        </h1>
        {/* Bouton de retour vers la liste des demandes.                  */}
        <Link
          to="/dashboard"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Back to list
        </Link>
      </div>

      {/* Message d'information temporaire apres une action.              */}
      {notice && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      {/* ---- Deux panneaux cote a cote : infos client / actions -------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ===== Panneau 1 : informations client ======================= */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {/* Titre du panneau.                                           */}
          <h2 className="mb-3 border-b border-gray-100 pb-2 font-bold text-brand">
            Client information
          </h2>
          {/* Liste de description des informations de la demande.        */}
          <dl className="flex flex-col gap-2 text-sm">
            {/* Entreprise.                                               */}
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Company :</dt>
              <dd className="text-right font-medium text-gray-800">
                {request.company_name}
              </dd>
            </div>
            {/* Contact.                                                  */}
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Contact :</dt>
              <dd className="text-right font-medium text-gray-800">
                {request.contact_name}
              </dd>
            </div>
            {/* Email.                                                    */}
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Email :</dt>
              <dd className="text-right font-medium text-gray-800">
                {request.client_email}
              </dd>
            </div>
            {/* Date de soumission.                                       */}
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Submitted :</dt>
              <dd className="text-right font-medium text-gray-800">
                {formatDateTime(request.submitted_at)}
              </dd>
            </div>
            {/* Pack selectionne.                                         */}
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Pack selected :</dt>
              <dd className="text-right font-medium text-brand">
                {pack ? pack.name : request.pack_code}
              </dd>
            </div>
            {/* Message libre du client.                                  */}
            <div className="flex flex-col gap-1">
              <dt className="text-gray-500">Client message :</dt>
              <dd className="rounded-md bg-cream p-2 text-gray-700">
                {request.message || "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* ===== Panneau 2 : statut et actions ========================= */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {/* Titre du panneau.                                           */}
          <h2 className="mb-3 border-b border-gray-100 pb-2 font-bold text-brand">
            Status &amp; Actions
          </h2>

          {/* Champ : statut courant (liste deroulante).                  */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-500">Current status :</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          {/* Champ : operateur assigne (liste deroulante).               */}
          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="text-gray-500">Assigned to :</span>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800"
            >
              {/* Une option par operateur ("" = non assigne).            */}
              {ASSIGNEES.map((name) => (
                <option key={name || "none"} value={name}>
                  {name || "Unassigned"}
                </option>
              ))}
            </select>
          </label>

          {/* Champ : notes internes (zone de texte).                     */}
          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="text-gray-500">Internal notes :</span>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes (not visible by the client)"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800"
            />
          </label>

          {/* Statut actuellement enregistre, affiche via la pastille.    */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Saved status :</span>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* ---- Barre de boutons d'action --------------------------------- */}
      <div className="flex flex-wrap gap-3">
        {/* Bouton : enregistrer les changements.                         */}
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Save changes
        </button>
        {/* Bouton : generer le rapport PDF.                              */}
        <button
          type="button"
          onClick={handleGenerateReport}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Generate PDF report
        </button>
        {/* Bouton : envoyer une notification au client.                  */}
        <button
          type="button"
          onClick={handleSendNotification}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Send notification
        </button>
        {/* Bouton : archiver la demande.                                 */}
        <button
          type="button"
          onClick={handleArchive}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Archive request
        </button>
      </div>

      {/* ---- Tableau d'historique (immuable - GDPR) -------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre du panneau d'historique.                                */}
        <h2 className="mb-3 font-bold text-brand">
          History (immutable - GDPR)
        </h2>
        {/* Tableau de l'historique (defilement horizontal si besoin).    */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            {/* En-tete du tableau d'historique.                          */}
            <thead className="bg-brand-soft text-gray-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Author</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            {/* Corps : une ligne par entree d'historique.                */}
            <tbody>
              {request.history.map((entry, index) => (
                // Cle = index (l'historique est immuable, l'ordre est stable).
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  {/* Date et heure de l'action.                          */}
                  <td className="px-3 py-2 text-gray-600">
                    {formatDateTime(entry.date)}
                  </td>
                  {/* Auteur de l'action.                                 */}
                  <td className="px-3 py-2 text-gray-600">{entry.author}</td>
                  {/* Description de l'action.                            */}
                  <td className="px-3 py-2 text-gray-800">{entry.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
