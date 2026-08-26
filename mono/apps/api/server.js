/* Serveur de DÉVELOPPEMENT — et rien d'autre.
 *
 * POURQUOI IL NE FAIT QUE SERVIR DES FICHIERS. L'invariant 1 dit que Repère
 * fonctionne sans serveur applicatif. Le squelette d'origine lisait le disque à
 * chaque requête (`fs.readFileSync` dans le gestionnaire) : c'est un serveur
 * applicatif, avec ce que ça implique — un hébergement à payer, des journaux
 * d'accès qui enregistrent des adresses IP (donnée personnelle au sens du RGPD),
 * et une panne possible entre le lecteur et sa mairie.
 *
 * En production, `data/` est publié tel quel par n'importe quel hébergeur
 * statique, et CE FICHIER NE TOURNE PAS. Il existe pour que `pnpm dev` serve les
 * mêmes chemins que la production, avec les mêmes en-têtes.
 *
 * Deux garde-fous quand même, parce qu'un serveur de dev finit toujours par être
 * copié ailleurs : aucun chemin ne sort de data/, et aucune adresse ne peut
 * porter un code de commune.
 */
import Fastify from "fastify";
import fs from "node:fs";
import path from "node:path";
import { adresseFautive } from "../../packages/data-utils/src/invariants.js";

const RACINE = path.resolve(process.cwd(), "../../data");
const app = Fastify({ logger: false });   /* pas de journal : rien à enregistrer */

app.addHook("onRequest", async (req, rep) => {
  if (adresseFautive(req.url)) {
    return rep.code(400).send({
      erreur: "adresse refusee",
      pourquoi: "une adresse ne doit jamais porter un code de commune : elle revelerait au serveur la commune de son lecteur. La maille est le departement.",
    });
  }
});

app.get("/data/index.json", async (req, rep) => {
  const f = path.join(RACINE, "index.json");
  if (!fs.existsSync(f)) return rep.code(404).send({ erreur: "index absent", quoi_faire: "lancer `pnpm extract`" });
  return rep.type("application/json").send(fs.readFileSync(f, "utf8"));
});

app.get("/data/departments/:code.json", async (req, rep) => {
  const code = String(req.params.code).toUpperCase();
  if (!/^(\d{2,3}|2[AB])$/.test(code)) {
    return rep.code(400).send({ erreur: "code de departement invalide", recu: code });
  }
  const f = path.join(RACINE, "departments", code + ".json");
  if (!fs.existsSync(f)) {
    /* 404 explicite : le client en fait une phrase differente de « le reseau a
       echoue », parce que ce n'est pas la meme chose pour le lecteur. */
    return rep.code(404).send({ erreur: "departement non publie", code });
  }
  return rep.type("application/json").send(fs.readFileSync(f, "utf8"));
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: "127.0.0.1" }, (e, adresse) => {
  if (e) { console.error(e); process.exit(1); }
  console.log("serveur de developpement : " + adresse + "  (racine : " + RACINE + ")");
  console.log("en production, ce serveur ne tourne pas : data/ est publie tel quel.");
});
