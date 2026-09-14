# CE QUE LE PUBLIC VOIT N'EST PAS CE QUE NOUS CONSTRUISONS
**Mesuré le 14 septembre 2026 sur https://repereapp.netlify.app, dans un navigateur, avec un paramètre neuf.**

> **Il y a deux produits Repère. Celui que les citoyens peuvent atteindre est
> l'ancien : cinq onglets, un compteur de série, un onglet « Jouer », des écrans
> d'abonnement atteignables, et des données du 29 juin.**

La revue produit n° 1 a audité le monorepo. **Le monorepo n'est pas publié.** La
réponse « non » qu'elle donnait était donc en-dessous de la vérité.

---

## CE QUI EST MESURÉ

| | |
|---|---|
| taille du document servi | **16 292 552 octets** — c'est le fichier mono-HTML |
| `window.REPERE_CIRCOS` | **undefined** → le build **précède le 25 août** (date de la pose du bloc) |
| `data-veille` dans le HTML | **0 occurrence** → le build précède le mécanisme de mise en veille |
| `BETA_RESTREINTE`, `EN_VEILLE` | **absents** → idem |
| date affichée | « Décision la plus récente : **29 juin 2026** » |
| écrans présents dans le DOM | **21**, dont `s-abo`, `s-paiement`, `s-compte-login`, `s-compte-creer`, `s-compte-gestion`, `s-notifs` |
| service worker | enregistré sur `/` |

**Le site public est donc un build d'avant le 25 août**, et ses données affichent
le 29 juin. Ce n'est pas la panne de collecte du 26 août : c'est une publication
qui n'a pas eu lieu depuis bien plus longtemps.

---

## LA NAVIGATION EN LIGNE EST CELLE QUE L'AUDIT A REJETÉE

```
Fil · Agenda · Qui dirige · Jouer · Moi
```

Cinq onglets. **C'est exactement la famille des propositions A, B et C** soumises
à la revue produit — « Moi », « Agenda », et un onglet de jeu. L'audit les avait
écartées sur deux arguments ; le site en ligne les **démontre** :

- **« Agenda » est vide.** Mot pour mot à l'écran : *« Aucun rendez-vous n'est
  publié pour l'instant »*, et *« Prochain conseil municipal : non disponible »*.
  L'argument de l'audit — aucune consolidation nationale des dates de conseils
  municipaux n'existe — n'était pas une prédiction : c'est déjà le cas, en
  production, sur un onglet qui occupe 20 % de la barre.
- **« Moi » et « Jouer » contredisent les invariants.** Un compteur *« 1 jour
  d'affilée »* est affiché en page d'accueil : c'est de la gamification, que
  l'invariant 6 interdit. Et « Moi » donne accès à la création de compte, que
  l'invariant 2 exclut.

**L'audit n'avait donc pas à choisir entre des maquettes : il décrivait, sans le
savoir, le produit en ligne.** Trois onglets restent la recommandation, et elle
est maintenant appuyée par une observation et non par un raisonnement.

---

## TROIS DIVERGENCES DE FOND AVEC LE PRODUIT QUE NOUS CONSTRUISONS

**1. La géolocalisation.** Le site en ligne propose « Utiliser ma position » et
l'annonce honnêtement : *« Vos coordonnées sont envoyées au service public
geo.api.gouv.fr, le temps de trouver la commune. Rien n'est conservé. »*
Le monorepo, lui, promet *« Repère ne demande jamais votre adresse »*. Les deux
postures sont défendables ; elles ne peuvent pas coexister sous le même nom.
**À trancher, et à écrire dans DECISIONS.md.**

**2. Les notifications.** Le site en ligne écrit : *« Nécessaire pour recevoir les
notifications sur iOS. »* Le monorepo n'a ni compte, ni courriel, ni notification.

**3. Les écrans d'abonnement sont ATTEIGNABLES.** `show('s-abo','Offres')` est
câblé sur quatre boutons. L'écran affiche *« Payez une fois, à vous pour
toujours »*, des prix de **9,99 €** et **4,99 €**, et mentionne Stripe.

**Ce qui limite l'exposition, et je le dis parce que c'est vrai :** la page écrit
elle-même, juste en dessous, *« Maquette : simulation, aucun paiement réel.
Rétractation 14 jours si le contenu payant n'a pas été consulté. »* Et des
mentions légales existent dans le document. **Ce n'est donc pas une vente
déguisée.**

**Ce qui reste un problème :** `CONTEXTE_PROJET.md` § 11 dit que ces cinq écrans
sont *en veille* parce que *« un fil à un fait ne se vend pas »*, et que le banc
vérifie qu'aucun ne survit au démarrage. **Cette décision a été prise, et elle
n'a jamais atteint le site public.** Un visiteur peut aujourd'hui parcourir une
offre payante d'un produit dont la donnée a onze semaines.

---

## UNE IDÉE À REPRENDRE DU SITE EN LIGNE, ET ELLE EST BONNE

Le site affiche, pour Fontainebleau : *« Conseil municipal : 29 décisions votées »*
avec *« Vous pouvez lire chaque décision en entier sur fontainebleau.fr, classée
par numéro »*.

**Il ne consolide pas les délibérations : il renvoie à la source communale.**
C'est une réponse que l'exploration de données avait écartée trop vite. La
consolidation nationale n'existe pas — c'est mesuré, 46 jeux pour 34 875
communes — mais **le lien vers le site de la commune existe toujours**, et il
répond à la question du citoyen sans qu'aucune donnée soit ingérée.

À verser dans les candidats : *« Votre conseil municipal a voté le <date>. Lire
les délibérations sur <site de la commune> »*, à partir de l'URL officielle de la
commune, qui est une donnée publique disponible. **Coût faible, valeur réelle, et
zéro promesse impossible.**

---

## CE QUE ÇA CHANGE DANS L'ORDRE DES PRIORITÉS

La feuille de route de la revue produit plaçait « publier une URL » en étape 0.
**Il faut la reformuler : une URL existe déjà, et elle sert un produit périmé.**
L'étape 0 devient :

1. **Décider ce que sert `repereapp.netlify.app`.** Trois options, et il faut en
   choisir une explicitement : (a) republier le mono-HTML à jour ; (b) basculer
   sur le monorepo ; (c) mettre une page d'attente honnête. **Laisser en place un
   build du 25 août avec des données du 29 juin n'est aucune des trois.**
2. **Si on garde le mono-HTML en ligne : retirer les écrans d'abonnement.** La
   décision est prise depuis des semaines ; seule la publication manque.
3. **Réparer la collecte** (voir `PANNE_COLLECTE_14_09_2026.md`).
4. Puis seulement la fusion dans `main` et les secrets Cloudflare.

---

## LA MÉTHODE QUI A MANQUÉ, ET ELLE EST DANS LE DÉPÔT DEPUIS LE DÉBUT

`CONTEXTE_PROJET.md` § 2.4 dit : *« Toute vérification du site en ligne passe par
l'adresse plus un paramètre neuf, sinon on mesure le cache et pas le
déploiement. »* La règle existait. **Personne n'avait ouvert le site depuis des
semaines** — ni moi, avant aujourd'hui, alors que j'ai écrit une revue produit de
713 lignes sans jamais regarder ce que le public voit.

C'est la faute de méthode la plus coûteuse de la session, et elle mérite d'être
inscrite : **un audit produit commence par ouvrir le produit tel qu'un citoyen
l'atteint.** Pas le dépôt, pas le build local, pas la branche : l'URL publique.
