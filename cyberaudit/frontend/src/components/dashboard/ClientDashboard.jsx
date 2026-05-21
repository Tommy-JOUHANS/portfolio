// ========================================================================
// ClientDashboard.jsx - Tableau de bord du client (ecran 4 de la doc).
// Affiche : 3 cartes de statistiques, le tableau des demandes d'audit avec
// filtres (statut + pack), et les notifications recentes.
// ========================================================================

// useState : etats locaux. useEffect : chargement des donnees au montage.
import { useState, useEffect } from "react";
// Link : lien interne (vers le detail d'une demande).
import { Link } from "react-router-dom";
// useAuth : pour connaitre le client connecte.
import { useAuth } from "../../hooks/useAuth.js";
// Fonctions du service de donnees (demandes, packs, notifications).
import {
  getRequestsByClientId,
  getPackages,
  getNotificationsByUserId,
} from "../../services/dataService.js";
// StatCard : carte de statistique reutilisable.
import StatCard from "./StatCard.jsx";
// StatusBadge : pastille de statut reutilisable.
import StatusBadge from "./StatusBadge.jsx";

// ------------------------------------------------------------------------
// formatDate : convertit une date ISO en format lisible JJ/MM/AAAA.
// ------------------------------------------------------------------------
function formatDate(isoString) {
  // On construit un objet Date a partir de la chaine ISO.
  const date = new Date(isoString);
  // toLocaleDateString("fr-FR") donne le format jour/mois/annee.
  return date.toLocaleDateString("fr-FR");
}

// ------------------------------------------------------------------------
// timeAgo : exprime depuis combien de temps une date est passee.
// ------------------------------------------------------------------------
function timeAgo(isoString) {
  // Difference en millisecondes entre maintenant et la date donnee.
  const diffMs = Date.now() - new Date(isoString).getTime();
  // Conversion en heures entieres.
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  // Moins d'une heure -> on affiche en minutes.
  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `il y a ${minutes} min`;
  }
  // Moins d'un jour -> on affiche en heures.
  if (hours < 24) return `il y a ${hours} h`;
  // Sinon -> on affiche en jours.
  return `il y a ${Math.floor(hours / 24)} j`;
}

