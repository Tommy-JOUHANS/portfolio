// ========================================================================
// authService.js - Couche d'acces aux donnees d'authentification.
//
// IMPORTANT : c'est une BASE DE DONNEES TEMPORAIRE cote front.
// En attendant le backend Django de James (endpoints /api/auth/ de la doc),
// les comptes sont :
//   - charges depuis src/data/users.json (donnees de demonstration) ;
//   - persistes dans le localStorage du navigateur (inscriptions, session).
// Quand le backend sera pret, il suffira de remplacer le corps de ces
// fonctions par des appels HTTP (axios) vers l'API REST, sans toucher a l'UI.
//
// NOTE DE SECURITE : ici le mot de passe est compare en clair (mock front).
// Le vrai backend hashera le mot de passe (PBKDF2/Argon2) et delivrera un
// vrai JWT signe. Le jeton genere ci-dessous est donc un FAUX jeton de demo.
// ========================================================================

// Importe les comptes de demonstration (Marie cliente, Karim admin).
import seedUsers from "../data/users.json";

// Cle de stockage : tableau de tous les utilisateurs connus.
const USERS_KEY = "cyberaudit:users";
// Cle de stockage : session courante (jeton + utilisateur connecte).
const SESSION_KEY = "cyberaudit:session";

// ------------------------------------------------------------------------
// ensureSeed : recopie users.json dans le localStorage au premier lancement.
// ------------------------------------------------------------------------
function ensureSeed() {
  // On lit le contenu actuel du localStorage pour la cle des utilisateurs.
  const existing = localStorage.getItem(USERS_KEY);
  // Si rien n'existe encore, on initialise avec les comptes de demo.
  if (!existing) {
    // JSON.stringify transforme le tableau en texte stockable.
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
  }
}

