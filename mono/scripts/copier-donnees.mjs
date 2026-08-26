/* Copie data/ dans le dossier de build.
 *
 * POURQUOI UN SCRIPT ET PAS UNE COMMANDE. Le script de build appelait `xcopy`,
 * qui n'existe que sous Windows : la chaine publique, elle, tourne sous Linux,
 * et le build y echouait apres un `vite build` reussi — donc un dist/ sans
 * donnees, servi sans que rien ne le dise. Node sait copier un dossier ; c'est
 * la seule facon d'avoir la MEME commande sur les deux systemes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const source = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ICI, "..", "data");
const cible = process.argv[3] ? path.resolve(process.argv[3]) : path.join(ICI, "..", "apps", "web", "dist", "data");

if (!fs.existsSync(source)) {
  console.error(`donnees absentes : ${source} — lance \`pnpm extract\` avant \`pnpm build\``);
  process.exit(1);
}
fs.rmSync(cible, { recursive: true, force: true });
fs.cpSync(source, cible, { recursive: true });

let n = 0;
const compter = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) compter(path.join(d, e.name)); else n++;
  }
};
compter(cible);
console.log(`donnees : ${n} fichier(s) copie(s) vers ${path.relative(process.cwd(), cible) || cible}`);
