# Les contrôles — ce qui est vert, et ce que « vert » veut dire

*5/10/2026. Ce document décrit les contrôles réellement exécutés par GitHub, pas seulement ceux qu'un poste local peut lancer.*

| commande (depuis `mono/`) | ce qu'elle mesure | où elle tourne |
|---|---|---|
| `node --test tests/core.test.mjs` | `@repere/core` en Node pur, sur données réelles quand `data/` existe | local, CI |
| `node --test tests/invariants.test.mjs` | les huit invariants dans le code écrit (`.js .jsx .ts .tsx .css .html…`, web ET mobile) | local, CI |
| `node tests/runtime.test.mjs apps/web/dist` | le site dans un navigateur, serveur éteint compris | local, CI |
| `cd apps/mobile && npx tsc --noEmit` | types de l'application mobile | local, CI (`Mobile`) |
| `node --test tests/core.test.mjs tests/invariants.test.mjs tests/sante.test.mjs tests/donnees.test.mjs` | socle partagé et invariants, dont les contrôles qui relisent le site construit | local, CI (`Mobile`) |
| `cd apps/mobile && npx expo export --platform ios --platform android --platform web` | construction iOS, Android et web | CI (`Mobile`) |
| `node apps/mobile/tests/parcours-web.mjs URL` | parcours accueil → commune → retour à 360/390/430 px, pannes, adresses, cibles, accents | local, CI (`Mobile`) |
| `node tests/meme-verite.mjs SITE MOBILE` | même vérité entre le site et l'application | CI (`Mobile`) |

**Le mobile est désormais une chaîne GitHub dédiée** (`.github/workflows/mobile.yml`). Elle tourne sur `ubuntu-latest` pour les PR qui touchent le mobile, le socle partagé, les tests concernés, le site/UI ou le script d'extraction. Elle installe l'application avec le verrou exact, extrait les données du dépôt hors réseau, construit le site puis l'application iOS/Android/web, exécute le parcours navigateur et vérifie la « même vérité » entre web et mobile. L'épreuve web (`.github/workflows/epreuve.yml`) reste la chaîne PR de la publication et ignore uniquement les PR qui ne touchent que `apps/mobile`.

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