// ------------------------------------------------------------------------
// readUsers : retourne la liste complete des utilisateurs (tableau d'objets).
// ------------------------------------------------------------------------
function readUsers() {
  // On s'assure que les donnees de demo sont bien presentes.
  ensureSeed();
  // On relit le texte JSON puis on le reconvertit en tableau JavaScript.
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// ------------------------------------------------------------------------
// writeUsers : enregistre la liste des utilisateurs dans le localStorage.
// ------------------------------------------------------------------------
function writeUsers(users) {
  // On serialise le tableau en texte avant de l'ecrire.
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ------------------------------------------------------------------------
// makeFakeToken : fabrique un FAUX jeton facon JWT (header.payload.signature).
// Sert uniquement a simuler le comportement du backend en attendant l'API.
// ------------------------------------------------------------------------
function makeFakeToken(user) {
  // Partie 1 : l'en-tete JWT, encode en base64 (btoa).
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  // Partie 2 : la charge utile, avec l'id, le role et l'email de l'utilisateur.
  const payload = btoa(
    JSON.stringify({
      sub: user.id, // identifiant unique de l'utilisateur
      role: user.role, // role : "client" ou "admin"
      email: user.email, // email de l'utilisateur
      iat: Date.now(), // date d'emission du jeton (timestamp)
    }),
  );
  // Partie 3 : une fausse signature (le vrai backend signe avec une cle secrete).
  const signature = btoa("mock-signature-frontend-only");
  // On assemble les 3 parties separees par des points, comme un vrai JWT.
  return `${header}.${payload}.${signature}`;
}

// ------------------------------------------------------------------------
// toPublicUser : construit une copie de l'utilisateur SANS le mot de passe.
// On ne recopie explicitement que les champs surs a exposer a l'interface.
// ------------------------------------------------------------------------
function toPublicUser(user) {
  // On retourne un nouvel objet contenant uniquement les champs publics.
  return {
    id: user.id, // identifiant unique
    email: user.email, // adresse email
    first_name: user.first_name, // prenom
    last_name: user.last_name, // nom de famille
    role: user.role, // role : "client" ou "admin"
    company_name: user.company_name, // raison sociale
    created_at: user.created_at, // date de creation du compte
    is_active: user.is_active, // compte actif ou non
  };
}

// ------------------------------------------------------------------------
// register : cree un nouveau compte client puis ouvre une session.
// Recoit { companyName, firstName, lastName, email, password }.
// Equivalent futur : POST /api/auth/register/ (voir doc section 6.2.1).
// ------------------------------------------------------------------------
export function register(form) {
  // On recupere la liste actuelle des utilisateurs.
  const users = readUsers();

  // On verifie qu'aucun compte n'utilise deja cet email (comparaison insensible
  // a la casse). Cote API ce serait une erreur 409 "email exists".
  const emailTaken = users.some(
    (u) => u.email.toLowerCase() === form.email.trim().toLowerCase(),
  );
  // Si l'email est deja pris, on stoppe avec une erreur explicite.
  if (emailTaken) {
    throw new Error("Un compte existe deja avec cet email.");
  }

  // On construit le nouvel utilisateur selon le schema USER de la doc (4.2).
  const newUser = {
    id: `usr-${Date.now()}`, // identifiant unique base sur l'horodatage
    email: form.email.trim(), // email nettoye des espaces superflus
    password: form.password, // mot de passe (mock : sera hashe cote backend)
    first_name: form.firstName.trim(), // prenom
    last_name: form.lastName.trim(), // nom de famille
    role: "client", // une inscription cree toujours un compte "client"
    company_name: form.companyName.trim(), // raison sociale de l'entreprise
    created_at: new Date().toISOString(), // date de creation au format ISO
    is_active: true, // le compte est actif des sa creation
  };

  // On ajoute le nouvel utilisateur a la liste puis on enregistre le tout.
  users.push(newUser);
  writeUsers(users);

  // On ouvre immediatement une session pour le nouvel inscrit.
  return startSession(newUser);
}

// ------------------------------------------------------------------------
// login : verifie les identifiants puis ouvre une session.
// Equivalent futur : POST /api/auth/login/ (voir doc section 6.2.1).
// ------------------------------------------------------------------------
export function login(email, password) {
  // On recupere la liste des utilisateurs connus.
  const users = readUsers();

  // On cherche un utilisateur dont l'email correspond (insensible a la casse).
  const found = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );

  // Email inconnu OU mot de passe errone -> meme message (anti-enumeration).
  if (!found || found.password !== password) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  // Compte desactive -> connexion refusee meme si les identifiants sont bons.
  if (!found.is_active) {
    throw new Error("Ce compte est desactive.");
  }

  // Identifiants valides : on ouvre une session pour cet utilisateur.
  return startSession(found);
}

// ------------------------------------------------------------------------
// startSession : genere le jeton, memorise la session et la retourne.
// (Fonction interne, utilisee par register() et login()).
// ------------------------------------------------------------------------
function startSession(user) {
  // On fabrique le faux jeton JWT correspondant a cet utilisateur.
  const token = makeFakeToken(user);
  // La session contient le jeton et l'utilisateur SANS son mot de passe.
  const session = { token, user: toPublicUser(user) };
  // On persiste la session dans le localStorage (l'utilisateur reste connecte
  // meme apres un rafraichissement de la page).
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // On retourne la session a l'appelant (le contexte d'authentification).
  return session;
}

// ------------------------------------------------------------------------
// logout : ferme la session en cours.
// Equivalent futur : POST /api/auth/logout/ (voir doc section 6.2.1).
// ------------------------------------------------------------------------
export function logout() {
  // On supprime simplement la session memorisee dans le localStorage.
  localStorage.removeItem(SESSION_KEY);
}

// ------------------------------------------------------------------------
// getSession : relit la session sauvegardee (ou null si personne connecte).
// Appelee au demarrage de l'appli pour restaurer l'etat de connexion.
// ------------------------------------------------------------------------
export function getSession() {
  // On lit le texte brut stocke sous la cle de session.
  const raw = localStorage.getItem(SESSION_KEY);
  // S'il existe, on le reconvertit en objet ; sinon on renvoie null.
  return raw ? JSON.parse(raw) : null;
}
