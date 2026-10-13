# Rendu local de l'application mobile — procédure vérifiée (13/10/2026)

Procédure pour mesurer et photographier l'app mobile sans téléphone, avec les
données réelles du dépôt. Tout se fait hors du dépôt suivi, dans un dossier de
travail. Elle a été exécutée de bout en bout le 13/10/2026.

## Ce que ça prouve, et ce que ça ne prouve pas

- Prouve : rendu web de l'app (react-native-web) à 360, 390 et 430 px ; parcours
  accueil → commune → retour ; débordements ; cibles tactiles ; noms accessibles ;
  contraste ; accents ; absences affichées sans zéro ; mémoire locale.
- Ne prouve pas : VoiceOver, TalkBack, le clavier natif, le rendu iPhone réel.
  Ces vérifications restent à faire sur téléphone (Expo Go en Wi-Fi).

## 1. Dépendances (une fois)

    cd mono/apps/mobile
    npm ci --no-audit --no-fund        # lockfile : 605 paquets, ~15 s
    npx tsc --noEmit                   # doit sortir 0

## 2. Données publiées, hors dépôt suivi

L'extraction lit le HTML source (`app_repere_v18_20.html`) et écrit `data/`.
Elle ne doit pas tourner dans le dépôt : elle réécrit des sorties suivies.
Lancer une copie.

    S=<dossier de travail hors dépôt>
    tar --exclude=./.git --exclude=node_modules -cf - . | tar -xf - -C "$S/ext"
    cd "$S/ext/mono" && node scripts/extract-html.js ../app_repere_v18_20.html ./data

Attendu dans le journal : `communes-beta.json` avec 1 262 communes sur 8
départements, `deputes.json` avec 574 circonscriptions, `index.json` de 17 Ko,
et la règle V-2 qui écarte 119 exercices incohérents (fusions de collectivités).
Limite connue : `questions-gouvernement`, `scrutins-index` et `scrutins-details`
viennent de `data/brut_*` et sont absents de cette copie — les QAG ne sont pas
publiées dans ce rendu.

## 3. Export web et serveur statique

    cd mono/apps/mobile
    EXPO_PUBLIC_REPERE_DONNEES=/data npx expo export --platform web --output-dir "$S/dist-web"
    mkdir -p "$S/dist-web/data" && cp -r "$S/ext/mono/data/." "$S/dist-web/data/"
    node ../../scripts/serveur-statique.mjs "$S/dist-web" 8811 &

## 4. Parcours mesuré (Playwright 1.56.0, Chromium du système)

Playwright n'est pas installé dans le dépôt : l'installer dans le dossier de
travail, puis pointer `NODE_PATH` vers lui.

    npm i --prefix "$S/pw" playwright@1.56.0
    NODE_PATH="$S/pw/node_modules" PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
      node tests/parcours-web.mjs http://localhost:8811 "$S/captures"

Résultat du 13/10/2026 : 217 contrôles réussis, 1 échec.

- Échec : « les trois réponses tiennent dans le premier écran » à 390 × 844.
  Tops mesurés : 441, 661, 888 px. La troisième réponse commence au-delà de 844 px.
  Cause : le pied de carte compte deux rangées de liens de 48 px (sources, « Partager »,
  lien « suite »). Correction à décider (voir la note UX).

## 5. Relecture des captures

Les captures sont dans `$S/captures/`. Les relire à l'œil avant de conclure : les
défauts réels ont été trouvés sur capture, pas par les assertions. Constat du
13/10 sur `chez-vous-390-0.png` : hiérarchie claire, source en pastille, date de
publication visible ; la barre de la troisième carte apparaît vide sur la capture,
à vérifier (animation possiblement non terminée) avant de la juger.

## Garde-fous

- Ne jamais lancer `pnpm extract` ou `extract-html.js` dans le dépôt suivi.
- Ne jamais lancer `playwright install` : utiliser `/opt/pw-browsers`.
- Ne pas committer `dist-web/`, `node_modules/` ni `.expo/` (ignorés par le dépôt).
