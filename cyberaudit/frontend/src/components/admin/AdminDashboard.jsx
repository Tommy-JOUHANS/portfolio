// ========================================================================
// AdminDashboard.jsx - Tableau de bord administrateur (ecran 8 de la doc).
// Vue operateur CyberAudit : 4 cartes de statistiques, filtres
// (statut / pack / client), tableau de TOUTES les demandes et pagination.
// ========================================================================

// useState : etats locaux. useEffect : chargement des donnees au montage.
import { useState, useEffect } from "react";
// Link : lien interne (vers le detail d'une demande ou un rapport).
import { Link } from "react-router-dom";
// getAllRequests : recupere toutes les demandes (vue admin).
import { getAllRequests } from "../../services/dataService.js";
// StatCard et StatusBadge : composants reutilises du portail client.
import StatCard from "../dashboard/StatCard.jsx";
import StatusBadge from "../dashboard/StatusBadge.jsx";

// Nombre de demandes affichees par page (pagination).
const PAGE_SIZE = 5;

// formatDate : convertit une date ISO en format lisible JJ/MM/AAAA.
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("fr-FR");
}

// packLabel : transforme un code de pack en libelle court ("audit" -> "Audit").
function packLabel(code) {
  return code.charAt(0).toUpperCase() + code.slice(1);
}

