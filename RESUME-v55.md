# RESUME V55 — 04/11/2026

Branche : `test/sdk58-expo-go`. Exécution **locale** (PowerShell/Bash, ce
poste), comme demandé — Claude ne tournait pas en cloud cette fois.

## Avant de lire la suite : l'incident de l'auto-commit

Une tâche planifiée Windows (`pousser.bat`, hebdomadaire → en fait horaire,
voir `installer_tache_horaire.bat`) s'est déclenchée en cours de session
(04/11, 1h38) et a **commité puis poussé** tout le travail alors en cours
(blocs 2, 3, 4A/4C, 4B, 4D, 5B) en un seul commit générique, sans attendre
ma relecture ni le découpage par bloc demandé. Ce n'est pas une action que
j'ai déclenchée (aucun `git commit`/`push` de ma part à ce moment).

- Commit : `e216f5e` *« Dépôt automatique du 04/11/2026 1:38:03,05 »*,
  **déjà sur `origin/test/sdk58-expo-go`**, sans PR ouverte (PR #174 était
  déjà fusionnée avant). Rien n'est cassé : pas de PR, pas de CI déclenchée.
- La tâche planifiée (`Repere - pousser`) a été **supprimée** pour cette
  session (`schtasks /Delete`), sur ta confirmation, pour éviter qu'elle
  ne repousse la suite avant ta relecture. À réinstaller toi-même
  (`installer_tache_horaire.bat`) si tu veux la reprise automatique.
- Détail complet (y compris le rebase interactif abandonné trouvé au
  démarrage, `ux/theme-sombre-20-10` sur `.git/rebase-merge`, laissé
  intact) : voir la conversation.

## Commits

**Déjà sur origin** (poussé par l'automatisme, pas par moi) :
- `e216f5e` — dépôt automatique (blocs 2, 3, 4A/4C, 4B, 4D, 5B, voir
  détail par bloc plus bas)

**Locaux, non poussés** (les suivants, trouvés en vérifiant moi-même
chaque bloc avant de m'arrêter) :
- `9651139` — fix(qui-decide) : la précision Île-de-France Mobilités
  reste visible (régression du bloc 4A, trouvée par `parcours-web.mjs`)
- `6c4081a` — feat(infographies) : barre budget segmentée avec un label
  par part (bloc 5B)
- `5d61273` — fix(accueil) : titre court, plus de troncature au milieu
  d'un mot (régression du bloc 2, trouvée en relisant la capture d'écran)
- `f08002e` — test(zoom) : le sélecteur « Confort de lecture › » suit le
  lien renommé (test cassé par le bloc 2, mis à jour)

## Ce qui est corrigé, bloc par bloc

**Bloc 1 — bouton ⚙️ flottant : rien à corriger.** Recherché par nom de
composant, par `position: absolute` + `bottom`, dans `mono/apps/mobile`
ET `mono/apps/web`, sur tous les écrans cités (accueil, calendrier, qui
décide, fiche élu) : aucun bouton flottant dans le code de cette branche.
Le réglage (`BoutonReglages`, `ui/reglages.tsx`) vit déjà dans l'en-tête
depuis un correctif antérieur (V34), documenté dans le code comme tel.
Hypothèse la plus probable : un bundle Expo Go mis en cache sur
l'iPhone, antérieur à ce correctif ou au nettoyage du 01/11
(`ba7e493`, « logo dans le hero, header nettoyé »). À vérifier : recharger
l'app à fond (fermer puis rouvrir, ou vider le cache Expo Go) avant de
rejuger ce point.

**Bloc 2 — refonte accueil.** Nouvel ordre : en-tête (petite marque +
petit logo, loupe et ⚙️ à droite) → titre (2 lignes) → recherche →
liens secondaires (Confort · Mes élus · Voter · Pour vous) → repère du
jour + chiffres si commune choisie. Logo géant (96-128 px) supprimé du
milieu de l'écran, remplacé par une version 22 px dans l'en-tête.
*Trouvé en vérifiant* : la citation complète du CEO ne tenait pas en
deux lignes et se coupait en plein mot (« à votre ... ») — remplacée par
l'alternative courte proposée dans le brief (`5d61273`).

**Bloc 3 — bloc négatif de la fiche annuaire.** Le texte est dans
`annuaire-fiche.tsx`, pas `elu.tsx` (le brief citait le mauvais fichier ;
`elu.tsx`, la fiche d'un député, fait déjà ce qui était demandé : badge
de parti si connu, ligne discrète sinon). La fiche d'annuaire (maires,
conseillers...) n'a **jamais** de donnée de parti dans son modèle
(`type Fiche`, aucun champ groupe) : impossible d'y afficher un badge un
jour. La carte titrée « Ce que Repère n'affiche pas » est retirée ;
remplacée par une ligne discrète en pied (même convention que
`elu.tsx` → `PARTI_NON_PUBLIE`), pas supprimée en silence (invariant 5).

