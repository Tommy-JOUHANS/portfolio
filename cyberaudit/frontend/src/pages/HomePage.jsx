// ========================================================================
// HomePage.jsx - Page d'accueil publique (ecran 1 de la doc : "Public
// Landing"). Presente l'entreprise, ses services et les 4 packs, puis
// invite le visiteur a creer un compte ou a se connecter.
// ========================================================================

// Link : lien de navigation interne (vers /register et /login).
import { Link } from "react-router-dom";
// Icones lucide-react illustrant chaque bloc de services.
import { Search, ShieldAlert, Radar, GraduationCap } from "lucide-react";

// ------------------------------------------------------------------------
// Donnees statiques : les 4 blocs de services presentes a droite de l'ecran.
// (Tableau de constantes pour generer les blocs via une boucle.)
// ------------------------------------------------------------------------
const SERVICES = [
  {
    icon: Search, // icone "loupe" pour l'audit
    title: "Risk audit & analysis", // titre du bloc
    items: [
      "Identification of vulnerabilities",
      "Risk analysis (EBIOS, ISO 27005)",
      "Clear and appropriate recommendations",
    ],
  },
  {
    icon: ShieldAlert, // icone "bouclier alerte" pour les incidents
    title: "Incident management & vulnerability fixing",
    items: ["Ransomware", "Intrusion", "Data leak", "Restoration after incident"],
  },
  {
    icon: Radar, // icone "radar" pour la surveillance SOC
    title: "System Protection & 24/7 Monitoring (SOC)",
    items: [
      "Attack detection",
      "Real-time alerts",
      "Quick response",
      "Access management (MFA, passwords, rights)",
      "Professional backups",
    ],
  },
  {
    icon: GraduationCap, // icone "diplome" pour la sensibilisation
    title: "Awareness",
    items: ["Anti-phishing", "Team training", "Simple and useful best practices"],
  },
];

// ------------------------------------------------------------------------
// Donnees statiques : les 4 packs de services affiches dans le tableau.
// ------------------------------------------------------------------------
const PACKS = [
  {
    name: "Pack Audit", // nom commercial du pack
    included: "Audit & Risk Analysis (EBIOS RM)", // services inclus
    forWhom: "SMEs new to cybersecurity", // public cible
    perimeter: "Initial assessment, vulnerability report", // perimetre
  },
  {
    name: "Pack Security",
    included: "Audit + Incident Management & Vulnerability Remediation",
    forWhom: "SMEs that have experienced an incident",
    perimeter: "Audit + remediation of detected vulnerabilities",
  },
  {
    name: "Pack Protection",
    included: "Audit + System Security & 24/7 SOC Monitoring",
    forWhom: "SMEs with sensitive data",
    perimeter: "Audit + Continuous Monitoring & Real-Time Alerts",
  },
  {
    name: "Pack Premium",
    included: "Audit + Incidents + SOC + Team Awareness",
    forWhom: "SMEs seeking comprehensive coverage",
    perimeter: "The most comprehensive all-in-one solution",
  },
];

