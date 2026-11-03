# RESUME v7 — sprint V7 (décisions CEO + polish UX/UI), session du 30/10/2026

Branche : `test/sdk58-expo-go`. Chaque bloc validé a été poussé en avance rapide, sans force. `main` non touché. Pour les commits antérieurs (phases 0 à 5, Ponytail, À propos), voir `RESUME-v6.md`.

## 1. Commits de cette session (du plus ancien au plus récent)

| SHA | Message | Contenu |
|---|---|---|
| 460a9a1 | polish(elu): avatar premium sans dépendance + U+2019 | Avatar 64 px, bordure calculée, ombre, initiales par contraste ; D8 (`’`) ; D1 (pas de photo). |
| c17a45d | feat(branding): logo vectoriel Repère + intégration header/partage | `src/ui/logo.tsx` (vues React Native) ; en-tête, cartes de partage, À propos ; cartes en palette sombre `PALETTE_CARTE` (D5) ; contact conditionnel (D2) ; `docs/ux/logo.md`. |
| 9aa3e59 | docs(cette-semaine): structure du fichier, fichier vide hors git | `docs/cette-semaine.md` ; `mono/data/cette-semaine.json` créé mais **non commité** (voir section 3). |
| a3494da | docs(appstore): décisions V7 (catégorie, iPad, contact, photos, carte sombre) + blocages | `BLOCAGES.md` réécrit (D1 à D9) ; `APP_STORE_READINESS.md` ; `docs/app-store-metadata.md` (catégorie Actualités). |

Ce commit (RESUME v7) ajoute ce fichier et rien d'autre.

## 2. Décisions du CEO appliquées

| Décision | Statut |
|---|---|
| D1 Photos : aucune, avatars à initiales | ✅ |
| D2 Contact : placeholder documenté ; boutons seulement si `EXPO_PUBLIC_CONTACT_EMAIL` est défini | ✅ dans le code ; adresse réelle à fournir |
| D3 AMO30 : pas de téléchargement, procédure manuelle | ✅ procédure dans `BLOCAGES.md` section 1 ; fichier absent |
| D4 « Cette semaine » : fichier vide, structure documentée | ⚠️ fichier créé, non commité ; carte non faite |
| D5 Cartes de partage sombres | ✅ ; **inverse la règle « cartes claires » précédente** |
| D6 Identifiant `com.repere.app` : placeholder | ✅ documenté, non écrit dans `app.json` |
| D7 iPad hors bêta ; catégorie Actualités | ⚠️ catégorie ✅ ; `supportsTablet` reste `true` (question au CEO) |
| D8 U+2019 remplacé par `’` | ✅ |
| D9 Logo vectoriel React Native | ✅ ; icône PNG 1024 à régénérer par le CEO |

## 3. Écarts par rapport au brief, à connaître

- **Avatar** : les initiales ne sont pas toujours blanches. Elles prennent la couleur qui se lit sur le fond (`texteSur`). Le blanc sur une couleur de groupe claire serait illisible. Pas de dégradé (il demanderait une dépendance).
- **Logo** : pas de dégradé bleu-rouge (il rappellerait le drapeau), pas de couleur d'accent nouvelle (invariant 7). L'anneau intermédiaire est gris. Justification dans `docs/ux/logo.md`.
- **Cartes de partage** : sombres (D5). La règle « claire par défaut » est abandonnée. Vérifié par le code et les tests seulement.
- **`data/cette-semaine.json`** : créé dans `mono/data/`, **non commité**. `mono/.gitignore` exclut `data/`, et `collecte.yml` exige une PR relue pour tout nouvel artefact de `data/`. Il reste sur le disque.
- **Spécification « Cette semaine » incomplète** : le brief s'arrête au JSON. Aucune carte n'est faite.
- **Logo dans une capture pleine page** : `captures/accueil-390.png` (capture `fullPage` du parcours) ne montre pas le logo, alors que le DOM le contient et que deux captures de la zone visible le montrent. Cause non trouvée. À revérifier sur appareil.
- **Tailles du logo** : seule la taille 48 px a été regardée (navigateur, mode sombre). 24, 34, 96 et 128 px ne sont pas vérifiées.

