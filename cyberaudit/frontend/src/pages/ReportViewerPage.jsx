// ========================================================================
// ReportViewerPage.jsx - Visionneuse du rapport de vulnerabilite (ecran 10).
// Affiche le score global, le resume executif, le tableau des
// vulnerabilites et le plan d'action sur 30 jours.
// Si aucun rapport n'existe encore pour la demande, il est genere a la volee.
// ========================================================================

// useState : etat local. useEffect : chargement du rapport au montage.
import { useState, useEffect } from "react";
// useParams : lit la reference dans l'URL. Link : lien de retour.
import { useParams, Link } from "react-router-dom";
// useAuth : pour connaitre l'operateur (auteur d'une generation eventuelle).
import { useAuth } from "../hooks/useAuth.js";
// Service de donnees : lecture et generation d'un rapport.
import {
  getReportByReference,
  generateReport,
} from "../services/dataService.js";

// severityClasses : renvoie les couleurs d'une severite de vulnerabilite.
function severityClasses(severity) {
  // "High" -> rouge ; "Medium" -> ambre ; "Low" -> vert.
  if (severity === "High") return "bg-red-100 text-red-700";
  if (severity === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

// scoreColor : renvoie la couleur de la barre de score (regle de la doc 4.3).
function scoreColor(score) {
  // Score > 70 -> vert ; 40-70 -> orange ; < 40 -> rouge.
  if (score > 70) return "bg-green-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

// ReportViewerPage : composant de la visionneuse de rapport.
export default function ReportViewerPage() {
  // Reference du dossier, lue dans l'URL (/admin/report/:reference).
  const { reference } = useParams();
  // user : l'operateur connecte (auteur si le rapport doit etre genere).
  const { user } = useAuth();

  // report : le rapport de vulnerabilite a afficher.
  const [report, setReport] = useState(null);
  // notice : message d'information temporaire (clic sur "Download PDF").
  const [notice, setNotice] = useState("");

  // useEffect : charge le rapport au montage (ou le genere s'il n'existe pas).
  useEffect(() => {
    // On tente de lire un rapport existant pour cette demande.
    const existing = getReportByReference(reference);
    // S'il existe on l'utilise ; sinon on le genere a la volee.
    setReport(existing || generateReport(reference, user.first_name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]); // se relance si la reference change

  // Tant que le rapport n'est pas pret, on affiche un message d'attente.
  if (!report) {
    return <p className="text-gray-500">Chargement du rapport...</p>;
  }

  // Rendu de la page.
  return (
    <div className="flex flex-col gap-5">
      {/* ---- En-tete : titre + boutons --------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Titre avec le numero de dossier.                              */}
        <h1 className="text-2xl font-bold text-brand">
          Vulnerability Report - {reference}
        </h1>
        {/* Groupe de boutons a droite.                                   */}
        <div className="flex gap-2">
          {/* Bouton retour vers la liste des demandes.                   */}
          <Link
            to="/dashboard"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Back to list
          </Link>
          {/* Bouton de telechargement du PDF.                            */}
          <button
            type="button"
            onClick={() =>
              setNotice(
                "La generation du fichier PDF est assuree par le backend (WeasyPrint + Celery, voir doc 4.4).",
              )
            }
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Message d'information temporaire (clic "Download PDF").         */}
      {notice && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {notice}
        </p>
      )}

      {/* ---- Score de securite global ---------------------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="mb-3 font-bold text-brand">Global security score</h2>
        {/* Ligne : note (badge) + verdict + barre de score.              */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Badge de la note globale (A a F).                           */}
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 text-2xl font-extrabold text-green-700">
            {report.grade}
          </span>
          {/* Bloc verdict + barre de progression du score.               */}
          <div className="min-w-[200px] flex-1">
            {/* Texte du verdict.                                         */}
            <p className="text-sm text-gray-600">{report.verdict}</p>
            {/* Rail de la barre de score.                                */}
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              {/* Remplissage : largeur = score %, couleur selon le score. */}
              <div
                className={`h-full rounded-full ${scoreColor(report.security_score)}`}
                style={{ width: `${report.security_score}%` }}
              />
            </div>
            {/* Valeur chiffree du score.                                 */}
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {report.security_score} / 100
            </p>
          </div>
        </div>
      </div>

      {/* ---- Resume executif ------------------------------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="mb-2 font-bold text-brand">Executive summary</h2>
        {/* Texte du resume.                                              */}
        <p className="text-sm text-gray-600">{report.summary}</p>
      </div>

      {/* ---- Tableau des vulnerabilites identifiees -------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="mb-3 font-bold text-brand">Vulnerabilities identified</h2>
        {/* Tableau (defilement horizontal si besoin).                    */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            {/* En-tete du tableau.                                       */}
            <thead className="bg-brand-soft text-gray-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Severity</th>
                <th className="px-3 py-2 font-semibold">Asset</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Recommendation</th>
              </tr>
            </thead>
            {/* Corps : une ligne par vulnerabilite.                      */}
            <tbody>
              {report.findings.map((finding, index) => (
                // Cle = index (les vulnerabilites d'un rapport sont fixes).
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  {/* Severite, affichee dans une pastille coloree.       */}
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityClasses(finding.severity)}`}
                    >
                      {finding.severity}
                    </span>
                  </td>
                  {/* Actif concerne.                                     */}
                  <td className="px-3 py-2 text-gray-700">{finding.asset}</td>
                  {/* Description de la vulnerabilite.                    */}
                  <td className="px-3 py-2 text-gray-600">
                    {finding.description}
                  </td>
                  {/* Recommandation associee.                            */}
                  <td className="px-3 py-2 text-gray-600">
                    {finding.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Plan d'action sur 30 jours -------------------------------- */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Titre de la section.                                          */}
        <h2 className="mb-3 font-bold text-brand">30-day action plan</h2>
        {/* Liste des etapes hebdomadaires.                               */}
        <ul className="flex flex-col gap-2">
          {report.action_plan.map((step, index) => (
            // Cle = index (le plan d'action est fixe).
            <li key={index} className="flex gap-3 text-sm">
              {/* Etiquette de la semaine, en violet.                     */}
              <span className="w-20 shrink-0 font-semibold text-brand">
                {step.week}
              </span>
              {/* Action prevue pour cette semaine.                       */}
              <span className="text-gray-700">{step.action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
