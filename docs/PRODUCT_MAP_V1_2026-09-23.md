# REPÈRE — PRODUCT MAP V1

Mesuré le 23 septembre 2026, sur le code réel de `mono/` et les données réellement
publiées (pas une supposition). Ce document répond à la mission « de ça
fonctionne à les citoyens reviennent » — sections A à J demandées, plus la
décision de rétention et le premier lot déjà livré.

**Mise à jour du même jour, après autorisation explicite** : la section J
proposait un marqueur de dernière visite comme « décision requise ». Cette
décision a été prise et le lot 3 est maintenant livré — voir le bandeau en
tête de la section J.

---

## A. Ce qui fonctionne aujourd'hui, mesuré en direct sur https://repereapp.netlify.app

- **6 onglets réels** (`App.jsx`, tableau `ONGLETS`) : Aujourd'hui (lien, pas un
  bouton), Ce qui a été décidé, Qui décide, Où va l'argent, Ce qui se passe,
  Sources.
- **104/104 départements** publiés (RNE + OFGL + circonscriptions).
- **Recherche directe par commune** : 1 262 communes indexées (la bêta
  Île-de-France), + 4 communes connues comme absentes du Répertoire national
  des élus mais correctement signalées comme telles (pas une erreur muette).
- **Fil éditorial** : 2 faits publiés et validés à la main, **14 brouillons**
  en attente dans `data/auto/` (voir section I — un est un doublon déjà
  identifié).
- **Scrutins** : 95 scrutins solennels + motions de censure depuis le début de
  la législature (couche d'exploration dans « Ce qui se passe », livrée le
  23/09), agrégés (pour/contre/abstentions) — **jamais par député** (voir D).
- **Agenda** : Assemblée nationale + Sénat, fusionnés et triés, mis à jour
  chaque jour.
- **Fraîcheur** : chaîne automatique quotidienne (cron + déploiement), observée
  et prouvée en réel aujourd'hui (issue GitHub `[OK]`, commit `7a5f02b` puis
  `88f991a`/`1c73cdb` en attente de fusion).
- **Poids** : 113-114 Ko le premier écran, +186 Ko/+70 Ko compressés par
  département consulté. Plafond de contrôle : 120 Ko — **la marge restante
  n'est que de 6-7 Ko**, à surveiller avant tout ajout de poids au premier
  écran.
- **Prototype "Aujourd'hui"** existe déjà (posé le 18-19/09/2026, avant cette
  session) : répond à « Que s'est-il décidé près de chez vous ? » en une seule
  question, choisi après un vrai test à trois directions capturées en
  navigateur réel sur Bagnolet. Atteint par un lien, pas un 6e bouton
  (régression à 3 lignes déjà mesurée et évitée). **C'est la fondation la plus
  proche de l'hypothèse « qu'est-ce qui a changé » — voir G et J.**

## B. Ce qui est techniquement solide (n'a pas besoin d'être re-prouvé)

- Invariants 1 à 8 gardés par 135 contrôles navigateur + 65 unitaires, 0 échec
  mesuré aujourd'hui, y compris hors ligne (réseau réellement coupé) et thème
  sombre.
- `lib/faits.js` : **un seul calcul** de « qu'est-ce qui s'est décidé »,
  partagé par tous les écrans qui en ont besoin — un fait daté, une clé stable
  (`cle`), un échelon, jamais deux calculs qui pourraient diverger. C'est
  l'infrastructure exacte dont a besoin l'hypothèse « depuis votre dernière
  visite » (voir D et J).
- Observabilité (issue GitHub auto-mise à jour) et rollback (exercé pour de
  vrai, pas seulement documenté) prouvés en production ce mois-ci.
