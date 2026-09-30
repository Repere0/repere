/* OU L'APPLICATION MOBILE LIT SES DONNEES — 29/09/2026.
 *
 * Les memes fichiers statiques que le site, publies chaque jour par la chaine
 * (outils/pipeline.sh). Aucun serveur applicatif (decision 1 du monorepo) :
 * le telephone lit un fichier par departement, jamais par commune
 * (invariant 2). La base est verifiee par `configurerBase`, qui refuse une
 * adresse portant un code de commune.
 *
 * EXPO_PUBLIC_REPERE_DONNEES permet de pointer une copie locale (tests,
 * apercu web) ; par defaut, les donnees publiees en production. */
import { configurerBase } from "@repere/data-utils";
import { brancherCacheDisque } from "./cache";

const PRODUCTION = "https://repereapp.netlify.app/data";
configurerBase(process.env.EXPO_PUBLIC_REPERE_DONNEES || PRODUCTION);
/* Les fichiers publics recus restent sur le telephone, sous la garde du
   magasin partage (lib/cache.ts) : hors ligne, le lecteur retrouve son
   departement ; en ligne, un fichier d'une generation precedente est
   redemande (packages/data-utils/src/client.js). */
brancherCacheDisque();

export * from "@repere/data-utils";