// AdminDashboard : composant du tableau de bord administrateur.
export default function AdminDashboard() {
  // requests : la liste de toutes les demandes.
  const [requests, setRequests] = useState([]);
  // statusFilter : filtre courant sur le statut ("all" = tous).
  const [statusFilter, setStatusFilter] = useState("all");
  // packFilter : filtre courant sur le pack ("all" = tous).
  const [packFilter, setPackFilter] = useState("all");
  // clientQuery : texte de recherche sur le nom du client.
  const [clientQuery, setClientQuery] = useState("");
  // currentPage : numero de la page de pagination affichee.
  const [currentPage, setCurrentPage] = useState(1);

  // useEffect : charge toutes les demandes une fois, au montage.
  useEffect(() => {
    setRequests(getAllRequests());
  }, []); // tableau vide -> execute une seule fois

  // --- Statistiques : comptees sur la TOTALITE des demandes -------------
  const countByStatus = (status) =>
    requests.filter((request) => request.status === status).length;

  // --- Filtrage des demandes selon les 3 filtres ------------------------
  const filteredRequests = requests.filter((request) => {
    // Le statut correspond si le filtre est "all" ou egal au statut.
    const statusOk = statusFilter === "all" || request.status === statusFilter;
    // Le pack correspond si le filtre est "all" ou egal au code du pack.
    const packOk = packFilter === "all" || request.pack_code === packFilter;
    // Le client correspond si la recherche est vide ou contenue dans le nom.
    const clientOk = request.company_name
      .toLowerCase()
      .includes(clientQuery.trim().toLowerCase());
    // On garde la demande si les 3 conditions sont vraies.
    return statusOk && packOk && clientOk;
  });

  // --- Pagination -------------------------------------------------------
  // Nombre total de pages (au moins 1).
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  // Page courante bornee entre 1 et le nombre total de pages.
  const safePage = Math.min(currentPage, totalPages);
  // Index de depart de la tranche affichee.
  const startIndex = (safePage - 1) * PAGE_SIZE;
  // Les demandes de la page courante uniquement.
  const pageRequests = filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);

  // changeFilter : applique un filtre et revient a la premiere page.
  function changeFilter(setter, value) {
    setter(value); // on applique la nouvelle valeur de filtre
    setCurrentPage(1); // on revient a la page 1
  }

  // resetFilters : remet tous les filtres a leur valeur par defaut.
  function resetFilters() {
    setStatusFilter("all"); // statut : tous
    setPackFilter("all"); // pack : tous
    setClientQuery(""); // recherche client : vide
    setCurrentPage(1); // retour a la page 1
  }

  // Rendu du tableau de bord.
  return (
    <div className="flex flex-col gap-6">
      {/* ---- En-tete --------------------------------------------------- */}
      <div>
        {/* Titre principal de la page.                                   */}
        <h1 className="text-2xl font-bold text-brand">
          Admin Dashboard - Audit Requests
        </h1>
        {/* Sous-titre : role de la vue.                                  */}
        <p className="text-sm italic text-gray-500">
          CyberAudit operator view - Manage all SME requests
        </p>
      </div>

      {/* ---- Les 4 cartes de statistiques ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Demandes en attente.                                          */}
        <StatCard
          label="Pending"
          value={countByStatus("pending")}
          accentClass="text-amber-500"
        />
        {/* Demandes en cours.                                            */}
        <StatCard
          label="In Progress"
          value={countByStatus("in_progress")}
          accentClass="text-blue-600"
        />
        {/* Demandes terminees.                                           */}
        <StatCard
          label="Completed"
          value={countByStatus("completed")}
          accentClass="text-green-600"
        />
        {/* Demandes archivees.                                           */}
        <StatCard
          label="Archived"
          value={countByStatus("archived")}
          accentClass="text-gray-600"
        />
      </div>

      {/* ---- Carte : filtres + tableau + pagination -------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Barre de filtres.                                             */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Etiquette de la barre de filtres.                           */}
          <span className="text-sm font-semibold text-gray-700">Filters :</span>

          {/* Filtre par statut.                                          */}
          <label className="flex flex-col text-xs text-gray-500">
            Status
            <select
              value={statusFilter}
              onChange={(e) => changeFilter(setStatusFilter, e.target.value)}
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          {/* Filtre par pack.                                            */}
          <label className="flex flex-col text-xs text-gray-500">
            Pack
            <select
              value={packFilter}
              onChange={(e) => changeFilter(setPackFilter, e.target.value)}
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800"
            >
              <option value="all">All</option>
              <option value="audit">Audit</option>
              <option value="security">Security</option>
              <option value="protection">Protection</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          {/* Recherche par nom de client.                                */}
          <label className="flex flex-col text-xs text-gray-500">
            Client
            <input
              type="text"
              value={clientQuery}
              onChange={(e) => changeFilter(setClientQuery, e.target.value)}
              placeholder="Search"
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800"
            />
          </label>

          {/* Bouton de remise a zero des filtres.                        */}
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md border border-brand px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Reset filters
          </button>
        </div>

        {/* Tableau des demandes (defilement horizontal si besoin).       */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            {/* En-tete du tableau.                                       */}
            <thead className="bg-brand-soft text-gray-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Case #</th>
                <th className="px-3 py-2 font-semibold">Client</th>
                <th className="px-3 py-2 font-semibold">Pack</th>
                <th className="px-3 py-2 font-semibold">Submitted</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            {/* Corps du tableau.                                         */}
            <tbody>
              {/* Aucune demande ne correspond aux filtres.               */}
              {pageRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                    Aucune demande ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                // Sinon : une ligne par demande de la page courante.
                pageRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    {/* Numero de dossier.                                */}
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {request.reference}
                    </td>
                    {/* Nom de l'entreprise cliente.                      */}
                    <td className="px-3 py-3 text-gray-600">
                      {request.company_name}
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
                        // Demande terminee -> lien vers le rapport.
                        <Link
                          to={`/admin/report/${request.reference}`}
                          className="font-medium text-brand hover:underline"
                        >
                          View report
                        </Link>
                      ) : (
                        // Autres statuts -> lien vers le detail editable.
                        <Link
                          to={`/admin/request/${request.reference}`}
                          className="font-medium text-brand hover:underline"
                        >
                          View / Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Barre de pagination.                                          */}
        <div className="mt-4 flex items-center justify-between">
          {/* Texte indiquant le nombre de demandes affichees / total.    */}
          <span className="text-xs text-gray-500">
            {pageRequests.length} of {filteredRequests.length} requests
          </span>
          {/* Boutons de pages : un bouton par page disponible.           */}
          <div className="flex gap-1">
            {/* Array.from cree un tableau [1, 2, ... totalPages].        */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                // La page active est mise en evidence en violet.
                className={`h-7 w-7 rounded text-sm font-semibold transition ${
                  page === safePage
                    ? "bg-brand text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-brand-soft"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
