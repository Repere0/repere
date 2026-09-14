# REPÈRE — AUDIT PRODUIT AUTONOME
**13 septembre 2026 · AI Lead · toutes les mesures de ce document ont été refaites, aucune n'est reprise d'un rapport antérieur**

> Règle appliquée partout : quand une vérification n'a pas pu être faite, c'est écrit
> « non vérifié ». Aucun trou n'est comblé par une estimation.

---

## A. OÙ SOMMES-NOUS RÉELLEMENT ?

**Il existe deux produits Repère, et ils divergent depuis trois semaines.**

| | mono-HTML (en ligne, Netlify) | monorepo (la bêta de décembre) |
|---|---|---|
| écrans | 22 sections, 5 onglets | 3 écrans, 3 onglets |
| barre | Fil · Agenda · Qui dirige · Qui décide *(le jeu)* · Moi | Qui décide · Où va l'argent · Sources |
| votes du député | non | **oui** |
| noms de communes exacts | non | **oui** |
| surface datée | oui (un fil) | **non** |
| banc de contrôles | 34 | **44 statiques + 64 navigateur** |

Le site public sert le mono-HTML. La bêta viendra du monorepo. **Rien du monorepo n'est publié
à ce jour** : aucune URL, aucun testeur possible.

**Couverture réelle de la bêta Île-de-France, mesurée sur les fichiers publiés** (1 262 communes) :

