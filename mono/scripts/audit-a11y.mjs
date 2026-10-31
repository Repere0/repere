// Audit statique d'accessibilité des écrans (V42, bloc 3). Lit le JSX de apps/mobile/src/app avec
// l'analyseur TypeScript du projet. Ne rend rien et n'utilise aucun appareil : ce qu'il mesure, c'est
// ce que le code déclare. Usage : node scripts/audit-a11y.mjs [--json]
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = createRequire(path.join(RACINE, "apps/mobile/package.json"))("typescript");
const DOSSIERS = [path.join(RACINE, "apps/mobile/src/app"), path.join(RACINE, "apps/mobile/src/ui"), path.join(RACINE, "apps/mobile/src/lib")];
const HORS_AUDIT = new Set(["_layout.tsx", "dev-impact.tsx"]);
// Éléments interactifs natifs, et composants maison qui nomment leur élément eux-mêmes (lib/composants.tsx).
const INTERACTIFS = new Set(["Pressable", "TouchableOpacity", "TouchableHighlight", "TouchableWithoutFeedback"]);
const COMPOSANTS_NOMMES = new Set(["LienSortant"]);
const COMPOSANTS_AVEC_TEXTE = new Set(["Bouton"]); // nom = prop `texte`, rôle = button (lib/composants.tsx)
void COMPOSANTS_AVEC_TEXTE;

function fichiers(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) return fichiers(p);
    return (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) && !HORS_AUDIT.has(e.name) ? [p] : [];
  });
}

function aDuTexte(noeuds) {
  let ok = false;
  const visite = x => {
    if (ok) return;
    if (ts.isJsxText(x) && x.text.trim()) ok = true;
    else if (ts.isJsxExpression(x) && x.expression) ok = true;
    else ts.forEachChild(x, visite);
  };
  for (const n of noeuds) visite(n);
  return ok;
}

function auditer(fichier) {
  const texte = readFileSync(fichier, "utf8");
  const sf = ts.createSourceFile(fichier, texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const res = { fichier: path.relative(RACINE, fichier), interactifs: 0, sansNom: [], sansRole: [], images: 0, imagesSansEtiquette: [], champsSansEtiquette: [] };
  const ligne = n => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const attributs = n => new Map(n.attributes.properties.filter(ts.isJsxAttribute).map(a => [a.name.getText(sf), a]));
  const visite = n => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText(sf);
      const at = attributs(n);
      const parent = ts.isJsxOpeningElement(n) ? n.parent : null;
      const enfants = parent ? parent.children : [];
      // Un composant maison avec onPress n'est pas compté ici : il est audité là où il est défini,
      // sur son Pressable natif (voir lib/composants.tsx et les fonctions locales des écrans).
      if (INTERACTIFS.has(tag)) {
        res.interactifs++;
        const nomme = at.has("accessibilityLabel") || aDuTexte(enfants);
        if (!nomme) res.sansNom.push({ ligne: ligne(n), tag });
        if (!at.has("accessibilityRole")) res.sansRole.push({ ligne: ligne(n), tag });
      } else if (COMPOSANTS_NOMMES.has(tag) || COMPOSANTS_AVEC_TEXTE.has(tag)) {
        res.interactifs++;
      }
      if (tag === "Image") {
        res.images++;
        if (!at.has("accessibilityLabel") && !at.has("accessible")) res.imagesSansEtiquette.push({ ligne: ligne(n) });
      }
      if (tag === "TextInput" && !at.has("accessibilityLabel")) res.champsSansEtiquette.push({ ligne: ligne(n) });
    }
    ts.forEachChild(n, visite);
  };
  visite(sf);
  // Verdict : FAIL = élément interactif sans nom accessible. Les rôles manquants et les images
  // sans étiquette sont des réserves, à trancher (décoratif ou informatif) : elles ne font pas échouer.
  const echecs = res.sansNom.length + res.champsSansEtiquette.length;
  res.verdict = echecs ? "FAIL" : (res.sansRole.length || res.imagesSansEtiquette.length ? "PASS (réserves)" : "PASS");
  return res;
}

const resultats = DOSSIERS.flatMap(fichiers).map(auditer).sort((a, b) => a.fichier.localeCompare(b.fichier));
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(resultats, null, 2));
} else {
  for (const r of resultats) {
    console.log(`${r.verdict.padEnd(16)} ${r.fichier}  interactifs=${r.interactifs} sansNom=${r.sansNom.length} sansRole=${r.sansRole.length} images=${r.images} imagesSansEtiquette=${r.imagesSansEtiquette.length} champs=${r.champsSansEtiquette.length}`);
  }
  const compte = v => resultats.filter(r => r.verdict.startsWith(v)).length;
  console.log(`\n${resultats.length} écrans : ${compte("PASS")} PASS (dont ${resultats.filter(r => r.verdict.includes("réserves")).length} avec réserves), ${compte("FAIL")} FAIL`);
}
