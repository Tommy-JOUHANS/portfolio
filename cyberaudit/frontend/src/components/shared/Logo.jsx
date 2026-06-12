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
        className="flex items-left justify-left rounded-full bg-[#0b2e6b] ring-2 ring-white/70 shadow-md"
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
    <div
      className="rounded-full overflow-hidden ring-2 ring-white/70 shadow-md flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Logo CyberAudit & Solutions"
    >
      <img
        src="/logo.png"
        alt="Logo CyberAudit & Solutions"
        onError={() => setImageFailed(true)}
        className="w-full h-full object-cover scale-[1.24] translate-y-[-5px]"
        style={{ 
          transformOrigin: "center center",
         }}
      />
    </div>
  );
}