// ClientDashboard : composant du tableau de bord client.
export default function ClientDashboard() {
  // Utilisateur connecte (le client).
  const { user } = useAuth();

  // requests : la liste des demandes d'audit du client.
  const [requests, setRequests] = useState([]);
  // packages : la liste des 4 packs (pour afficher les noms).
  const [packages, setPackages] = useState([]);
  // notifications : les notifications recentes du client.
  const [notifications, setNotifications] = useState([]);
  // statusFilter : filtre courant sur le statut ("all" = tous).
  const [statusFilter, setStatusFilter] = useState("all");
  // packFilter : filtre courant sur le pack ("all" = tous).
  const [packFilter, setPackFilter] = useState("all");
  // notice : message d'information temporaire (clic sur "Download report").
  const [notice, setNotice] = useState("");

  // useEffect : charge les donnees une fois, au montage du composant.
  useEffect(() => {
    // On charge les demandes du client connecte.
    setRequests(getRequestsByClientId(user.id));
    // On charge la liste des packs.
    setPackages(getPackages());
    // On charge les notifications du client.
    setNotifications(getNotificationsByUserId(user.id));
  }, [user.id]); // se relance si l'identifiant du client change

  // packLabel : renvoie un libelle court de pack a partir de son code.
  function packLabel(code) {
    // Premiere lettre en majuscule, reste inchange (ex. "audit" -> "Audit").
    return code.charAt(0).toUpperCase() + code.slice(1);
  }

  // filteredRequests : la liste des demandes apres application des filtres.
  const filteredRequests = requests.filter((request) => {
    // Le statut correspond si le filtre est "all" ou egal au statut.
    const statusOk = statusFilter === "all" || request.status === statusFilter;
    // Le pack correspond si le filtre est "all" ou egal au code du pack.
    const packOk = packFilter === "all" || request.pack_code === packFilter;
    // On garde la demande seulement si les deux conditions sont vraies.
    return statusOk && packOk;
  });

  // Statistiques calculees a partir des demandes.
  // openCount : demandes en attente ou en cours.
  const openCount = requests.filter(
    (r) => r.status === "pending" || r.status === "in_progress",
  ).length;
  // completedCount : demandes terminees.
  const completedCount = requests.filter((r) => r.status === "completed").length;
  // reportCount : un rapport est disponible pour chaque demande terminee.
  const reportCount = completedCount;

  // Rendu du tableau de bord.
  return (
    <div className="flex flex-col gap-6">
      {/* ---- En-tete : titre et message de bienvenue ------------------- */}
      <div>
        {/* Titre principal de la page.                                   */}
        <h1 className="text-2xl font-bold text-brand">My Dashboard</h1>
        {/* Sous-titre personnalise avec le prenom du client.             */}
        <p className="text-sm italic text-gray-500">
          Welcome {user.first_name} - Real-time tracking of your audit requests
        </p>
      </div>

      {/* ---- Les 3 cartes de statistiques ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Carte 1 : nombre de demandes ouvertes.                        */}
        <StatCard
          label="Open requests"
          value={openCount}
          accentClass="text-amber-500"
        />
        {/* Carte 2 : nombre de demandes terminees.                       */}
        <StatCard
          label="Completed"
          value={completedCount}
          accentClass="text-green-600"
        />
        {/* Carte 3 : nombre de rapports disponibles.                     */}
        <StatCard
          label="Reports available"
          value={reportCount}
          accentClass="text-brand"
        />
      </div>

      {/* ---- Section "Mes demandes d'audit" ---------------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="text-lg font-bold text-gray-800">My audit requests</h2>

        {/* Barre de filtres : statut + pack.                             */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* Etiquette "Filter :".                                       */}
          <span className="text-sm text-gray-500">Filter :</span>
          {/* Liste deroulante de filtre par statut.                      */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            {/* Options : tous les statuts puis chaque statut.            */}
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          {/* Liste deroulante de filtre par pack.                        */}
          <select
            value={packFilter}
            onChange={(e) => setPackFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            {/* Options : tous les packs puis chaque pack.                */}
            <option value="all">All packs</option>
            <option value="audit">Audit</option>
            <option value="security">Security</option>
            <option value="protection">Protection</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Message d'information temporaire (clic "Download report").    */}
        {notice && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {notice}
          </p>
        )}

        {/* Tableau des demandes, avec defilement horizontal si besoin.   */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            {/* En-tete du tableau.                                       */}
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Case #</th>
                <th className="px-3 py-2 font-semibold">Pack</th>
                <th className="px-3 py-2 font-semibold">Submission</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            {/* Corps du tableau.                                         */}
            <tbody>
              {/* Cas ou aucune demande ne correspond aux filtres.        */}
              {filteredRequests.length === 0 ? (
                <tr>
                  {/* Cellule unique sur toute la largeur du tableau.     */}
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                    Aucune demande a afficher.
                  </td>
                </tr>
              ) : (
                // Sinon : une ligne par demande filtree.
                filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    {/* Numero de dossier.                                */}
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {request.reference}
                    </td>
                    {/* Pack choisi (libelle court).                      */}
                    <td className="px-3 py-3 text-gray-600">
                      {packLabel(request.pack_code)}
                    </td>
                    {/* Date de soumission formatee.                      */}
                    <td className="px-3 py-3 text-gray-600">
                      {formatDate(request.submitted_at)}
                    </td>
                    {/* Statut affiche via la pastille StatusBadge.       */}
                    <td className="px-3 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    {/* Action : depend du statut de la demande.          */}
                    <td className="px-3 py-3">
                      {request.status === "completed" ? (
                        // Demande terminee -> bouton "Download report".
                        <button
                          type="button"
                          onClick={() =>
                            setNotice(
                              "Le rapport PDF sera telechargeable via le module Rapport (portail admin, a venir).",
                            )
                          }
                          className="font-medium text-brand hover:underline"
                        >
                          Download report
                        </button>
                      ) : (
                        // Autres statuts -> lien "View details".
                        <Link
                          to={`/audit/confirmation/${request.reference}`}
                          className="font-medium text-brand hover:underline"
                        >
                          View details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Section "Notifications recentes" -------------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="text-lg font-bold text-gray-800">Recent notifications</h2>

        {/* Liste des notifications, ou message si aucune.                */}
        {notifications.length === 0 ? (
          // Aucun element : message neutre.
          <p className="mt-3 text-sm text-gray-400">Aucune notification.</p>
        ) : (
          // Sinon : une ligne par notification.
          <ul className="mt-3 flex flex-col gap-2">
            {notifications.map((notification) => (
              // Cle unique = identifiant de la notification.
              <li
                key={notification.id}
                className="rounded-md border-l-4 border-brand bg-cream px-3 py-2 text-sm text-gray-700"
              >
                {/* Texte de la notification.                             */}
                {notification.message}{" "}
                {/* Anciennete de la notification, en gris clair.         */}
                <span className="text-gray-400">
                  ({timeAgo(notification.created_at)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
