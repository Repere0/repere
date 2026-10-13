/* Non-regression — blocs shell de .github/workflows/collecte.yml.
 *
 * Defaut d'origine (12/10/2026) : dans l'etape « Publier sur Netlify », une
 * apostrophe a l'interieur de ${VAR:-...} entre guillemets doubles faisait
 * echouer l'analyse de bash APRES le deploiement reussi : sortie en code 2,
 * job rouge, diagnostic faux (« publication echouee » alors que le site etait
 * en ligne). bash lit le script ligne par ligne : tout ce qui precede la
 * ligne fautive s'execute, puis le script meurt.
 *
 * Deux controles :
 *   1. chaque bloc run: passe `bash -n` (analyse seule, rien n'est execute) ;
 *   2. le bloc de publication, execute avec un faux curl et un faux npx
 *      (aucun reseau, aucun Netlify), donne le bon code de sortie en cas de
 *      succes (0) et d'echec reel (1), sans « unexpected EOF ».
 *
 * PROUVER LE GARDE-FOU EN LE CASSANT : pointer le test vers la version
 * d'origine du workflow doit faire echouer les deux tests.
 *   COLLECTE_YML=<fichier d'origine> node --test tests/workflow-bash.test.mjs
 *
 * Usage : node --test tests/workflow-bash.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync, writeFileSync, mkdtempSync, mkdirSync, chmodSync, rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const YML = process.env.COLLECTE_YML
  || join(HERE, "..", "..", ".github", "workflows", "collecte.yml");

const BASH_DISPO = spawnSync("bash", ["-c", "exit 0"]).status === 0;

// Extrait chaque bloc « run: | » : numero de ligne et script desindente,
// exactement comme GitHub Actions l'ecrit dans un fichier temporaire.
function blocsRun(texte) {
  const lignes = texte.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lignes.length; i++) {
    const m = lignes[i].match(/^(\s*)run: \|\s*$/);
    if (!m) continue;
    const ind = m[1].length;
    const corps = [];
    let j = i + 1;
    while (j < lignes.length
      && (lignes[j].trim() === "" || lignes[j].search(/\S/) > ind)) {
      corps.push(lignes[j]);
      j++;
    }
    const non = corps.filter((l) => l.trim() !== "");
    const base = non.length ? Math.min(...non.map((l) => l.search(/\S/))) : 0;
    out.push({
      ligne: i + 1,
      script: corps.map((l) => (l.trim() ? l.slice(base) : "")).join("\n") + "\n",
    });
    i = j - 1;
  }
  return out;
}

function fauxOutil(dossier, nom, contenu) {
  const chemin = join(dossier, nom);
  writeFileSync(chemin, "#!/usr/bin/env bash\n" + contenu);
  chmodSync(chemin, 0o755);
}

test("workflow — chaque bloc run: a une syntaxe Bash valide (bash -n)", {
  skip: BASH_DISPO ? false : "bash introuvable : controle non executable",
}, () => {
  const blocs = blocsRun(readFileSync(YML, "utf8"));
  assert.ok(blocs.length >= 5, `blocs run: trouves : ${blocs.length} (attendu >= 5)`);
  const dossier = mkdtempSync(join(tmpdir(), "collecte-bash-"));
  try {
    for (const b of blocs) {
      const f = join(dossier, `bloc_l${b.ligne}.sh`);
      writeFileSync(f, b.script);
      const r = spawnSync("bash", ["-n", f], { encoding: "utf8" });
      assert.equal(r.status, 0,
        `bloc run: ligne ${b.ligne} de ${YML} ne passe pas bash -n : ${r.stderr.trim()}`);
    }
  } finally {
    rmSync(dossier, { recursive: true, force: true });
  }
});

test("publication Netlify — succes = code 0, echec reel = code 1, aucune erreur de syntaxe", {
  skip: process.platform === "win32" ? "faux npx/curl en shell POSIX uniquement"
    : (BASH_DISPO ? false : "bash introuvable"),
}, () => {
  const bloc = blocsRun(readFileSync(YML, "utf8"))
    .find((b) => b.script.includes("netlify-cli deploy"));
  assert.ok(bloc, "bloc de publication Netlify introuvable dans le workflow");

  for (const [mode, codeAttendu] of [["ok", 0], ["fail", 1]]) {
    const dossier = mkdtempSync(join(tmpdir(), "netlify-"));
    try {
      const bin = join(dossier, "bin");
      const tmp = join(dossier, "tmp");
      mkdirSync(bin);
      mkdirSync(tmp);
      fauxOutil(bin, "curl", "echo 200\n");
      fauxOutil(bin, "npx",
        'case "$*" in *--version*) echo 17.0.0; exit 0;; esac\n'
        + 'if [ "$FAKE_MODE" = ok ]; then echo "Deploy is live!"; exit 0; fi\n'
        + 'echo \'JSONHTTPError: 402 {"error":"Account credit usage exceeded"}\'\n'
        + "exit 1\n");
      const script = join(dossier, "bloc.sh");
      writeFileSync(script, bloc.script);
      const r = spawnSync("bash", ["-e", script], {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          RUNNER_TEMP: tmp,
          FAKE_MODE: mode,
          NETLIFY_AUTH_TOKEN: "jeton-de-test",
          NETLIFY_SITE_ID: "site-de-test",
        },
      });
      const sortie = `${r.stdout}${r.stderr}`;
      assert.equal(r.status, codeAttendu,
        `mode ${mode} : code ${r.status}, attendu ${codeAttendu}\n${sortie}`);
      assert.doesNotMatch(sortie, /unexpected EOF/,
        `mode ${mode} : erreur de syntaxe Bash apres le deploiement\n${sortie}`);
      if (mode === "fail") {
        assert.match(sortie, /::error title=Netlify refuse la publication::/,
          "l'echec reel doit produire son annotation d'erreur");
      }
    } finally {
      rmSync(dossier, { recursive: true, force: true });
    }
  }
});