**Bloc 4A/4C — intercommunalité.** Carte réduite à l'institution,
« Décide : … » et la précision territoriale (ex. « les transports sont
organisés par Île-de-France Mobilités », qui corrige une confusion
fréquente) — 3-4 lignes. Le détail (qui siège, la définition) passe
derrière « Voir plus ». Le bloc « Mandat terminé (décès) : Henri
Mellier » est retiré de cet écran (la liste `lib/mandats-termines.ts`
reste intacte pour une future page « élus du territoire », V56).
*Régression trouvée en vérifiant* : la précision Île-de-France Mobilités
était passée sous « Voir plus » avec le reste, cassant la garantie
« pas de confusion sur qui décide des transports » — remise toujours
visible (`9651139`).

**Bloc 4B — carte budget (accueil).** Le titre nomme désormais le
projet financé au lieu d'empiler deux montants et un pourcentage :
« L'État a financé 726 800 € pour « Construction d'un pôle médical au
sein du quartier Beauval » à Meaux. » Le pourcentage et le détail des
montants restent juste dessous. *Écart assumé* : le brief demandait de
transformer le titre du projet en verbe (« pour sécuriser… ») ; les
titres réels publiés (OFGL) sont des phrases nominales très variées
(« Travaux et acquisition sur les écoles… », « Installation panneau
électrique dans QPV »…) qu'on ne peut pas transformer en infinitif sans
inventer du texte pour 1 262 communes (interdit par le projet). Le
titre réel est repris tel que publié, entre guillemets.

**Bloc 4D — bandeau du jour.** Remplacé par un vrai bouton « Voir le
Repère du jour › », sans texte tronqué à 22 caractères.

**Bloc 5A — timeline des élus (Qui décide).** Déjà en place avant V55 :
une timeline verticale, un point coloré par échelon (palette.ts,
invariant 7), relié par un trait. Vérifié par capture, rien à changer.

**Bloc 5B — barre budget segmentée.** Un label par part (pastille +
libellé + %) remplace la légende à une seule phrase.

**Bloc 5C — pictogramme de vote : pas de changement, délibérément.**
`elu.tsx` utilise déjà des signes colorés (✓︎ pour, ✕︎ contre, ○︎
abstention) + le mot en toutes lettres — pas des emoji ✅/❌/⚪. Passer
à des emoji fixerait leur couleur (toujours vert/rouge/blanc) et
casserait la variante daltonienne (D56, palette Okabe-Ito, réglage du
profil) : un emoji ne prend pas la teinte du thème. C'est un cas où
suivre le brief à la lettre cassait l'invariant 7 (accessibilité) ; je
m'arrête et le signale au lieu d'exécuter.

## Captures (preuve visuelle)

Dans `mono/apps/mobile/captures/` (ignoré par git, pas commité) :
`accueil-360/390/430.png`, `chez-vous-{360,390,430}-{0..3}.png`.
Captures complémentaires prises pendant la vérification (supprimées
après relecture, décrites ici) : accueil avec commune retenue (titre +
liens), budget déplié (labels par part), Qui décide (timeline, carte
intercommunalité + Voir plus), fiche annuaire d'un élu sans parti publié.

## Ce qui reste à faire (V56)

1. Confirmer sur un vrai iPhone, cache Expo Go vidé, que le bouton ⚙️
   flottant du bloc 1 n'existe plus (hypothèse de cache non vérifiable
   depuis ce poste).
2. La liste « Henri Mellier » (mandats terminés) n'a plus d'écran où
   s'afficher : décider si une page « élus du territoire » est encore
   voulue, ou si `lib/mandats-termines.ts` doit être retiré.
3. Deux invariants (`index.json` ne déclare pas `questionsGouvernement`,
   142 exercices OFGL incohérents avec la population) et un test
   (`decoupage.test.mjs`, fichier `data/decoupage-idf.json` absent
   localement) échouent sur ce poste, **avant et indépendamment** de
   V55 (vérifié en comparant au commit `0c70fce`, avant toute
   modification de cette session) : données locales à rafraîchir,
   hors sujet V55.
4. `conformite.test.mjs` échoue sur ce poste avec un bug de chemin
   Windows (`C:\C:\Users\...`, chemin doublé) dans le test lui-même,
   indépendant de V55.
5. `recherche-web.mjs` (« violences sexuelles » → scrutin n° 8706)
   échoue de façon intermittente, sur un écran que V55 n'a pas touché :
   probable lacune de données locales (catalogue de scrutins non
   thématisé), à confirmer.
