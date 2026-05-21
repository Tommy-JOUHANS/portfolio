// ========================================================================
// Logo.jsx - Pastille circulaire de marque "CyberAudit & Solutions".
//
// Affiche l'image officielle du logo (public/logo.png) decoupee en cercle
// (border-radius 50% via la classe Tailwind "rounded-full").
// Si l'image est absente, un bouclier de secours est affiche a la place :
// l'interface reste donc correcte meme avant l'ajout du fichier image.
//
// >> POUR AFFICHER TON LOGO : enregistre ton image sous
//    frontend/public/logo.png  (Vite la sert automatiquement a l'URL /logo.png)
// ========================================================================

// useState : memorise si le chargement de l'image a echoue.
import { useState } from "react";
// ShieldCheck : icone bouclier utilisee comme logo de secours.
import { ShieldCheck } from "lucide-react";

// Logo recoit une prop "size" : le diametre du cercle en pixels (defaut 52).
export default function Logo({ size = 52 }) {
  // imageFailed : passe a true si /logo.png n'a pas pu etre charge.
  const [imageFailed, setImageFailed] = useState(false);

  // --- Cas de secours : aucune image disponible -------------------------
  // Tant que public/logo.png n'existe pas, on affiche un bouclier stylise.
  if (imageFailed) {
    return (
      <div
        // Cercle bleu nuit, contenu centre, anneau clair et ombre douce.
        className="flex items-center justify-center rounded-full bg-[#0b2e6b] ring-2 ring-white/70 shadow-md"
        // Taille dynamique appliquee en style en ligne.
        style={{ width: size, height: size }}
        // Texte d'accessibilite pour les lecteurs d'ecran.
        aria-label="Logo CyberAudit & Solutions"
      >
        {/* Icone bouclier blanche, dimensionnee a ~55% du cercle.        */}
        <ShieldCheck size={size * 0.55} color="#ffffff" strokeWidth={2.2} />
      </div>
    );
  }

  // --- Cas normal : on affiche l'image officielle du logo ---------------
  return (
    <img
      // Source : fichier place dans public/ et servi a la racine du site.
      src="/logo.png"
      // Texte alternatif (accessibilite + affichage si l'image manque).
      alt="Logo CyberAudit & Solutions"
      // Largeur/hauteur intrinseques de l'element image.
      width={size}
      height={size}
      // onError : si le fichier est introuvable, on bascule sur le secours.
      onError={() => setImageFailed(true)}
      // rounded-full = border-radius 50% (cercle parfait demande).
      // object-cover = l'image remplit le cercle sans deformation.
      className="rounded-full object-cover ring-2 ring-white/70 shadow-md"
      // Taille dynamique appliquee en style en ligne.
      style={{ width: size, height: size }}
    />
  );
}