| | couverture |
|---|---|
| maire nommé | **100,0 %** |
| circonscription | **100,0 %** |
| député nommable | **100,0 %** |
| position de vote du député | **99,6 %** |
| comptes communaux | **100,0 %** (99,7 % pour l'exercice 2025) |
| au moins un adjoint | 99,2 % |

**La couverture n'est pas le problème. Elle est excellente.** Le problème est ailleurs : une
commune ne porte que **cinq champs** — `nom`, `maire`, `adjoints`, `circo`, `comptes`. Aucune
date. Aucun événement. Aucune intercommunalité. Aucun projet.

---

## B. QU'EST-CE QUI FONCTIONNE ?

**1. La vérifiabilité, et elle est meilleure que dans tout produit civique comparable.**
Chaque chiffre porte producteur, licence, date et lien. Le build *refuse de publier* un relevé
sans ces quatre choses. Ce n'est pas une convention, c'est un `process.exit`.

**2. La doctrine du vide.** Une absence produit une phrase et un lien officiel, jamais un
squelette gris. « Un montant absent n'est pas un montant nul » est écrit dans le code et gardé
par un contrôle.

**3. Le hors-ligne, mesuré serveur éteint** à chaque exécution du banc. C'est l'invariant n°1 et
il tient pour de vrai.

**4. La chaîne commune → circonscription → député → scrutin → position → source.**
34 424 communes y remontent. Personne d'autre ne la publie ainsi.

**5. La traduction des comptes.** La carte « Ce que ces chiffres veulent dire » explique ce que
chaque rapport **ne** veut **pas** dire. C'est le seul endroit où Repère cesse d'être une base
de données — et c'est le modèle à généraliser.

**6. Le banc.** 108 contrôles, dont 64 dans un vrai navigateur. Il a attrapé, en une journée,
quatre défauts que personne n'avait vus.

---

## C. QU'EST-CE QUI EST FRAGILE ?

**1. La chaîne de livraison a bloqué deux fois en une seule journée.**
- `pousser.bat` annonçait « RIEN A ENVOYER » sans jamais regarder si les commits étaient poussés :
  trois semaines de travail sur un seul disque.
- Le même script rebasait la branche de travail sur `main` à chaque exécution horaire. Dès que
  `main` a divergé, le rebase a bloqué le dépôt — HEAD détaché, marqueurs de conflit dans un
  fichier source, plus rien de poussable.
- Puis un script d'entretien a laissé le dépôt **sur `main`** : la tâche horaire s'y est exécutée
  et a fait avancer `main` sans la branche, rendant l'avance rapide impossible. Un cercle.

C'est la fragilité n°1, avant toute considération produit : **un produit qui ne sort pas n'existe
pas**. Corrigé en version 7 du script, qui refuse désormais tout commit automatique sur `main`.

**2. Aucune publication du monorepo.** La chaîne d'intégration n'avait jamais pu finir : elle
lançait les contrôles statiques *avant* le build alors que deux d'entre eux relisent `dist`.
Corrigé, mais l'URL de démonstration attend encore trois secrets.

**3. Un seul relevé de votes, figé sur une période creuse.** Les 80 scrutins publiés vont du
20 au 21 juillet 2026 : **66 sur 80 portent sur un seul texte**. La collecte quotidienne est
désormais branchée, mais tant qu'elle n'a pas tourné, l'écran des votes montre deux jours de
session.

**4. La dépendance à un acteur privé** pour la version exploitable des marchés publics (voir G).

---

## D. QUELLE EST LA VRAIE PROPOSITION DE VALEUR ?

Ce n'est ni l'exhaustivité — d'autres auront plus de données — ni la fraîcheur — une rédaction
ira plus vite — ni le confort.

**C'est qu'un citoyen peut vérifier lui-même, en un clic, ce qu'on vient de lui affirmer.**

C'est la seule promesse que personne d'autre ne veut tenir, parce qu'elle contraint : elle
interdit d'inventer, interdit de simplifier au-delà du vrai, et oblige à écrire « ce chiffre
n'existe pas » plutôt qu'à mettre zéro.

Elle est tenue dans le code. **Elle n'est pas encore tenue à l'écran** : la preuve y est écrite
plus petit que ce qu'elle prouve, et en langue de producteur.

---

## E. OÙ L'UTILISATEUR DÉCROCHE-T-IL ?

Trois décrochages, dans l'ordre où ils surviennent.

**1. Il n'a aucune raison de revenir.** Rien ne change entre deux visites. Pas de date, pas
d'événement. C'est le décrochage le plus grave, parce qu'il est invisible : l'utilisateur ne se
plaint pas, il n'ouvre plus.

**2. Il ne sait pas ce que décide qui.** Le produit nomme un maire et un député sans dire sur
quoi chacun a du pouvoir. Deux noms sans compétence sont deux noms. *(Corrigé en phase 2 : six
phrases d'échelon.)*

**3. Le seul contenu unique lui est servi en langue administrative.** 89 % des scrutins affichés
sont des amendements ou des motions, intitulé médian de 130 caractères. *(Corrigé en phase 2 :
les 8 votes solennels en tête.)*

---

## F. QUELLE DONNÉE MANQUE ?

**Une donnée datée et rattachée à une commune.** C'est tout, et c'est tout le sujet.

L'exploration menée aujourd'hui a vérifié une vingtaine de pistes. Résultat : trois sources
tiennent, et un trou majeur subsiste.

**Ce qui existe et qu'on n'exploite pas :**
- **Projets financés par les dotations d'investissement de l'État (DETR, DSIL, DPV, DSID)** —
  DGCL, Licence Ouverte 2.0, dernière mise à jour **24 juillet 2026**, 8 CSV de 3 à 5 Mo, colonne
  `beneficiaire_code_insee`, avec `intitule`, `cou_ht`, `subvention`, `taux`, `exercice`.
  *Vérifié directement sur data.gouv.fr.* C'est un projet local **nommé et chiffré**.
- **Élections municipales des 15 et 22 mars 2026** — ministère de l'Intérieur, Licence Ouverte 2.0.
  Participation et sièges par commune. L'événement civique le plus saillant du mandat en cours.
- **Marchés publics (DECP)** — la rubrique « où va mon argent » est incomplète sans eux.

**Le trou majeur, et il faut le dire clairement : il n'existe aucune source publique homogène
pour les conseils municipaux.** Ni délibérations, ni ordres du jour, ni comptes rendus. Le schéma
SCDL existe mais chaque commune publie ou non, dans son coin. **Aucune promesse de couverture
homogène sur huit départements n'est tenable sur cette donnée.** Toute feuille de route qui
supposerait le contraire est fausse.

**Une seule source porte une date future** : les enquêtes publiques du ministère de la Transition
écologique (code INSEE + dates de début et fin). Licence et fréquence **non vérifiées** — à lever
avant toute intégration.

---

## G. QUELLE FEATURE MANQUE ?

**Une seule, et elle commande tout le reste : une surface datée.**

Pas un « fil d'actualité » — le mot promet un algorithme et un flux infini que Repère ne peut ni
ne veut tenir. Une page qui répond à : **« ce qui a été décidé près de chez vous »**, avec des
faits datés, locaux, sourcés, et rien d'autre.

Elle est désormais alimentable, sans inventer quoi que ce soit :
- *un projet financé* : « en 2025, l'État a versé 180 000 € pour la rénovation de l'école X » ;
- *un vote de votre député* : « le 21 juillet, il a voté contre la loi Y, adoptée » ;
- *votre conseil municipal* : « élu le 22 mars 2026, avec 48 % de participation ».

Trois types de faits, trois producteurs, trois dates. C'est suffisant pour une bêta.

---

## H. QUELLE FEATURE ACTUELLE DEVRAIT DISPARAÎTRE ?

**1. L'onglet « Qui décide ? » du mono-HTML, qui ouvre un jeu.** Les libellés réels sont
`s-jeu → "Qui décide ?"` et `s-qui → "Qui dirige ?"`. La question fondatrice du produit mène à un
quiz, les élus se trouvant derrière un quasi-synonyme. C'est le défaut le plus grave du produit
en ligne, et il est gratuit à corriger.

**2. L'onglet « Sources ».** Un tiers de la navigation permanente pour un écran de doctrine.
Il devient une section de « Repère ». **La preuve reste sur chaque chiffre** — on retire l'onglet,
jamais la provenance.

**3. Le jeu hors de la barre.** Il n'est pas supprimé : c'est le seul levier de retour existant.
Il devient une carte « La question du jour », en pied de la surface datée.

**4. Le nombre d'adjoints comme donnée autonome**, l'étiquette « donnée officielle » répétée sur
chaque carte, et les phrases « ni étiquette, ni parcours » répétées trois fois par écran.

---

## I. QUELLE ARCHITECTURE UX DEVRAIT ÊTRE ADOPTÉE ?

**Quatre onglets, six écrans. Pas un de plus.**

| onglet | question citoyenne | rôle |
|---|---|---|
| **Ce qui a été décidé** | « qu'est-ce qui se passe chez moi ? » | la surface datée |
| **Qui décide** | « qui décide, et quoi ? » | échelons, élus, votes |
| **Où va l'argent** | « combien, et pour quoi ? » | comptes traduits, projets financés |
| **Repère** | « à qui je fais confiance ? » | commune, taille du texte, doctrine, sources |

Deux écrans de profondeur, atteints **depuis** un contenu et jamais depuis la barre : le détail
d'un vote, et la question du jour.

« Mon argent » a été écarté au profit de « Où va l'argent » : le possessif promet un compte
personnel que la donnée ne tient pas. Trois autres architectures ont été comparées et écartées —
le détail est dans `docs/DECISIONS.md`.

---

## J. QUELLE EST LA MEILLEURE UTILISATION DES AGENTS ?

Ce qui a été mesuré aujourd'hui, sur cette session :

- **Un agent d'exploration de données a produit en un passage** ce qui aurait pris une demi-journée :
  une vingtaine de sources vérifiées, avec licences, dates et pièges. **C'est le meilleur usage** :
  une tâche large, parallélisable, à sortie vérifiable.
- **Les agents d'audit et de construction n'ont rien apporté** qui n'aurait été fait en ligne
  directe, et auraient coûté une re-découverte complète du contexte.
- **Le rôle le plus rentable après l'exploration est l'évaluateur** : sur les six défauts trouvés
  aujourd'hui, **quatre l'ont été à l'œil sur capture d'écran**, aucun par une assertion.

**Règle retenue : un agent pour explorer, un humain-machine pour regarder, des assertions pour
garder.** Ne pas multiplier les agents de construction sur les mêmes fichiers.

---

## K. QUE DOIT-ON ABSOLUMENT AVOIR EN DÉCEMBRE ?

1. **Une URL en ligne.** Sans elle, il n'y a pas de bêta, seulement un dépôt.
2. **La surface datée**, avec au moins deux types de faits sur les trois.
3. **La chaîne quotidienne qui tourne toute seule** et se voit : relevés rafraîchis, banc vert.
4. **Le parcours installable et hors-ligne sur téléphone**, mesuré sur Android *et* iOS.
5. **Les huit départements vérifiés à l'œil**, Paris et les communes à cheval comprises.

Et une exigence de méthode : **aucune fonctionnalité n'est « faite » parce qu'elle compile.**

---

## L. QUE DEVONS-NOUS EXPLICITEMENT NE PAS CONSTRUIRE ?

- **Pas de comptes utilisateurs, pas de notifications comportementales, pas de traceur.**
- **Pas de suivi d'élus.** Suivre une personne est le premier pas vers le compteur, donc vers le
  palmarès. L'invariant l'interdit dans les faits.
- **Pas de délibérations municipales en bêta** : aucune source homogène n'existe (voir F).
  Promettre cette couverture serait mentir.
- **Pas de comparaison entre communes**, sous aucune forme — y compris les « montants par
  habitant » qui produisent un classement dans la tête du lecteur.
- **Pas d'équipements publics (BPE)** : c'est un stock, pas un événement, et il invite mécaniquement
  au palmarès.
- **Pas de Sénat** : les sénateurs sont élus par département, le rattachement à la commune serait
  une approximation.
- **Pas de données de Paris seul** (chantiers, travaux) : excellentes, quotidiennes, datées — mais
  une commune sur 1 262. L'asymétrie d'expérience est intenable en bêta.
- **Pas de réécriture d'architecture** sans mesure préalable.

---

## LES TROIS PLUS GROS LEVIERS

**1. Publier.** Trois secrets Cloudflare et une fusion vers `main`. C'est le seul levier qui
transforme six mois de travail en produit essayable. Coût : quinze minutes. Sans lui, les deux
autres ne servent à rien.

**2. La surface datée, alimentée par les projets financés + les municipales 2026.** C'est le
seul levier qui donne une raison de revenir, et il ne demande **aucune donnée inventée** : deux
sources vérifiées, licence ouverte, code INSEE direct, quelques Mo. C'est aussi ce qui fait
passer Repère d'annuaire à produit.

**3. Rendre la preuve lisible.** La vérifiabilité est la proposition de valeur, et elle est
aujourd'hui écrite deux à trois crans plus petit que ce qu'elle prouve, en langue de producteur.
« D'où vient ce chiffre ? Publié par l'État, le 29 juillet 2026. Vérifier ↗ » coûte une ligne de
code et change ce que le produit *semble* être.

---

## VALEUR CITOYENNE LIVRÉE AUJOURD'HUI

*Qu'est-ce qu'un citoyen peut faire qu'il ne pouvait pas faire hier ?*

- Taper le nom de sa commune sans savoir dans quel département il habite — **trois étapes de
  moins sur dix**.
- Voir **comment son député a voté les huit lois** de la session, au lieu de quatre-vingts
  amendements.
- Lire ce que décide **chaque échelon**, de la commune à l'Assemblée.
- **Revenir en arrière** sans fermer l'application.
- Lire le nom de sa commune **correctement orthographié** — 9 198 communes étaient fautives.

*Est-ce plus simple ?* Oui, mesuré. *Plus fiable ?* Oui, 108 contrôles contre 84.
*Plus vérifiable ?* Oui, chaque vote renvoie au scrutin officiel.
**Est-ce que cela donne une raison de revenir ? Non.** C'est le prochain chantier, et le seul qui
compte vraiment.
