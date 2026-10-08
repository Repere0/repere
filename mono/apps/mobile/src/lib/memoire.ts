/* SE SOUVENIR DE LA COMMUNE, SUR CE TELEPHONE SEULEMENT — 29/09/2026 (D-M3).
 *
 * CE QUI EST GARDE : deux codes publics, { d: "77", c: "77284" } — le
 * departement et la commune — et, SI LA PROPOSITION DU 08/10/2026 EST VALIDEE,
 * le jour de la derniere ouverture ({ v: "2026-10-08" }), jamais une heure.
 * Ni nom, ni historique, ni compteur, ni identifiant.
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
/* `v` (PROPOSITION DU 08/10/2026, a valider par le porteur) : le JOUR de la
   derniere ouverture de la commune retenue, "AAAA-MM-JJ", jamais une heure.
   Il n'existe que si la commune est retenue, vit dans le meme fichier, part avec
   elle (« Oublier »), et ne quitte jamais le telephone. Il sert a une seule
   chose : « Depuis votre visite du … ». */
export type Retenue = { d: string; c: string; v?: string };
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

const DEP = /^(\d{2,3}|2[AB])$/;
const COMMUNE = /^(\d{5}|2[AB]\d{3})$/;
export function valide(v: unknown): Retenue | null {
  if (!v || typeof v !== "object") return null;
  const { d, c, v: jour } = v as { d?: unknown; c?: unknown; v?: unknown };
  if (typeof d !== "string" || typeof c !== "string" || !DEP.test(d) || !COMMUNE.test(c)) return null;
  if (jour !== undefined && (typeof jour !== "string" || !JOUR.test(jour))) return null;
  if (Object.keys(v as object).some(k => !["d", "c", "v"].includes(k))) return null;
  /* la commune doit appartenir au departement retenu : « 97101 » va avec 971, pas 97 */
  if (departementDe(c) !== d) return null;
  return jour ? { d, c, v: jour } : { d, c };
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
    if (Platform.OS === "web") { globalThis.localStorage.removeItem(CLE); return; }
    const f = fichier();
    if (f.exists) f.delete();
  } catch { /* rien a oublier, ou deja oublie */ }
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
function ecrire(v: Retenue): void {
  const texte = JSON.stringify(v);
  if (Platform.OS === "web") globalThis.localStorage.setItem(CLE, texte);
  else {
    const f = fichier();
    if (!f.exists) f.create();
    f.write(texte);
  }
}

export function retenir(r: Retenue): boolean {
  const v = valide(r);
  if (!v) return false;
  try {
    ecrire(v);
    const relu = lire();
    return !!relu && relu.c === v.c;
  } catch {
    return false;
  }
}

/* LA VISITE (proposition du 08/10/2026). Si `c` est la commune retenue : rend le
   jour de la visite PRECEDENTE (ou null s'il n'y en a pas), et range celui
   d'aujourd'hui a sa place. Sinon : ne range rien, et rend null. Rien d'autre
   n'est garde : ni heure, ni historique, ni compteur. */
export function marquerVisite(c: string, aujourdhui: string): string | null {
  const r = lire();
  if (!r || r.c !== c || !JOUR.test(aujourdhui)) return null;
  const precedente = r.v || null;
  if (precedente === aujourdhui) return precedente;
  ecrire({ d: r.d, c: r.c, v: aujourdhui });
  return precedente;
}