// HomePage : composant de la page d'accueil.
export default function HomePage() {
  // Rendu de la page.
  return (
    // Section pleine largeur sur fond creme.
    <section className="bg-cream">
      {/* Conteneur centre a largeur maximale, avec marges interieures.   */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ---- Titre principal de la plateforme ------------------------ */}
        <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">
          CyberAudit &amp; Solution
        </h1>

        {/* ---- Disposition en 2 colonnes sur grand ecran --------------- */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* ===== Colonne de gauche : presentation et services ======== */}
          <div className="flex flex-col gap-6">
            {/* Bloc "Presentation de l'entreprise".                      */}
            <article className="rounded-xl bg-white p-6 shadow-sm">
              {/* Titre du bloc.                                          */}
              <h2 className="text-lg font-bold text-brand">
                Presentation of the company
              </h2>
              {/* Texte de presentation.                                  */}
              <p className="mt-2 text-sm text-gray-600">
                Our company supports organisations in two essential areas:
              </p>
              {/* Liste des deux domaines d'intervention.                 */}
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                <li>Cybersecurity audit</li>
                <li>The fixing of flows</li>
              </ul>
            </article>

            {/* Bloc "Nos services".                                      */}
            <article className="rounded-xl bg-white p-6 shadow-sm">
              {/* Titre du bloc.                                          */}
              <h2 className="text-lg font-bold text-brand">Our services</h2>
              {/* Texte de description.                                   */}
              <p className="mt-2 text-sm text-gray-600">
                We secure your data, modernize your IT, and simplify your daily
                life. With our all-in-one solution, you benefit from robust
                cybersecurity and comprehensive support.
              </p>
            </article>

            {/* Bloc d'appel a l'action : creer un compte / se connecter. */}
            <article className="rounded-xl bg-brand p-6 text-white shadow-sm">
              {/* Titre de l'encart.                                      */}
              <h2 className="text-lg font-bold">Ready to get started?</h2>
              {/* Texte incitatif.                                        */}
              <p className="mt-1 text-sm text-white/80">
                Create your account to submit an audit request and track it in
                real time.
              </p>
              {/* Deux boutons : inscription et connexion.                */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Bouton clair vers la page d'inscription.              */}
                <Link
                  to="/register"
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-white/90"
                >
                  Create an account
                </Link>
                {/* Bouton contour vers la page de connexion.             */}
                <Link
                  to="/login"
                  className="rounded-md border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </article>
          </div>

          {/* ===== Colonne de droite : les 4 blocs de services ========= */}
          <div className="flex flex-col gap-4">
            {/* On genere un bloc par service grace a une boucle map().   */}
            {SERVICES.map((service) => {
              // On stocke le composant icone dans une variable a majuscule
              // (obligatoire pour que React le traite comme un composant).
              const Icon = service.icon;
              // Rendu d'un bloc de service.
              return (
                // Cle unique = titre du service.
                <article
                  key={service.title}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  {/* Ligne titre : icone + intitule du service.          */}
                  <div className="flex items-center gap-2">
                    {/* Icone du service, en violet.                      */}
                    <Icon size={20} className="text-brand" />
                    {/* Titre du service.                                 */}
                    <h3 className="font-bold text-brand">{service.title}</h3>
                  </div>
                  {/* Liste a puces des prestations de ce service.        */}
                  <ul className="mt-2 list-disc pl-6 text-sm text-gray-600">
                    {/* Une puce par element du service.                  */}
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        {/* ---- Tableau des 4 packs proposes ---------------------------- */}
        <div className="mt-10">
          {/* Titre de la section packs.                                  */}
          <h2 className="text-xl font-bold text-brand">Our packages</h2>
          {/* Conteneur a defilement horizontal sur petits ecrans.        */}
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
            {/* Tableau HTML des packs.                                   */}
            <table className="w-full min-w-[640px] text-left text-sm">
              {/* En-tete du tableau, sur fond violet.                    */}
              <thead className="bg-brand text-white">
                <tr>
                  {/* Colonne 1 : nom du pack.                            */}
                  <th className="px-4 py-3 font-semibold">Pack</th>
                  {/* Colonne 2 : services inclus.                        */}
                  <th className="px-4 py-3 font-semibold">Included services</th>
                  {/* Colonne 3 : public cible.                           */}
                  <th className="px-4 py-3 font-semibold">For whom?</th>
                  {/* Colonne 4 : perimetre d'analyse.                    */}
                  <th className="px-4 py-3 font-semibold">Perimeter</th>
                </tr>
              </thead>
              {/* Corps du tableau : une ligne par pack.                  */}
              <tbody>
                {/* Boucle qui genere chaque ligne du tableau.            */}
                {PACKS.map((pack, index) => (
                  // Cle unique = nom du pack ; fond alterne pour la lisibilite.
                  <tr
                    key={pack.name}
                    className={index % 2 === 0 ? "bg-white" : "bg-cream"}
                  >
                    {/* Cellule 1 : nom du pack, en violet et en gras.    */}
                    <td className="px-4 py-3 font-semibold text-brand">
                      {pack.name}
                    </td>
                    {/* Cellule 2 : services inclus.                      */}
                    <td className="px-4 py-3 text-gray-600">{pack.included}</td>
                    {/* Cellule 3 : public cible.                         */}
                    <td className="px-4 py-3 text-gray-600">{pack.forWhom}</td>
                    {/* Cellule 4 : perimetre d'analyse.                  */}
                    <td className="px-4 py-3 text-gray-600">
                      {pack.perimeter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
