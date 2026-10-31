# RESUME v3 — Refonte UX/UI + données, journée du 30/10/2026

Branche : `test/sdk58-expo-go` (jamais `main`). **Rien n'est poussé.** Le dépôt
distant est resté à `eadb5ff`. Neuf commits locaux (le code et ce document) attendent une autorisation de push.

## 1. Commits (ordre chronologique)

| Commit | Chantier | Message |
|---|---|---|
| `19afb25` | 1 | feat(ux): nouveau pitch, logo et refonte de l'écran d'accueil |
| `cffab34` | 2 | feat(ux): annuaire des élus avec recherche et avatars |
| `4c69e65` | 3 | feat(data): enrichissement du dictionnaire citoyen avec 30+ acronymes |
| `fffd0cb` | 4 | refonte(calendrier): nettoyage des données et lisibilité |
| `1315931` | 2 (correction) | fix(parcours): l'annuaire des élus est atteignable depuis « Aller plus loin » |
| `abbbe4d` | 5 | feat(partage): partage des profils élus et événements |
| `ca3e393` | 6 | feat(ux): date de publication des données en tête de chaque écran |
| `411e7fd` | 6 (correction) | fix(ux): date de publication sans repousser le contenu ni doubler la ligne d'Aujourd'hui |
| (ce commit) | — | docs: RESUME v3 de la journée du 30/10/2026 |

Écarts par rapport aux messages demandés : le chantier 2 s'appelle « avec avatars »
(pas « et photos ») parce qu'il n'y a aucune photo dans les données.

## 2. Ce qui a réussi

- **Accueil (chantier 1)** : pitch « L'application qui vous raccroche à votre
  citoyenneté française. » en titre de l'écran. Logo en texte « Repère. ».
- **Élus (chantier 2)** : quatrième onglet « Élus ». 574 députés et l'exécutif des
  14 régions publiées, soit 2 318 entrées au total. Recherche par nom, département ou
  fonction. Chaque fiche porte sa source. Un pied de page dit ce qui manque.
- **Dictionnaire (chantier 3)** : 58 entrées ajoutées, dont 42 sigles de la vie
  publique (AN, PJL, PPL, PLF, LOLF, CMP, QPC, CESE, CNIL, OFGL, HATVP, CRDS, EHPAD…).
  Total : 77 entrées. Tests du dictionnaire : 8/8 verts.
- **Calendrier (chantier 4)** : une ligne par séance, « HHh : titre (institution) ».
  « (fin non publiée) » a disparu. Le repère « Mis à jour il y a N jours » remplace les
  paragraphes d'avertissement.
- **Partage (chantier 5)** : la fiche d'un élu a un bouton « Partager cette fiche ». La
  phrase de présentation de Repère est sur chaque carte. Le partage des événements
  existait déjà (carte « à venir ») et reste inchangé.
- **Date de publication (chantier 6)** : « Données Repère publiées le … » en haut de
  l'accueil, des écrans Page, de l'annuaire et de la fiche d'élu. Sur Aujourd'hui, la
  ligne « Publication Repère du … » existante suffit.
- **Vérifications** : `tsc --noEmit` vert à chaque commit. 70/70 tests dans
  `apps/mobile`, dont thème, onglets, parcours, dictionnaire. 183/184 tests partagés
  (voir blocages).

## 3. Blocages et décisions à valider

1. **Photos des élus : aucune donnée.** Le fichier de l'Assemblée ne porte pas de photo,
   et les données des maires n'en portent pas non plus. J'ai tenté de vérifier une
   adresse de photo de l'Assemblée : la lecture a échoué. Pas d'adresse devinée. L'écran
   affiche des initiales, sur la couleur neutre « Inconnu ».
2. **Logo : aucun fichier.** Le « R » de secours est utilisé. Le tricolore n'est pas
   utilisé : la palette est gelée (invariant 7).
3. **Partis politiques : aucune donnée de groupe.** Tous les badges sont gris, « Inconnu ».
   **Décision à prendre :** les sigles de partis (LFI, RN, EELV, EPR, LR…) sont exclus du
   dictionnaire, parce que la règle du glossaire est « aucun mot ne nomme un camp ».
   LFI est ambigu (loi de finances initiale). Si le CEO veut ces sigles, il faut
   assouplir cette règle.
