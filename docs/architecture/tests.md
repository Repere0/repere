# Les contrôles — ce qui est vert, et ce que « vert » veut dire

*29/09/2026. Un banc vert sur une page cassée reste un banc vert : relire les captures.*

| commande (depuis `mono/`) | ce qu'elle mesure | où elle tourne |
|---|---|---|
| `node --test tests/core.test.mjs` | `@repere/core` en Node pur, sur données réelles quand `data/` existe | local, CI |
| `node --test tests/invariants.test.mjs` | les huit invariants dans le code écrit (`.js .jsx .ts .tsx .css .html…`, web ET mobile) | local, CI |
| `node tests/runtime.test.mjs apps/web/dist` | le site dans un navigateur, serveur éteint compris | local, CI |
| `cd apps/mobile && npx tsc --noEmit` | types de l'application mobile | local seulement |
| `cd apps/mobile && npm run exporter` | l'app se construit pour iOS, Android, web | local seulement |
| `node apps/mobile/tests/parcours-web.mjs URL` | parcours accueil → commune → retour à 360/390/430 px, adresses, cibles, accents | local seulement |

**Le mobile n'est dans aucune chaîne GitHub aujourd'hui** (phase 1 de la feuille de route).

Local, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, jamais `playwright install`.

Attention : `runtime.test.mjs` échoue en local sur 3 contrôles (licence non confirmée,
teaser des scrutins) quand `mono/data` a été extrait sans les fichiers du jour
(`scrutins-solennels-recents.json` absent). Mesuré le 29/09/2026 : échecs identiques
avant et après les changements du jour ; l'épreuve CI, qui collecte, est verte.

## Prouver une garde

Casser exprès, voir tirer, remettre (skill `prouver-une-garde`). Fait le 29/09/2026 pour :
la recherche (rang), l'accent de `REFUS_APPARIEMENT`, la palette et `titreLisible` dans du
TypeScript mobile, le `fetch` interdit dans `apps/mobile/src`, les accents affichés du
parcours mobile (qui **ne tirait pas** sur un titre en capitales — corrigé en lisant
`textContent`). Le contrôle d'accents du site lit `innerText` : même angle mort possible
sur les titres en capitales (`.eyebrow`, `.tag`, `.tuile-k`, `.quest-lieu`), non corrigé.
