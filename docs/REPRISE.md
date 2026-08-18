# Repère — texte de reprise

*Mis à jour le 18 août 2026. À coller au début d'une nouvelle conversation.*

---

Je reprends le projet **Repère** avec toi. Lis ce message en entier avant d'agir.

## Ce qu'est Repère

Une application civique française, neutre, qui répond à deux questions pour n'importe
quelle commune : **qui décide chez moi**, et **où va mon argent**. Décisions publiques
résumées en français simple, chaque affirmation sourcée, aucune opinion. Objectif : être
connue avant la présidentielle d'avril 2027. Budget engagé : 250 €, dont 0 dépensé.

## Où sont les fichiers

**Rien n'est dans ton environnement au démarrage.** Deux sources :

1. **Mon dossier `C:\Users\APina\Downloads`**, via le pont d'appareil
   (`mcp__remote-devices__*`). Demande-moi l'accès, il est accordé en un clic.
2. Les documents du projet claude.ai.

**L'outillage est à `Downloads\outils\`** — et il a déjà été perdu une fois :
`build_pwa.py` (générateur de la PWA) et `test_repere.mjs` (le banc). Un dépôt git est
en cours de mise en place (`initialiser_depot.bat`, git installé le 18 août).

L'extension **Claude pour Chrome** est installée : tu peux piloter mon navigateur pour
Netlify, et pour télécharger les jeux de données que ton conteneur ne peut pas atteindre.

## État réel au 18 août 2026

- **En ligne : `repereapp.netlify.app`** (Netlify, équipe `repere0`, projet `repereapp`),
  déploiement en glissant un zip sur la page *Deploys*.
- Version courante : **v18.13**. `sw.js` en `repere-50ef9723bae8`.
- Le site sert : `/` l'application, `/accueil.html` la landing, `/presentation` la même
  landing par réécriture, `/confidentialite.html` la politique de confidentialité.
- **Couverture des données : 62 %**, affichée dans l'app.
- Embarqué : 34 637 maires, 116 454 adjoints, 52 368 conseillers communautaires,
  4 037 départementaux, 1 744 régionaux, 925 parlementaires — et les comptes des
  34 875 communes, 101 départements, 17 régions (OFGL).
- Reste à zéro : les délibérations locales (1 commune sur 34 875) et les marchés publics.

## Les invariants — ils ne se discutent pas au fil de l'eau

1. **Un seul fichier.** `app_repere_vXX.html`, autonome, sans build. La PWA, la landing
   et le deck sont *engendrés* par `outils/build_pwa.py`, jamais recopiés à la main.
