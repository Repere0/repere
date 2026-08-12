# Repère — texte de reprise

*À coller au début d'une nouvelle conversation.*

---

Je reprends le projet **Repère** avec toi. Lis ce message en entier avant d'agir.

## Ce qu'est Repère

Une application civique française, neutre, qui répond à deux questions pour n'importe
quelle commune : **qui décide chez moi**, et **où va mon argent**. Décisions publiques
résumées en français simple, chaque affirmation sourcée, aucune opinion. Objectif : être
connue avant la présidentielle d'avril 2027. Budget engagé : 250 €, dont 0 dépensé.

## Où sont les fichiers

**Rien n'est dans ton environnement au démarrage** — chaque session repart d'un
conteneur vide. Deux sources :

1. **Les documents du projet claude.ai** — lis-les avec l'outil Projects, en priorité
   `claude/Repere_Systeme_de_travail.md` (invariants, méthode, journal des arbitrages)
   et `claude/Repere_Modele_Freemium.md` (gratuit/premium, prix).
2. **Mon dossier Téléchargements**, connecté via le pont d'appareil
   (`mcp__remote-devices__*`). Tout ce qui a été livré s'y trouve :
   `app_repere_v18.html` (16 Mo, le produit), `repere_site.zip` (le site prêt à
   déposer), `repere_presentation.html`, `repere_deck.html`, et les fichiers de
   données sources (RNE, COG, OFGL). Demande-moi l'accès au dossier et récupère ce
   dont tu as besoin avec `device_stage_files`.

L'extension **Claude pour Chrome** est installée : tu peux piloter mon navigateur pour
Netlify, Cloudflare et plus tard la console Play Store.

## État réel au 12 août 2026

- L'app est **en ligne** sur Netlify (je te donnerai l'adresse). Elle s'installe sur
  l'écran d'accueil et fonctionne hors connexion.
- **Couverture des données mesurée : 62 %**, affichée dans l'app.
- Embarqué : **34 637 maires**, 116 454 adjoints, 52 368 conseillers communautaires,
  4 037 conseillers départementaux, 1 744 régionaux, 925 parlementaires, 588 élus des
  collectivités uniques — et les **comptes des 34 875 communes**, 101 départements,
  17 régions (OFGL).
- Poids : 16,3 Mo, soit 6,2 Mo au téléchargement. Banc vert.
- Ce qui reste à zéro : les **délibérations locales** (1 commune sur 34 875) et les
  **marchés publics**.

## Les invariants — ils ne se discutent pas au fil de l'eau

1. **Un seul fichier.** `app_repere_v18.html`, autonome, sans build. La PWA, la page
   PC et le deck sont *engendrés* par des scripts, jamais recopiés à la main.
2. **Aucune donnée personnelle ne quitte l'appareil.** Une seule valeur y est écrite :
   la série de jours, sous la clé `repere.serie`. `sessionStorage` et IndexedDB sont
   interdits, `localStorage` ne peut toucher que cette clé — le banc échoue sinon.
3. **Aucun classement** d'élus, de partis ou de territoires. Des compteurs factuels,
   jamais un tri, un score, une moyenne ou un rang.
4. **Chaque chiffre porte son statut** : « chiffres vérifiés » ou « à confirmer ».
5. **Doctrine du vide** : une donnée non mesurée n'a droit à aucun élément graphique.
   Une phrase calme et le lien officiel. Jamais une barre minuscule, qui se lit comme
   une petite valeur et non comme une absence.
6. **Le jeu ne récompense ni ne punit.** Les médailles marquent une assiduité, jamais
   une bonne réponse.
7. **Couleurs d'échelon figées** : ville #0e7490, agglo #0891b2, département #b45309,
   région #6d28d9, national #1d1d1f. Hors échelon et famille politique, l'interface
   reste grise (amplitude RVB ≤ 24). Pas d'emoji structurel. Cibles tactiles 44 px.
8. **Jamais le patrimoine des parlementaires**, ni rien qui en dérive.

## Arbitrages déjà tranchés — ne les rouvre pas sans me demander