4. **Emplacement du dictionnaire.** La demande visait `src/data/dictionnaire.json`. Le
   glossaire vit dans la table partagée `packages/core/src/mots.js`, lue par le site et
   l'application. Un fichier séparé aurait créé deux glossaires qui divergent. Le site
   reçoit donc aussi les 58 entrées.
5. **Maires, adjoints et conseillers municipaux et départementaux : non indexés.** Leurs
   données sont dans 104 fichiers par département (19 Mo). Pas de recherche par ville :
   les circonscriptions ne portent pas le nom des villes.
6. **Calendrier : deux écarts assumés.**
   - L'heure suit le format du site, « 10 h 30 », et non « 10h30 » de la demande, pour
     que l'application et le site disent la même chose.
   - Le message « il a pu changer depuis » n'est plus affiché. C'est une perte
     d'information. **À confirmer.**
7. **Date de publication.** C'est la date de construction de l'index. Ce n'est pas une
   date de relevé par source, et l'écran ne la présente pas comme telle.
8. **Sénat (existant, non corrigé).** La définition du Sénat contient la phrase « soit
   pas tous les conseillers municipaux », mal formée. Hors périmètre ; à reprendre.

## 4. Tests : état réel

- `apps/mobile` : `tsc` vert ; 70/70 tests verts.
- `npm test` (racine `mono`) : 183 verts, 1 rouge : `tests/runtime.test.mjs`. Il lit
  `apps/web/dist`, qui est incomplet ici (`data/agenda-an.json` absent). Ce n'est pas un
  effet des commits : il faut un export web complet pour le lancer.
- Parcours navigateur (`parcours-web.mjs`, export web local, Chromium headless) :
  221 contrôles verts, 1 rouge. Le rouge est le contrôle de calibrage du compteur (sans
  réduction du mouvement). Il était déjà rouge avant cette journée, d'après le compte
  rendu de la mission précédente. Je ne l'ai pas revérifié sur `cffab34`.
- CI sur le dernier push (`eadb5ff`) : « Mobile » en échec, « Épreuve » en succès. La
  cause de l'échec « Mobile » n'est pas confirmée : les journaux sont refusés (Forbidden).
  **Si ce contrôle de calibrage reste rouge en CI, la CI restera rouge après le push.**

## 5. Non vérifié

- Aucun test sur iPhone, Android, VoiceOver ou TalkBack.
- La feuille de partage native et la capture d'image (`react-native-view-shot`) n'ont
  pas été essayées sur appareil.
- Le mode sombre a été regardé sur des captures Chromium headless, avec la préférence
  système simulée en sombre. Ce n'est pas un test sur appareil. Captures :
  `scratchpad/mesure/sombre-aujourdhui.png` et `scratchpad/mesure/sombre-elus.png`.
- Aucune donnée n'a été ajoutée. Les définitions sont rédigées à partir des textes
  connus. Seuls les intitulés OFGL, CRDS et HATVP ont été confirmés par recherche web.

## 6. Pour tester ce soir sur iPhone

**Prérequis : le push doit être autorisé, sinon `git pull` ne récupère rien.**

```
cd C:\repere
git status
git fetch origin
git checkout test/sdk58-expo-go
git pull --ff-only origin test/sdk58-expo-go
git log --oneline -1
cd mono\apps\mobile
npx.cmd expo start --lan --clear
```

Le dernier commit attendu est « docs: RESUME v3 de la journée du 30/10/2026 ». Ouvrir Expo Go sur l'iPhone et scanner le QR
code. Parcours à faire :

1. Accueil : le pitch est en titre. Taper « Meaux ».
2. Aujourd'hui : « Publication Repère du … » en haut. Ouvrir « Aller plus loin ».
3. Onglet « Élus » : la ligne « Données Repère publiées le … » est en haut. Chercher un
   nom. Ouvrir une fiche, puis « Partager cette fiche ».
4. Onglet calendrier : lignes « HHh : titre (institution) », sans « fin non publiée ».
   Repère « Mis à jour il y a … » en haut à droite.
5. Dictionnaire : ouvrir et chercher « PJL », « LOLF », « 49.3 ».
6. Mode sombre : réglages du téléphone, puis apparence sombre. Relancer l'app.

Ce qu'il faut regarder : lisibilité, contrastes, zones tactiles, et ce que fait
« Partager » (la feuille native doit s'ouvrir avec la carte).