2. **Aucune donnée personnelle ne quitte l'appareil.** Une seule clé `localStorage` :
   `repere.serie`. `sessionStorage` et IndexedDB interdits. *(Une seconde clé,
   `repere.acces`, est autorisée le jour où le paiement sera réel — à inscrire au banc
   avant d'être posée.)*
3. **Aucun classement** d'élus, de partis ou de territoires. Jamais de tri, de score,
   de moyenne ni de rang.
4. **Chaque chiffre porte son statut** : « chiffres vérifiés » ou « à confirmer ».
5. **Doctrine du vide** : une donnée non mesurée n'a droit à aucun élément graphique.
   Une phrase calme et le lien officiel.
6. **Le jeu ne récompense ni ne punit.** Les médailles marquent une assiduité.
7. **Couleurs d'échelon figées** : ville `#0e7490`, agglo `#0891b2`, département
   `#b45309`, région `#6d28d9`, national `#1d1d1f`. Ailleurs l'interface reste grise
   (amplitude RVB ≤ 24). Pas d'emoji structurel. Cibles tactiles 44 px.
8. **Jamais le patrimoine des parlementaires**, ni rien qui en dérive.

## Arbitrages tranchés — ne les rouvre pas sans me demander

Play Store (25 €) + PWA sur iOS · page PC en une seule page · réactions anonymes sans
compte · série de jours autorisée · **aucun compte utilisateur : l'abonnement passe par
un code d'accès anonyme ou la facturation Play Store** · **gratuit + abonnement
1,99 €/mois** · dénominateur = 34 875 communes (COG 2026 INSEE).

**La ligne freemium** : rien de ce qui répond aux deux questions fondatrices n'est
payant. Gratuit = qui décide, où va mon argent, les votes, le fil, le jeu, le calendrier,
le dictionnaire, la carte. Premium = plusieurs communes, alertes de rue, archive longue,
export, comparaison de deux territoires. **Aucune fonction premium n'est encore
construite, et la vente n'est pas ouverte** — il faut d'abord une structure juridique.

**Présences en commission** (18 août) : on liste ce qu'un député **a fait**, jamais ce
qu'il n'a pas fait. Aucune absence, aucun total, aucun pourcentage, aucun dénominateur.
La présence est fiable, l'absence ne l'est pas — un député « absent » peut siéger
ailleurs à la même heure.

## Méthode de travail — non négociable

- **N'ouvre jamais `app_repere_vXX.html` en entier** (16 Mo). Cible des plages de lignes
  par grep.
- Toute modification par **patch Python à assertions** : toutes vérifiées **avant** la
  moindre écriture. Une ancre qui ne correspond pas se re-dérive par grep.
- Le code écrit à la main n'utilise que des **apostrophes ASCII**. Les données
  embarquées, elles, contiennent des apostrophes typographiques (noms officiels INSEE) :
  une ancre qui les traverse doit les recopier telles quelles.
- Après chaque patch : `node test_repere.mjs <fichier>` doit finir par
  **« VERDICT : tout passe »** (34 contrôles).
- Playwright : chromium `/opt/pw-browsers`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
  **jamais** `playwright install`.
- Pour atteindre une commune en test : remplir `#ob-input`, appeler `obValidateTyped()`,
  puis `finishOnboard()`.

## Les pièges appris à la dure

**Un banc vert sur une page cassée reste un banc vert.** Les défauts réels se voient sur
les captures : un lien bleu hors palette, un texte gras replié en colonne par un
conteneur flex, un bandeau d'erreur affiché sur un fichier intact. **Relis les images.**

**Un texte peut contredire le code sans que rien ne le signale.** La charte a affirmé
« pas de série de jours » alors que la série existait, et l'écran des offres a vendu
« les titres seulement » alors que l'app donnait tout. Le banc a maintenant un contrôle
par contradiction connue.

**Un contrôle naïf tombe sur la trace du correctif.** Le journal des corrections *cite*
l'ancienne formulation ; un test qui cherche cette phrase la retrouve et croit le défaut
présent. Une citation n'est pas une affirmation.

**Le service worker peut prendre un fichier pour l'application.** Toute navigation était
rangée sous `./index.html` : visiter `/sw.js` remplaçait durablement l'app par ce fichier
dans le cache. Corrigé le 18 août — et l'empreinte du cache porte désormais aussi sur le
service worker, sinon le cache fautif survit au correctif censé le vider.

**Un numérateur nul est une mesure ; un dénominateur absent ne l'est pas.**

## Où on en était — l'agenda parlementaire

Jeu de données **Réunions** de l'Assemblée (Licence ouverte), téléchargé et mesuré :

- 7 470 réunions, du 1ᵉʳ juillet 2024 au 1ᵉʳ décembre 2026
- 6 259 commissions · 1 024 séances · 187 initiatives de députés
- 6 296 confirmées, **1 163 annulées ou supprimées** (à ne jamais afficher comme tenues)
- ordre du jour : 29,7 % · compte rendu : 48,4 % · **présences nominatives : 83,8 %**
- **seulement 20 réunions à venir, aucune avec ordre du jour** — normal en intersession,
  ça se remplira à la rentrée d'octobre
- `organeReuniRef` renvoie à un référentiel : `AMO10` (organes actifs) laisse **39 % des
  réunions sans nom** — il faut `AMO50` (historique), téléchargé, **pas encore examiné**

`data.assemblee-nationale.fr` est bloqué depuis le conteneur : les jeux se téléchargent
par mon navigateur, puis se récupèrent avec `device_stage_files`.

**Prochaine étape** : dépiler `AMO50`, vérifier qu'il nomme les commissions d'enquête
closes, puis écrire l'ingestion et l'écran **ensemble** — le projet a déjà produit trois
fois de la donnée que l'interface ignorait.

Ensuite : les questions écrites et orales (thématiques par député), puis la mise en
veille des sept écrans de démonstration avant d'ouvrir la bêta.

## Comment je veux qu'on travaille

Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse une règle
du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie plutôt que de
supposer, et quand tu ne peux pas vérifier, écris-le au lieu de l'arrondir.
