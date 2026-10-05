# Les contrôles — ce qui est vert, et ce que « vert » veut dire

*5/10/2026. Un banc vert sur une page cassée reste un banc vert : relire les captures.*

| commande (depuis `mono/`) | ce qu'elle mesure | où elle tourne |
|---|---|---|
| `node --test tests/core.test.mjs` | `@repere/core` en Node pur, sur données réelles quand `data/` existe | local, CI |
| `node --test tests/invariants.test.mjs` | les huit invariants dans le code écrit (`.js .jsx .ts .tsx .css .html…`, web ET mobile) | local, CI |
| `node tests/runtime.test.mjs apps/web/dist` | le site dans un navigateur, serveur éteint compris | local, CI |
| `cd apps/mobile && npx tsc --noEmit` | types de l'application mobile | local, CI (`Mobile`) |
| `cd apps/mobile && npx expo export --platform ios --platform android --platform web` | construction iOS, Android et web | CI (`Mobile`) |
| `node apps/mobile/tests/parcours-web.mjs URL` | parcours accueil → commune → retour à 360/390/430 px, pannes, adresses, cibles, accents | local, CI (`Mobile`) |
| `node tests/meme-verite.mjs SITE MOBILE` | même vérité entre le site et l'application | CI (`Mobile`) |

**Le mobile dispose désormais d'une chaîne GitHub dédiée** (`.github/workflows/mobile.yml`). Elle construit l'application, exécute le parcours navigateur et vérifie la même vérité avec le site. L'épreuve web (`.github/workflows/epreuve.yml`) reste la chaîne de publication.

Local, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, jamais `playwright install`.

Attention : certains contrôles de `runtime.test.mjs` dépendent des données du jour et ne sont donc pas reproductibles avec un extrait `mono/data` incomplet. La CI de référence collecte d'abord les données puis exécute l'épreuve ; un échec CI reste bloquant.

## Prouver une garde

Casser exprès, voir tirer, remettre (skill `prouver-une-garde`). Fait le 29/09/2026 pour :
la recherche (rang), l'accent de `REFUS_APPARIEMENT`, la palette et `titreLisible` dans du
TypeScript mobile, le `fetch` interdit dans `apps/mobile/src`, les accents affichés du
parcours mobile (qui **ne tirait pas** sur un titre en capitales — corrigé en lisant
`textContent`). Le contrôle d'accents du site lit `innerText` : même angle mort possible
sur les titres en capitales (`.eyebrow`, `.tag`, `.tuile-k`, `.quest-lieu`), non corrigé.

## Gate bêta technique — 5 octobre 2026

La bêta interne ne doit pas être déclarée prête sur la seule base d'un build.

### Obligatoire avant les premiers testeurs
- les PR produit critiques passent **Épreuve** et, lorsqu'elles touchent le mobile, **Mobile** ;
- accueil → commune → « Aujourd'hui » → retour fonctionne ;
- aucune URL/requête ne contient le code de commune ;
- la mémoire locale n'existe qu'après demande explicite et peut être oubliée ;
- une panne partielle est distinguée d'une absence réelle de données ;
- une donnée conservée hors ligne n'est jamais présentée comme fraîche sans vérification ;
- sources, dates de publication et dates de traitement restent accessibles ;
- les parcours 360/390/430 px passent ;
- un iPhone et un Android réels passent le parcours principal ;
- VoiceOver/TalkBack et taille de texte agrandie sont vérifiés avant le pilote.

### À vérifier sur données réelles
- commune avec projet financé ;
- commune sans projet ;
- commune au nom long ;
- données partielles ;
- circonscription multiple ;
- partage natif, avec vérification qu'aucune donnée locale ou identifiant technique ne fuit.

### Hors gate technique
Juridique, politique éditoriale, tracking, monétisation, stores, dépenses et lancement public restent des décisions du porteur.
