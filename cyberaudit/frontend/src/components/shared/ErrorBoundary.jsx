// ========================================================================
// ErrorBoundary.jsx - Barriere d'erreurs React.
// La doc technique (section "Component tree") indique : App enveloppe tout
// dans un ErrorBoundary "qui capture les erreurs JavaScript de ses enfants
// pour que l'application entiere ne plante pas".
//
// REMARQUE : une barriere d'erreurs DOIT etre un composant de CLASSE.
// React ne propose pas (encore) d'equivalent en hooks pour cette fonction.
// ========================================================================

// Component : la classe de base des composants React.
import { Component } from "react";

// ErrorBoundary herite de Component (composant de classe obligatoire ici).
export default class ErrorBoundary extends Component {
  // Constructeur : initialise l'etat interne du composant.
  constructor(props) {
    // super(props) transmet les props a la classe parente Component.
    super(props);
    // hasError : passe a true des qu'une erreur est capturee.
    this.state = { hasError: false };
  }

  // Methode statique appelee par React quand un enfant leve une erreur.
  // Elle retourne le nouvel etat a appliquer (ici : on note l'erreur).
  static getDerivedStateFromError() {
    // On bascule hasError a true pour afficher l'ecran de secours.
    return { hasError: true };
  }

  // componentDidCatch : appelee apres la capture ; sert a journaliser.
  componentDidCatch(error, info) {
    // En production on enverrait ceci a Sentry (cf. doc section 4.5.2) ;
    // ici on se contente d'un affichage dans la console du navigateur.
    console.error("ErrorBoundary a capture une erreur :", error, info);
  }

  // render : decrit ce que le composant affiche a l'ecran.
  render() {
    // Si une erreur a ete capturee, on affiche un ecran de secours.
    if (this.state.hasError) {
      return (
        // Conteneur centre avec un message rassurant pour l'utilisateur.
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream p-6 text-center">
          {/* Titre de l'ecran d'erreur, en violet de la charte.          */}
          <h1 className="text-2xl font-bold text-brand">
            Une erreur est survenue
          </h1>
          {/* Phrase d'explication pour l'utilisateur.                    */}
          <p className="text-gray-600">
            L'application a rencontre un probleme inattendu.
          </p>
          {/* Bouton qui recharge entierement la page pour repartir sain. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white transition hover:bg-brand-dark"
          >
            Recharger la page
          </button>
        </div>
      );
    }

    // Aucune erreur : on affiche normalement les composants enfants.
    return this.props.children;
  }
}