- Bandeau de nouvelle version (livré aujourd'hui, `feat/bandeau-nouvelle-version`) :
  ferme un vrai défaut de continuité entre deux déploiements, poids +0,3 Ko
  compressé.

## C. Ce qui manque, mesuré

- **Aucune notion de « retour »** : chaque visite est table rase. Rien ne
  distingue un premier venu d'un lecteur qui revient pour la 20e fois.
- **Aucun lien député → position de vote individuelle** : `data/scrutins.json`
  porte explicitement `"ecarte": "aucune liste de non-votants, aucun agrégat
  par député..."` — la source le permettrait, Repère ne le republie pas
  encore. C'est une décision de portée, pas un oubli.
- **Le fil éditorial reste un goulot humain** : 2 faits publiés contre 14
  brouillons en attente. La fraîcheur du produit dépend d'un geste quotidien
  du porteur de projet, pas de la technique.
- **« Aujourd'hui » n'est accessible qu'après avoir choisi une commune** :
  aucune porte d'entrée ne pose la question avant que le lecteur ait fait ce
  choix.
- **Onglet « Ce qui se passe »** reste au niveau national (Assemblée + Sénat +
  scrutins) — rien n'y relie encore la commune du lecteur à un événement précis
  qui la concerne.

## D. Les 10 questions citoyennes prioritaires (carte des questions, pas des écrans)

| # | Question | Donnée nécessaire | Écran actuel | Fréquence réelle | Valeur |
|---|---|---|---|---|---|
| 1 | Qui est mon maire / mon député ? | RNE | Qui décide | Rare (une fois retenue) | Haute, fondation |
| 2 | Quelle est ma circonscription ? | Circonscriptions | Qui décide | Rare | Haute, fondation |
| 3 | Que s'est-il décidé récemment près de chez moi ? | faits.js (projets+votes+fil) | Aujourd'hui, Ce qui a été décidé | **Devrait être hebdo** | **Très haute — c'est le moteur de retour** |
| 4 | Que vient de décider l'AN / le Sénat ? | Agenda AN+Sénat | Ce qui se passe | Quotidienne (séances) | Haute, mais nationale, pas personnelle |
| 5 | Quels votes importants ont eu lieu ? | Scrutins solennels | Ce qui se passe | Basse (95 en 2 ans) | Moyenne, déjà bien traitée |
| 6 | Que va-t-il se passer ? | Agenda AN+Sénat | Ce qui se passe, Aujourd'hui | Quotidienne | Moyenne |
| 7 | Qui décide de ça (quelle institution) ? | RNE + structure des échelons | Qui décide | Rare | Haute, fondation |
| 8 | Combien ça représente (comptes) ? | OFGL | Où va l'argent | Basse (annuelle) | Haute, mais pas répétitive |
| 9 | Qu'a fait mon député récemment ? | Scrutins + RNE (position **non publiée**) | Aucun encore | — | Haute, **bloquée par C** |
| 10 | Où vérifier (source) ? | Chaque écran porte sa source | Sources | Transversale | Fondation de confiance |

**Lecture** : les questions 1, 2, 7, 10 sont des fondations déjà bien servies —
elles ne motivent pas un retour, elles motivent la confiance. Les questions 4,
5, 6 sont nationales, déjà servies par « Ce qui se passe ». **La question 3 est
la seule à la fois personnelle (la commune du lecteur), fréquente (de nouvelles
décisions arrivent), et pas encore présentée comme un flux de nouveauté** —
c'est elle qui porte la meilleure hypothèse de rétention (voir G, J).

## E. Données disponibles pour y répondre

RNE (élus, 34 637 communes), OFGL (comptes, 3 échelons), circonscriptions
(34 626 communes), agenda AN + Sénat (quotidien), scrutins solennels + censure
(95, depuis juillet 2024), fil éditorial (2 faits + 14 brouillons), projets
financés par l'État (DGCL, par département). Tout est déjà chargé par
`useAujourdhui.js` pour les communes de la bêta.

## F. Données manquantes

- Position de vote par député (disponible à la source, non republiée — décision
  de portée, pas un manque technique).
- Aucune donnée de présence/absence (invariant 8, ne doit jamais changer).
- Aucun élargissement de la bêta hors Île-de-France pour la recherche directe
  par commune (le parcours département-first couvre toute la France ; la
  recherche directe par nom de commune reste limitée aux 1 262 communes
  indexées).

## G. Expériences de retour possibles

1. **Dashboard classique** (tout affiché en permanence, comme aujourd'hui,
   mais avec un badge « nouveau »). Simple, mais ne répond pas à « qu'est-ce
   que j'ai manqué » — le lecteur doit tout re-scanner.
2. **Flux chronologique permanent** (façon réseau social). Rejeté explicitement
   par le cap du produit (§17 de la mission) : Repère n'est pas un flux
   d'actualité, et la doctrine du vide interdit un flux qui se sentirait vide
   ou anxiogène les jours calmes.
3. **« Depuis votre dernière visite »** (nouveautés → aujourd'hui → à venir).
   S'appuie directement sur `faits.js`, déjà construit, déjà partagé par deux
   écrans. **Livré ce jour** (voir J) : le marqueur de visite est porté par la
   clé de stockage unique (`repere.departement`, devenue `{d, v}`) — décision
   actée, pas glissée.
4. **Hybride explorer** (nouveautés → aujourd'hui → à venir → explorer). Le
   prototype « Aujourd'hui » existant EST déjà la moitié de cette architecture
   (aujourd'hui + à venir + explorer via les boutons du bas) ; il manque
   exactement le bloc « nouveautés depuis la dernière visite ».

## H. Trois architectures UX envisagées (comparées sur mesure, pas sur préférence)

| | A. Dashboard + badge | B. Flux permanent | C. Hybride (nouveautés → aujourd'hui → à venir) |
|---|---|---|---|
| Fraîcheur réelle des données | Quotidienne | Quotidienne | Quotidienne |
| Fréquence réelle de nouveauté par commune | Basse (un fait par commune tous les X mois, hors agenda national) | Basse | Basse, mais présentée honnêtement (« rien de nouveau » est une phrase, pas un flux vide) |
| Simplicité | Haute | Basse (nécessite un vrai flux, une pagination) | Moyenne — réutilise `faits.js` |
| Poids | Nul (déjà chargé) | Élevé (pagination, plus de requêtes) | Faible (un filtre sur des données déjà chargées) |
| Compréhension pour un non-initié | Moyenne (un badge ne dit pas quoi) | Basse (se confond avec un fil d'actu) | Haute (« depuis votre dernière visite, 2 choses » est une phrase) |
| Récurrence d'usage | Faible | Fausse (rien à lire souvent) | Réelle si la fréquence de nouveauté le permet — **à mesurer en usage réel, pas supposé** |
| Faisabilité | Immédiate | Lourde | Immédiate sauf la persistance (1 décision) |
| Provenance | OK | OK | OK — chaque fait garde déjà sa source (`faits.js`) |

**Conclusion mesurée, pas arbitraire** : C est la seule architecture qui tient
à la fois la doctrine du vide (invariant 5 — un jour calme dit une phrase, ne
simule pas un flux vide) et la promesse de la mission (§15 : « il y aura
probablement du nouveau la prochaine fois »). A ne motive aucun retour. B est
explicitement hors cap (§17, §2 de CONTEXTE_PROJET.md : Repère n'est pas un
média).

## I. Risques

- **Fréquence réelle de nouveauté par commune inconnue** : combien de communes
  ont un fait nouveau (projet, vote du député, événement éditorial) un mois
  donné ? Non mesuré — nécessaire avant de promettre un retour utile (voir J,
  « à mesurer avant de généraliser »).
- **Marge de poids du premier écran quasi épuisée** (6-7 Ko sur 120). Tout
  ajout au premier écran (pas à « Aujourd'hui », qui est déjà à la demande)
  doit être mesuré avant, pas après.
- **Le fil éditorial reste le goulot humain** : une expérience de retour qui
  dépendrait surtout du fil éditorial resterait pauvre tant que 2 faits
  seulement sont publiés. Valider des brouillons (item 9, ci-dessous) a un
  effet direct sur la valeur de toute expérience « nouveauté ».
- **Le contrat de la clé unique de stockage a changé** (`repere.departement`
  porte désormais `{d, v}`) — acté explicitement le 23/09, avec le
  commentaire d'invariant 2 mis à jour dans `App.jsx` pour dire pourquoi.
  Reste à décider : si `CONTEXTE_PROJET.md` doit reprendre ce même
  changement de formulation (c'est un document éditorial, pas engendré —
  je ne l'ai pas modifié).

## J. Trois lots — état réel après autorisation

1. **Livré, en attente de vos clics (PR à ouvrir)** : correctif du smoke test
   (`chore/smoke-prod-corrections-v2`, pré-approuvé), bandeau de nouvelle
   version (`feat/bandeau-nouvelle-version`).
2. **Livré** : fenêtre « cette semaine » dans « Aujourd'hui » — calcul pur sur
   les faits déjà chargés, aucune donnée persistée à l'origine. Sert
   maintenant de repli honnête au lot 3 (voir ci-dessous).
3. **Livré ce jour, sur autorisation explicite** : le marqueur « dernière
   visite » porté par `repere.departement` (devenu `{d, v}` au lieu d'une
   chaîne nue). « Depuis votre visite du [date] » remplace « cette semaine »
   dès qu'un marqueur réel existe ; sinon repli automatique sur le lot 2 —
   première visite, ancien format de stockage, ou stockage indisponible sont
   gérés explicitement, pas devinés. Preuve par la frontière réelle (un fait
   antérieur au marqueur reste exclu, un fait postérieur apparaît), pas
   seulement par la présence. Voir la branche `feat/aujourdhui-fraicheur-semaine`
   (deux commits : la fenêtre puis la rétention).

Les trois lots vivent sur trois branches distinctes, aucune fusionnée : les
liens de PR sont dans le rapport de session, pas répétés ici.
