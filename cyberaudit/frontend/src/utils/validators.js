// ========================================================================
// validators.js - Fonctions de validation des formulaires d'authentification.
// Les regles proviennent directement de la doc technique Stage 3 (ecran 2) :
//  - chaque champ : 50 caracteres maximum
//  - champ manquant : message "Please enter the information on the form."
//  - email : format name@domain obligatoire
//  - mot de passe : 1 minuscule, 1 majuscule, 1 chiffre, 1 caractere special,
//    10 caracteres minimum
// ========================================================================

// Longueur maximale autorisee pour chaque champ texte (regle de la doc).
export const MAX_FIELD_LENGTH = 50;

// Longueur minimale exigee pour un mot de passe (regle de la doc).
export const MIN_PASSWORD_LENGTH = 10;

// Message affiche lorsqu'un champ obligatoire est laisse vide (texte exact
// impose par la doc technique, ecran 2 "Registration").
export const MISSING_FIELD_MESSAGE =
  "Please enter the information on the form.";

// ------------------------------------------------------------------------
// isRequired : verifie qu'une valeur n'est pas vide.
// Retourne true si la valeur contient au moins un caractere non blanc.
// ------------------------------------------------------------------------
export function isRequired(value) {
  // On convertit en chaine puis on retire les espaces de debut/fin.
  return typeof value === "string" && value.trim().length > 0;
}

// ------------------------------------------------------------------------
// isWithinMaxLength : verifie que la valeur ne depasse pas 50 caracteres.
// ------------------------------------------------------------------------
export function isWithinMaxLength(value, max = MAX_FIELD_LENGTH) {
  // Une valeur vide ou non-chaine est consideree comme valide ici
  // (le caractere obligatoire est gere separement par isRequired).
  if (typeof value !== "string") return true;
  // La longueur doit rester inferieure ou egale a la limite.
  return value.trim().length <= max;
}

// ------------------------------------------------------------------------
// isEmailValid : verifie le format d'une adresse email (name@domain.ext).
// ------------------------------------------------------------------------
export function isEmailValid(email) {
  // Securite : on rejette les valeurs non textuelles.
  if (typeof email !== "string") return false;
  // Expression reguliere : une partie locale, un @, un domaine, un point,
  // puis une extension ; aucun espace n'est autorise.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // test() renvoie true si l'email respecte le motif ci-dessus.
  return emailRegex.test(email.trim());
}

// ------------------------------------------------------------------------
// isPasswordStrong : verifie la robustesse du mot de passe (regle doc).
// ------------------------------------------------------------------------
export function isPasswordStrong(password) {
  // Securite : on rejette les valeurs non textuelles.
  if (typeof password !== "string") return false;
  // Regle 1 : longueur d'au moins 10 caracteres.
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  // Regle 2 : contient au moins une lettre minuscule.
  const hasLowercase = /[a-z]/.test(password);
  // Regle 3 : contient au moins une lettre majuscule.
  const hasUppercase = /[A-Z]/.test(password);
  // Regle 4 : contient au moins un chiffre.
  const hasDigit = /[0-9]/.test(password);
  // Regle 5 : contient au moins un caractere special (ni lettre ni chiffre).
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  // Le mot de passe est fort seulement si les 4 conditions sont reunies.
  return hasLowercase && hasUppercase && hasDigit && hasSpecial;
}

// ------------------------------------------------------------------------
// validateRegisterForm : valide l'ensemble du formulaire d'inscription.
// Recoit un objet { companyName, firstName, lastName, email, password }.
// Retourne un objet d'erreurs { champ: "message" } ; vide = aucun probleme.
// ------------------------------------------------------------------------
export function validateRegisterForm(form) {
  // Objet qui accumulera les messages d'erreur, champ par champ.
  const errors = {};

  // Liste des champs texte simples soumis aux regles "requis" + "<= 50".
  const textFields = ["companyName", "firstName", "lastName"];

  // On parcourt chaque champ texte pour appliquer les memes verifications.
  textFields.forEach((field) => {
    // Champ vide -> message standard impose par la doc.
    if (!isRequired(form[field])) {
      errors[field] = MISSING_FIELD_MESSAGE;
    // Champ trop long -> message specifique sur la limite de 50 caracteres.
    } else if (!isWithinMaxLength(form[field])) {
      errors[field] = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
    }
  });

  // Verification du champ email : d'abord present, puis bien formate.
  if (!isRequired(form.email)) {
    errors.email = MISSING_FIELD_MESSAGE;
  } else if (!isWithinMaxLength(form.email)) {
    errors.email = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
  } else if (!isEmailValid(form.email)) {
    errors.email = "Format attendu : nom@domaine.fr";
  }

  // Verification du champ mot de passe : present, puis suffisamment robuste.
  if (!isRequired(form.password)) {
    errors.password = MISSING_FIELD_MESSAGE;
  } else if (!isPasswordStrong(form.password)) {
    errors.password =
      "10 caracteres min., avec majuscule, minuscule, chiffre et caractere special.";
  }

  // On renvoie la liste des erreurs (objet vide si le formulaire est valide).
  return errors;
}

// ------------------------------------------------------------------------
// validateLoginForm : valide le formulaire de connexion (email + mot de passe).
// Connexion = on verifie surtout la presence ET le format de l'email.
// ------------------------------------------------------------------------
export function validateLoginForm(form) {
  // Objet qui accumulera les messages d'erreur.
  const errors = {};

  // Email : obligatoire puis correctement formate.
  if (!isRequired(form.email)) {
    errors.email = MISSING_FIELD_MESSAGE;
  } else if (!isEmailValid(form.email)) {
    errors.email = "Format attendu : nom@domaine.fr";
  }

  // Mot de passe : seule la presence est exigee a la connexion.
  if (!isRequired(form.password)) {
    errors.password = MISSING_FIELD_MESSAGE;
  }

  // On renvoie la liste des erreurs (objet vide si tout est correct).
  return errors;
}
