/* SE SOUVENIR DE LA COMMUNE, SUR CE TELEPHONE SEULEMENT — 29/09/2026 (D-M3).
 *
 * CE QUI EST GARDE : deux codes publics, { d: "77", c: "77284" } — le
 * departement et la commune. Ni nom, ni date, ni historique, ni identifiant.
 * CE QUI N'EST JAMAIS FAIT : l'envoyer. Aucune requete ne porte ce code
 * (invariant 2 : les adresses se composent par departement, dans client.js).
 * QUAND : seulement si le lecteur le demande (« Retenir … sur ce téléphone »),
 * et il peut l'oublier d'un geste. Rien n'est retenu par defaut.
 *
 * OU :
 *   - iOS / Android : un fichier dans le dossier CACHE de l'application. Les
 *     deux systemes excluent ce dossier des sauvegardes (iCloud, sauvegarde
 *     Google) : la commune ne quitte pas le telephone par ce chemin. Le prix :
 *     le systeme peut vider ce dossier s'il manque de place ; le lecteur
 *     retape alors sa commune. Aucun autre effet.
 *   - version web de l'application (tests, apercu) : la cle localStorage
 *     unique du produit, la meme que le site.
 * UNE SEULE CLE, UN SEUL FICHIER : un controle d'invariants refuse tout autre
 * stockage dans apps/mobile/src (AsyncStorage, SecureStore, SQLite…).
 *
 * Chaque lecture est validee : une valeur mal formee est effacee et traitee
 * comme absente, jamais affichee. */
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import { departementDe } from "@repere/core";

export const CLE = "repere.departement";
export type Retenue = { d: string; c: string };

const DEP = /^(\d{2,3}|2[AB])$/;
const COMMUNE = /^(\d{5}|2[AB]\d{3})$/;
export function valide(v: unknown): Retenue | null {
  if (!v || typeof v !== "object") return null;
  const { d, c } = v as { d?: unknown; c?: unknown };
  if (typeof d !== "string" || typeof c !== "string" || !DEP.test(d) || !COMMUNE.test(c)) return null;
  /* la commune doit appartenir au departement retenu : « 97101 » va avec 971, pas 97 */
  if (departementDe(c) !== d) return null;
  return { d, c };
}

const fichier = () => new File(Paths.cache, CLE + ".json");

function lireBrut(): string | null {
  if (Platform.OS === "web") {
    try { return globalThis.localStorage.getItem(CLE); } catch { return null; }
  }
  const f = fichier();
  return f.exists ? f.textSync() : null;
}

export function oublier(): void {
  try {
    if (Platform.OS === "web") globalThis.localStorage.removeItem(CLE);
    else {
      const f = fichier();
      if (f.exists) f.delete();
    }
  } catch { /* rien a oublier, ou deja oublie */ }
  /* V26 : « Oublier » efface aussi les reglages de lecture gardes sur cet appareil. */
  effacerProfil();
}

export function lire(): Retenue | null {
  try {
    const brut = lireBrut();
    if (!brut) return null;
    const r = valide(JSON.parse(brut));
    if (!r) oublier();
    return r;
  } catch {
    oublier();
    return null;
  }
}

/* Rend true si la commune est reellement retenue, false sinon : l'ecran ne
   dit « retenue » que si l'ecriture a eu lieu et se relit. */
export function retenir(r: Retenue): boolean {
  const v = valide(r);
  if (!v) return false;
  try {
    const texte = JSON.stringify(v);
    if (Platform.OS === "web") globalThis.localStorage.setItem(CLE, texte);
    else {
      const f = fichier();
      if (!f.exists) f.create();
      f.write(texte);
    }
    const relu = lire();
    return !!relu && relu.c === v.c;
  } catch {
    return false;
  }
}

/* LE PROFIL DE LECTURE (V26, bloc 1, ADR 0006) : seconde et derniere cle de ce fichier.
 * Meme mecanisme que la commune : localStorage sur le web, fichier du dossier cache sur
 * le telephone. Il ne porte que des reglages de lecture (valides par @repere/core). */
export const CLE_PROFIL = "repere.profil";
const fichierProfil = () => new File(Paths.cache, CLE_PROFIL + ".json");

function lireProfilBrut(): string | null {
  if (Platform.OS === "web") {
    try { return globalThis.localStorage.getItem(CLE_PROFIL); } catch { return null; }
  }
  const f = fichierProfil();
  return f.exists ? f.textSync() : null;
}

/* null = absent (jamais repondu, ou illisible : efface et traite comme absent). */
export function lireProfilGarde(): unknown {
  try {
    const brut = lireProfilBrut();
    if (!brut) return null;
    return JSON.parse(brut);
  } catch {
    effacerProfil();
    return null;
  }
}

export function effacerProfil(): void {
  try {
    if (Platform.OS === "web") { globalThis.localStorage.removeItem(CLE_PROFIL); return; }
    const f = fichierProfil();
    if (f.exists) f.delete();
  } catch { /* rien a effacer */ }
}

/* Ecrit le texte deja valide, et rend true seulement s'il se relit a l'identique. */
export function ecrireProfilGarde(texte: string): boolean {
  try {
    if (Platform.OS === "web") globalThis.localStorage.setItem(CLE_PROFIL, texte);
    else {
      const f = fichierProfil();
      if (!f.exists) f.create();
      f.write(texte);
    }
    return lireProfilBrut() === texte;
  } catch {
    return false;
  }
}