Play Store (25 €) + PWA sur iOS · maire et adjoints partout · `geo.api.gouv.fr` retiré
de la recherche · page PC en une seule page · **compteurs factuels sans classement** ·
**réactions avec pourcentages, compteur anonyme sans compte** · **série de jours
autorisée** · **aucun compte utilisateur, médailles locales** · **gratuit + abonnement
1,99 €/mois** · dénominateur = 34 875 communes (COG 2026 INSEE) · pitch deck refondu ·
promesse de délai du droit de réponse réécrite sans chiffre.

## Méthode de travail — non négociable

- **N'ouvre jamais `app_repere_v18.html` en entier** (16 Mo). Lis `INDEX.md`, puis
  cible des plages de lignes avec grep.
- Toute modification par **patch Python à assertions** : toutes les assertions
  vérifiées **avant** la moindre écriture. Une ancre qui ne correspond pas se re-dérive
  par grep — jamais de devinette, jamais d'assertion relâchée.
- Le fichier n'utilise que des **apostrophes ASCII** `'`. Une ancre contenant `’`
  échouera.
- Après chaque patch : `node test_repere.mjs app_repere_v18.html` doit finir par
  « VERDICT : tout passe ».
- Playwright : chromium `/opt/pw-browsers`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
  **jamais** `playwright install`. CommonJS :
  `import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js'; const {chromium}=pkg;`
- Pour atteindre une commune dans un test : remplir `#ob-input`, appeler
  `obValidateTyped()`, puis `finishOnboard()`. Un `obPick()` avec code INSEE vide donne
  un écran vide et induit en erreur.

## Les pièges appris à la dure — ils se reproduiront

**Un banc vert sur une page cassée reste un banc vert.** Six défauts réels ont été
trouvés en **regardant des captures d'écran**, aucun par les assertions seules : un
faux maire sur 197 communes, le budget d'Île-de-France servi à toute la France, un
bouton qui chevauchait son paragraphe, une carte vide sous le voile d'onboarding. **Relis
toujours les images.**

**Un rapport de succès peut porter sur des données entièrement fausses.** Écris toujours
un contrôle *indépendant*, qui relit la source brute sans réutiliser une ligne du script
qu'il vérifie.

**Une étape 9 manquante annule les huit précédentes.** Le projet a produit trois fois
de la donnée que l'interface ignorait. Ingestion et affichage partent ensemble.

**Un numérateur nul est une mesure ; un dénominateur absent ne l'est pas.** Et on ne
renormalise jamais un score sur les seules couches mesurables : le chiffre est monté de
33 à 71 % sans qu'aucune donnée n'ait été ajoutée.

**Les fichiers sources contiennent des colonnes homonymes.** Le fichier des communes
porte aussi les colonnes de sa région : un appariement par synonymes non contraint par
échelon joint les montants au mauvais territoire, en silence.

## Ce qui reste à faire, par priorité

**Pour la bêta** : renommer le site (fait), les **mentions légales**, le **numéro de
version** affiché dans l'app, le **formulaire de retour** câblé sur
`repere0@protonmail.com`, un **guide de test**, et l'essai sur un vrai iPhone et un vrai
Android. Puis ouvrir à une dizaine de testeurs.

**Défauts connus à corriger** : les écrans « Où va mon argent » affichent des chiffres
sans étiquette de vérification quand les données sont absentes ; dans le format compacté
de l'OFGL un `0` ne distingue pas « absent » de « réellement zéro » ; la couverture
n'est pas encore précalculée à la fabrication (le frontend calcule encore) ; du code
mort et trois défauts d'accessibilité identifiés.

**Ensuite** : déployer le compteur de réactions (Cloudflare Workers, code écrit, il
reste à le publier et à coller son adresse dans `REACT_URL`), le compte Play Store,
le partage du résultat du jeu en image, l'abonnement, puis les marchés publics et les
délibérations locales.

**Ce que je dois faire moi** : ouvrir à la main les 22 adresses sources du quiz, et
envoyer deux courriels à l'Assemblée et au Sénat pour les droits sur les portraits
officiels.

## Comment je veux qu'on travaille

Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse une règle
du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie plutôt que de
supposer, et quand tu ne peux pas vérifier, écris-le au lieu de l'arrondir.