## 4. Vérifications

| Contrôle | Résultat | Remarque |
|---|---|---|
| `tsc --noEmit` (apps/mobile) | exit 0 | après les changements de code |
| Socle partagé (liste de la CI, `mono/`) | 246/246 | inclut `theme.test.mjs` (18) et `conformite.test.mjs` |
| Parcours navigateur (`apps/mobile/tests/parcours-web.mjs`, 360/390/430 px) | exit 0, 0 ECHEC | build web exporté après les changements de code ; serveur démarré après l'export |
| Logo dans le DOM (mode sombre, 390 px) | anneau 48 px, 4 px, `rgb(243, 240, 234)` | mesuré dans un navigateur |
| Expo Go / appareil | non fait | aucun iPhone ni Android dans la session |
| `expo-doctor` | **non vérifié** | commande refusée par le classifieur, non relancée |

Tests non relancés après les seuls changements de documentation (commits 9aa3e59 et a3494da) : aucun code modifié depuis.

## 5. Bloqué (détail dans `BLOCAGES.md`)

1. **Groupes politiques** : fichier AMO30 à télécharger à la main (procédure section 1). Badge « Inconnu » en attendant.
2. **Contact** : adresse réelle à fournir ; à définir dans `EXPO_PUBLIC_CONTACT_EMAIL` au build.
3. **« Cette semaine »** : spécification à envoyer ; fichier à commiter par PR si le CEO l'accepte.
4. **Icône de l'application** : PNG 1024 × 1024 à exporter par le CEO depuis `<Logo>`.
5. **iPad** : passer `supportsTablet` à `false` ? Décision du CEO.
6. **Bundle ID** : `com.repere.app` placeholder, à décider avant `eas build`.
7. **expo-doctor** : à lancer sur la machine du porteur.
8. **Étape « distribution »** : étapes 1 à 4 absentes de la session. Commit `docs(distribution)` et commit `test(global)` non faits (voir `RESUME-v6.md`).
9. **Bonus (bloc 7)** : non commencé.

Autre point ouvert, déjà signalé : le stockage web écrit `{d, v}` sous la clé `repere.departement`, alors que l'application mobile écrit `{d, c}`. `CLAUDE.md` (invariant 2) dit `{d, v}`. Non corrigé.

## 6. Top 5 pour demain

1. **Décider l'iPad** : `supportsTablet` à `false` (une ligne dans `app.json`), ou captures iPad à produire.
2. **Fournir l'adresse de contact réelle**, puis la définir au build. Sans elle, aucun bouton de contact n'apparaît (c'est voulu).
3. **Déposer l'archive AMO30 extraite** dans `data/brut_AMO30/json/acteur/` (procédure `BLOCAGES.md` section 1), puis écrire l'extraction des groupes.
4. **Exporter l'icône 1024 × 1024** depuis le logo, et lancer `npx expo-doctor` sur la machine du porteur.
5. **Vérifier sur iPhone** (Expo Go) : logo aux tailles 24 et 128 px, lisibilité des initiales, cartes de partage sombres, parcours complet.

## 7. Lancer Expo (non testé sur appareil dans cette session)

Depuis la racine du dépôt :

```bash
cd mono/apps/mobile
npm ci
npx expo start
```

Puis scanner le QR code avec l'appareil photo de l'iPhone (Expo Go, même réseau Wi-Fi que l'ordinateur). Au premier lancement, l'application télécharge ses données depuis `https://repereapp.netlify.app/data` : le téléphone doit avoir Internet.

Contrôles avant de partager un build :

```bash
cd mono/apps/mobile && npx tsc --noEmit
cd ../.. && node --test --test-concurrency=1 tests/core.test.mjs tests/invariants.test.mjs apps/mobile/tests/conformite.test.mjs apps/mobile/tests/parcours.test.mjs apps/mobile/tests/recherche-flou.test.mjs
```

La liste complète est à la ligne « Socle partagé et invariants » de `.github/workflows/mobile.yml`.
