/* LES DONNEES PUBLIQUES, GARDEES SUR LE TELEPHONE — 30/09/2026.
 *
 * DECISION DU PORTEUR (30/09/2026) : l'application peut garder sur le
 * telephone les fichiers publics que Repere publie sous /data — l'index, le
 * departement, ses projets, ses votes, les deputes, le calendrier. Rien
 * d'autre. C'est la meme clause que pour IndexedDB sur le site.
 *
 * CE FICHIER N'A PAS DE GARDE A LUI. Il est branche sous `magasin`
 * (packages/data-utils/src/store.js), dont `ecrire` refuse, AVANT d'appeler ce
 * support, toute cle qui n'est pas `dep|vote|reg|proj|socle:XXX` et toute
 * valeur qui porte une trace du lecteur. Un seul endroit decide de ce qui peut
 * etre garde sur un appareil ; ce fichier-ci ne fait que l'ecrire. Il revalide
 * quand meme le nom de chaque fichier : aucun chemin compose ici ne peut sortir
 * de son dossier.
 *
 * OU : le dossier CACHE de l'application, comme la commune retenue
 * (lib/memoire.ts). iOS et Android l'excluent des sauvegardes, et peuvent le
 * vider s'ils manquent de place : l'application retelecharge alors, rien
 * d'autre. Ce que ce dossier revele, sur le telephone seulement : quels
 * departements ont ete consultes. Rien n'en sort.
 *
 * SUR LA VERSION WEB DE L'APPLICATION (apercu, tests), ce fichier n'est pas
 * branche : le magasin partage utilise IndexedDB, sous la meme garde. */
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import { configurerStockage } from "@repere/data-utils";

const CLE = /^(dep|vote|reg|proj|socle):[0-9A-Z]{1,3}$/;
const dossier = () => new Directory(Paths.cache, "repere-donnees");
const nomDe = (cle: string) => {
  if (!CLE.test(cle)) throw new Error("cle refusee : " + cle);
  return cle.replace(":", "-") + ".json";
};
const fichier = (cle: string) => new File(dossier(), nomDe(cle));

export const stockageDisque = {
  async lire(cle: string): Promise<unknown> {
    const f = fichier(cle);
    if (!f.exists) return undefined;
    return JSON.parse(await f.text());
  },
  async ecrire(cle: string, valeur: unknown): Promise<void> {
    const d = dossier();
    if (!d.exists) d.create({ intermediates: true });
    const f = fichier(cle);
    if (!f.exists) f.create();
    f.write(JSON.stringify(valeur));
  },
  async cles(): Promise<string[]> {
    const d = dossier();
    if (!d.exists) return [];
    return d.list()
      .map(x => x.name.replace(/\.json$/, "").replace("-", ":"))
      .filter(c => CLE.test(c));
  },
  async vider(): Promise<void> {
    const d = dossier();
    if (d.exists) d.delete();
  },
};

/* Branche au demarrage, avant tout chargement (lib/donnees.ts). */
export function brancherCacheDisque(): void {
  if (Platform.OS !== "web") configurerStockage(stockageDisque);
}
