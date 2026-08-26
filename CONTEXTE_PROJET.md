# Repère — contexte de projet

**À lire en entier avant toute action.** Ce fichier est la source de vérité pour
tout modèle de langage qui reprend le projet. Il est écrit pour être collé tel
quel en début de session.

- **Dernière mise à jour :** 26 août 2026
- **Version de l'application :** `app_repere_v18_20.html`
- **Dépôt :** `C:\Users\APina\repere` (Windows) — la chaîne tourne sur GitHub Actions
- **En ligne :** https://repereapp.netlify.app/
- **Tenue à jour :** ce fichier n'est PAS engendré. Quand un chiffre change, corrige-le
  ici et écris la date de la mesure. Un chiffre sans date de mesure ne vaut rien.

---

## 1. Ce qu'est Repère

Une application civique française, **politiquement neutre**, qui répond à deux
questions pour chacune des 34 875 communes :

1. **qui décide chez moi**
2. **où va mon argent**

**La raison d'être, formulée par le porteur du projet :** reconnecter le citoyen —
jeune comme âgé — à sa politique locale, départementale, régionale puis nationale.
Repère doit agir comme un **traducteur** : permettre à quelqu'un de comprendre ce
qui se passe et à quelle porte frapper. Le citoyen finance l'action publique par
l'impôt ; il a le droit de comprendre ce qu'elle devient.

**Ce que Repère n'est pas :** un média, un classement, un outil militant, un
observatoire de la performance des élus.

**Contraintes réelles :** un seul développeur, 250 € de budget total, bêta fermée
visée en **décembre 2026**, élection présidentielle en **avril 2027**.

---

## 2. Comment travailler sur ce projet

### 2.1 Ce que le porteur du projet demande, mot pour mot

> « Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse
> une règle du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie
> plutôt que de supposer, et quand tu ne peux pas vérifier, écris-le au lieu de
> l'arrondir. »

Ce n'est pas une préférence de ton : c'est une règle de travail. Un rapport qui
conclut par un résumé flatteur ne sert à rien ici.

### 2.2 Mesurer plutôt que supposer

- Un chiffre que tu n'as pas mesuré s'écrit comme non mesuré.
- Une ancre de patch se **relit et se compte** avant toute écriture
  (`assert src.count(ancien) == 1`), jamais devinée de mémoire.
- Un garde-fou se **prouve en le cassant** : on introduit délibérément le défaut,
  on vérifie que l'assertion tire, on remet en état. Un garde jamais vu tirer n'est
  pas un garde.
- Une capture d'écran se **relit**. La règle du banc :
  *« un banc vert sur une page cassée reste un banc vert. »* La moitié des contrôles
  ouvrent réellement l'application dans un navigateur et mesurent le rendu.

### 2.3 La méthode des patches

Chaque modification de l'application est un script Python autonome
`outils/patch_NN_nom.py` qui :

1. porte en tête un docstring expliquant **pourquoi**, pas seulement quoi ;
2. vérifie chacune de ses ancres (`assert s.count(ancre) == 1`) **avant** d'écrire ;
3. relit ce qu'il vient d'écrire pour se contredire lui-même ;
4. est **idempotent** ou refuse de tourner deux fois.

**Deux règles typographiques, souvent confondues — c'est arrivé deux fois le 25 août :**

| | règle |
|---|---|
| **Apostrophe typographique `’`** | **INTERDITE** dans le code écrit à la main. Elle casse les ancres de patch. Utiliser `'`. |
| **Accents (é è à ô ç…)** | **OBLIGATOIRES** dans tout texte **affiché à l'utilisateur**. Les commentaires du code sont volontairement sans accents ; les chaînes affichées ne le sont jamais. Un contrôle du banc le vérifie sur le rendu. |

### 2.4 Vérifier ce qui est en ligne

Le CDN de Netlify sert des copies mises en cache. **Toute vérification du site en
ligne passe par l'adresse plus un paramètre neuf** (`?verif=<date>`), sinon on
mesure le cache et pas le déploiement. Cette erreur a déjà été commise deux fois.

---

## 3. Les huit invariants

Ils ne se négocient pas. Le banc en garde la plupart.

1. **Autonomie.** L'application fonctionne hors ligne, sans serveur applicatif.
2. **Une seule clé de stockage local**, `repere.serie` (`repere.departement` dans
   le monorepo). Aucun compte, aucun email, aucun traceur, aucun cookie, aucun
   `sessionStorage`.
   **IndexedDB — clause resserrée le 26 août.** L'interdiction absolue ne visait
   pas la technique, elle visait le risque : que le produit garde des traces de
   son lecteur. Elle devient : *IndexedDB ne peut contenir que de la donnée
   publique déjà téléchargée, dans un magasin unique, et une garde refuse toute
   écriture qui n'est pas un paquet départemental.* Dans l'application
   mono-fichier, IndexedDB reste inutilisée et son contrôle inchangé ; dans le
   monorepo, la garde est dans `packages/data-utils/src/store.js` et deux
   contrôles la vérifient — un statique, un dans le navigateur, qui relit la base
   réelle.
3. **Aucun classement**, score, ou tri numérique de personnes, de partis ou de
   territoires.
4. **Chaque chiffre porte sa source officielle et sa date.** Un calcul dérivé doit
   être annoncé comme un calcul, jamais présenté comme une donnée publiée.
5. **Doctrine du vide.** Une absence de donnée produit une **phrase** et un lien,
   jamais une forme vide, jamais un zéro, jamais une barre minuscule. Deux causes
   d'absence différentes exigent deux phrases différentes.
6. **Rien qui gamifie le vote ou l'opinion.**
7. **Cinq couleurs d'échelon gelées.** Aucune autre couleur ne dépasse une amplitude
   de 24 sur les canaux RGB.
8. **Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence.**

**Conséquence architecturale majeure de l'invariant 2 :** un contrôle du banc
interdit qu'une adresse réseau demandée par l'application porte un code de commune —
cela révélerait au serveur la commune de l'utilisateur. C'est pourquoi les données
sont découpées **par département**, jamais par commune.

---

## 4. Architecture

### 4.1 Le principe

- **Un fichier HTML autonome**, 17,3 Mo, 16 418 lignes. Aucun framework, aucune
  étape de build, fonctionne hors ligne, s'ouvre en `file://`.
- **Le site et la PWA sont ENGENDRÉS** par `outils/build_pwa_reconstruit.py`.
  Jamais recopiés à la main.
- **Backend au moment du build.** GitHub Actions remplace un serveur : zéro coût,
  zéro log, zéro maintenance, et l'application reste hors ligne.
- **Deux sorties divergentes à partir d'une source.** Le fichier autonome embarque
  tout et ne demande rien. La version servie reçoit des adresses
  (`window.REPERE_*_URL`) et va chercher ses données. **Le banc passe sur les deux.**

### 4.2 Le motif « globale absente = rien à chercher »

C'est le mécanisme qui fait tenir l'invariant 1 avec deux sorties :

```js
function xCharger() {
  if (!window.REPERE_X_URL) return;      /* fichier autonome : rien a chercher */
  if (X_ETAT === "en cours" || X_ETAT === "servi") return;
  ...
}
```

Chaque chargeur a une machine à états : `"absent" | "en cours" | "servi" | "echec"`,
et **chaque état d'échec écrit une phrase vraie** (invariant 5).

### 4.3 Les globales

| globale | contenu |
|---|---|
| `window.REPERE_DATA` | 11 décisions éditoriales embarquées (9,7 Ko) — mesuré le 25/08 |
| `window.REPERE_RNE` | Répertoire national des élus (6,78 Mo) |
| `window.REPERE_OFGL` | comptes des collectivités (8,83 Mo) |
| `window.REPERE_CIRCOS` | commune → circonscription(s) (342 Ko, posé le 25/08) |
| `window.REPERE_AGENDA_AN` | agenda de l'Assemblée — **extrait** dans la version servie |
| `window.REPERE_AGENDA_URL` | version servie seulement |
| `window.REPERE_EVENEMENTS_URL` | version servie seulement |
| `window.REPERE_COMPLET` | drapeau de fin de fichier : atteste que tout a été analysé |

Les blocs de données vivent entre marqueurs et sont écrits par des scripts :
`/* REPERE_RNE_DEBUT */ … /* REPERE_RNE_FIN */`, idem `OFGL` et `CIRCOS`.
**Ne jamais éditer un bloc de données à la main.**

### 4.4 Les dix-sept écrans

`s-fil`, `s-agenda`, `s-jeu`, `s-qui`, `s-partis`, `s-debats`, `s-elus`, `s-vote`,
`s-argent`, `s-influence`, `s-suivis`, `s-moi`, `s-carte`, `s-sources`, `s-2027`,
`s-an`, `s-dico`.

Le banc en tient l'**inventaire exact** : une disparition comme une apparition sont
signalées. La refonte prévue vise douze écrans — changer la cible se fait
délibérément dans `test_repere.mjs`, jamais par accident.

**Piège mesuré :** `s-fil`, `s-agenda`, `s-jeu`, `s-qui`, `s-moi` sont des **onglets**
(atteints par `showTab()`, qui fixe `currentTab`). Tous les autres sont des **écrans**
(atteints par `show()`, qui ne touche pas `currentTab`). Tester
`currentTab === "s-argent"` est **toujours faux**.

---

## 5. Carte des fichiers

```
app_repere_v18_20.html      l'application (source de vérité du produit)
test_repere.mjs             le banc : 55 contrôles sur le fichier autonome,
                            64 sur la version servie (les 9 de plus = invariant 1)
outils/
  pipeline.sh               les 13 étapes de la chaîne quotidienne
  collecte.py               télécharge les sources publiques (5 déclarées)
  agenda_an.py              normalise l'agenda de l'Assemblée
  scrutins_an.py            scrutins par député (refuse de compter un non-votant
                            comme votant, et le prouve)
  echantillon_scrutins.py   DÉCRIT une archive JSON sans la deviner → docs/schema_*.md
  echantillon_source.py     idem pour CSV / XLSX
  circos.py                 commune → circonscription(s) depuis le XLSX du ministère
  circos_injecter.py        pose le bloc REPERE_CIRCOS (idempotent)
  decouper.py               découpe RNE + OFGL par département → site_donnees/
  evenements.py             couche éditoriale : data/evenements/*.md → evenements.json
  candidats.py              écrit des brouillons dans data/auto/, jamais publiés
  build_pwa_reconstruit.py  engendre le site ; PROUVE sa transformation avant de produire
  patch_NN_*.py             l'historique des modifications, un fichier par geste
data/
  evenements/*.md           faits VALIDÉS par un humain — seule source du fil
  auto/*.md                 brouillons machine, jamais affichés (`valide: false`)
  notes/, _TEMPLATES/       coffre Obsidian de relecture
docs/
  schema_*.md               schémas ENGENDRÉS des sources (ne pas éditer)
  rapport_*.md              les 7 rapports de l'équipe d'agents du 25/08
site/                       site de RÉFÉRENCE v18.9 — sert de preuve au générateur
mono/                       le monorepo React/Vite, adopté le 26/08 — voir section 14
  scripts/extract-html.js   lit les blocs REPERE_* du mono-HTML → mono/data/
  packages/data-utils/      invariants, magasin IndexedDB, client de données
  tests/                    13 contrôles statiques + 21 dans un navigateur
pousser.bat                 envoie au dépôt (nettoie un MERGE_AUTOSTASH coincé)
```

---

## 6. La chaîne quotidienne

`outils/pipeline.sh`, lancé par `.github/workflows/collecte.yml`. Treize étapes :

1. dépiler les archives téléchargées
2. normaliser l'agenda de l'Assemblée
3. décrire les schémas (scrutins, circonscriptions, acteurs) — **documentaire**
4. table commune → circonscription + injection du bloc
5. scrutins par député
6. découpage par département
7. couche éditoriale : brouillons puis faits validés
8. vérifications indépendantes de ce qui vient d'être écrit
9. construction du site
10. pose des données découpées
11. **banc sur le fichier autonome**
12. **banc sur la version servie** ← le verrou
13. publication Netlify

**Règle de conception de la chaîne :** les ingesteurs neufs **avertissent** au lieu
de tomber (`|| echo "::warning::…"`). Motif écrit dans le fichier : *« un chantier
neuf ne doit pas pouvoir empêcher la mise en ligne de ce qui marche déjà. »*
Le banc, lui, est bloquant : c'est ce qui autorise à publier sans qu'un humain regarde.

---

## 7. Inventaire des données — mesuré le 25 août 2026

| donnée | couverture | source · mise à jour |
|---|---:|---|
| maires et conseils municipaux | 34 637 | RNE (Intérieur, ODbL) · 11 août |
| adjoints | 116 454 | RNE |
| conseillers départementaux | 4 037 | RNE |
| conseillers régionaux | 1 744 | RNE |
| députés et sénateurs | 925 | RNE |
| intercommunalités | 20 028 | RNE |
| comptes des communes | 34 875 | OFGL / DGFiP · 29 juillet · exercices 2021, 2024, 2025 |
| comptes départements / régions | 101 / 17 | OFGL / DGFiP |
| circonscriptions législatives | 34 626 | ministère de l'Intérieur · découpage 2010 |
| réunions de l'Assemblée | 6 280 | Assemblée nationale · collecte du jour |
| **faits validés dans le fil** | **1** | relu et publié à la main |
| brouillons en attente | 14 | `data/auto/`, écrits par la machine |

**Découpage par département :** 104 fichiers. Un lecteur téléchargerait **477 Ko**
(socles + son département, cas médian) au lieu de 16,2 Mo — **35 fois moins**.
Produit et publié, **pas encore lu par l'application**.

**Les onze communes sans circonscription** (communes nouvelles créées après 2017,
absentes du fichier du ministère) : 12218, 14581, 14666, 15031, 15035, 15047,
15171, 49126, 69114, 85165, 85212. L'application dit qu'elle ne sait pas ; elle ne
dit jamais qu'elles n'ont pas de circonscription.

---

## 8. Le banc

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node test_repere.mjs app_repere_v18_20.html
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node test_repere.mjs site_v18_20/index.html
```

- **55 contrôles** sur le fichier autonome, **64** sur la version servie.
- Il monte un serveur HTTP éphémère quand la source déclare une adresse d'agenda,
  et teste en `file://` sinon.
- Les neuf contrôles supplémentaires sont ceux de l'**invariant 1** : service worker
  installé, **réseau coupé**, rechargement, parcours complet, et mesure de ce qui
  s'affiche (maire, circonscription, comptes, faits servis depuis le cache).
- Playwright : chromium dans `/opt/pw-browsers`. **Ne jamais lancer
  `playwright install`.** L'import est portable (nom du paquet, puis chemin absolu).

---

## 9. Pièges déjà rencontrés — ne pas les refaire

| piège | ce qui s'est passé |
|---|---|
| **Deviner une valeur au lieu de la lire** | `SORTS = {"adopte": …}` sans accent alors que la source écrit `"adopté"` : la table ne trouvait jamais rien et produisait « L'Assemblée nationale a l'Assemblée nationale a adopté ». |
| **Une garde sans assertion** | Le côté OFGL de `decouper.py` n'avait aucun contrôle : les 104 fichiers de comptes sont sortis à 23 octets pendant des jours. |
| **Deux endroits qui dérivent la même règle** | L'application et `decouper.py` ne composaient pas le même code de département : 65 communes du Pacifique auraient reçu un 404. |
| **Ne lire que le premier élément d'une liste** | Le descripteur de schémas ratait le mandat en cours à l'Assemblée, qui n'est jamais le premier de la liste. |
| **Une garde qui trébuche sur son propre commentaire** | Trois fois. Toujours chercher l'affectation, jamais la chaîne nue. |
| **Un contrôle calibré sur un cas impossible** | Une phrase de vide écrite pour un cas qui ne peut pas se produire : le contrôle tombe au premier tour, on le désactive, il ne revient jamais. |
| **Un cache pris pour un déploiement** | `raw.githubusercontent` puis le CDN Netlify ont servi des copies périmées. Toujours un paramètre neuf. |
| **`env:` au niveau de l'étape dans GitHub Actions** | Invisible pour le `if:` de cette même étape : le déploiement était silencieusement sauté. Le mettre au niveau du job. |
| **Un script qui écrit son journal dans le dépôt** | `pousser.bat` v1 se sabotait pendant le rebase. Le journal est maintenant ignoré par git. |
| **Une annotation qui affirme sans mesurer** | Trois fois. Une annotation doit mesurer ce qu'elle affirme. |

---

## 10. Ce qui a été refusé, et pourquoi

Ne pas reproposer sans argument neuf.

- **Ingestion de flux de presse.** Reproduction d'œuvre protégée, et un produit qui
  promet « sources officielles uniquement » ne peut pas hériter de la ligne
  éditoriale d'un journal.
- **« Impact » écrit par un modèle de langage.** Un jugement sans source, sur un
  produit dont toute la valeur est de n'en porter aucun. Le résumé automatique reste
  possible **à l'étage brouillon seulement**, réécrit par un humain.
- **Suivi de l'agenda individuel des élus, comptage de présence/absence.**
  Surveillance, et classement de fait (invariants 3 et 8).
- **Comparaison entre communes.** Invariant 3. L'application ne montre que le
  territoire de son lecteur.
- **Marchés publics (DECP), pour l'instant.** Seuil de publication à 40 000 € HT :
  159 435 contrats pour toutes les collectivités confondues contre 34 875 communes.
  L'écran dirait « rien » à la grande majorité des gens, au prix du chantier le plus
  lourd. À revoir après la bêta.
- **Refonte React / Node avec un serveur applicatif.** Refusée le 24 août, et le
  refus tient toujours : un serveur, ce sont des journaux d'accès — donc des
  adresses IP, donc de la donnée personnelle — et un hébergement à payer.
  **Ce qui a été adopté le 26 août est autre chose** : un monorepo React/Vite dont
  la sortie est un dossier de fichiers statiques, sans serveur en production. Voir
  la section 14.
- **Freemium maintenant.** Les cinq écrans d'abonnement sont en veille : un fil à
  un fait ne se vend pas. Ils se rallument quand le contenu le justifie.

---

## 11. Ce qui dort

`const BETA_RESTREINTE = true;` et
`const EN_VEILLE = ["s-abo", "s-paiement", "s-compte-login", "s-compte-gestion", "s-notifs"];`

Les nœuds marqués `data-veille` sont **retirés du DOM au démarrage**. Le banc
vérifie qu'aucun ne survit au boot et qu'aucun écran ne parle encore d'un abonnement.
Attention : lire le code source donnerait l'impression que ces écrans existent — ils
sont supprimés à l'exécution. **Mesurer le runtime, pas la source.**

---

## 12. Où en est le projet, et quoi faire ensuite

### Fait
- Chaîne quotidienne complète et automatique, publication comprise.
- Comptes des collectivités traduits en rapports internes (dette en mois de recettes,
  part des salaires, euros par jour) — cinq divisions, aux trois échelons, chacune
  disant ce qu'elle **ne** veut **pas** dire.
- Circonscription législative affichée pour 34 626 communes.
- Invariant 1 mesuré réseau coupé, pour la première fois.
- Découpage par département corrigé et prouvé.

### Les trois trous
1. **Le fil contient un fait validé.** Ce n'est pas technique : c'est du travail
   éditorial quotidien. Quatorze brouillons attendent, cinq minutes chacun. Personne
   d'autre que le porteur du projet ne peut écrire « ce que ça change » — et c'est
   ce qui rend vraie la promesse « relu par un humain ».
2. **17,3 Mo au premier chargement.** Sur une partie du parc mobile, l'application
   ne s'ouvre pas. Le découpage est prêt et non branché.
3. **On ne peut pas nommer le député d'une commune.** Le RNE ne porte pas le lien
   député → circonscription. Il est dans le référentiel des acteurs de l'Assemblée.

### Prochain ordre de travail
1. Lancer la chaîne : elle produira `docs/schema_acteurs.md` avec le champ manquant.
2. **Jointure député → circonscription**, sur schéma mesuré. ½ journée.
3. **Valider un fait par jour.** 10 min/jour.
4. **Chargeur asynchrone par département.** 3–4 jours, avec quatre correctifs
   bloquants identifiés dans `docs/rapport_invariants.md`.
5. **104 pages départementales** avant d'en engendrer 34 637.

### Les quatre correctifs bloquants du chargeur
- L'alias alsacien : le RNE range les conseillers d'Alsace sous `6AE`, pas sous `67`.
- `s-argent` n'est pas un onglet : le re-rendu à l'arrivée des données ne se
  déclencherait jamais, et le banc resterait vert.
- Le cache d'exécution du service worker lit mais n'écrit jamais : les 104 fichiers
  départementaux ne seraient jamais disponibles hors ligne.
- Aucun ingesteur du RNE n'existe dans le dépôt : les blocs de données sont des
  artefacts figés. Ne pas publier de fiches nominatives indexées avant qu'une étape
  de réingestion existe et échoue bruyamment quand la source ne bouge plus.

---

## 13. Contraintes d'environnement

- Le conteneur de travail **ne peut pas joindre** `data.gouv.fr`,
  `data.assemblee-nationale.fr` ni les autres sources : le mandataire répond **403**.
  Seul le runner GitHub télécharge. C'est la raison d'être des scripts
  `echantillon_*.py` : faire **décrire** par le runner ce qu'on ne peut pas ouvrir.
- Playwright : `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, jamais de
  `playwright install`.
- Le dépôt est sur une machine Windows ; les fichiers y sont déposés par le pont de
  l'application de bureau, puis envoyés par `pousser.bat`.

---

## 14. Le monorepo — adopté le 26 août 2026

Il vit dans **`mono/`**, à l'intérieur de ce dépôt. Le fichier mono-HTML de la
racine **reste la source des données** : `mono/scripts/extract-html.js` lit ses
blocs `REPERE_*` et produit `mono/data/`.

**Ce qu'il change, mesuré :**

| | mono-HTML | monorepo |
|---|---:|---:|
| premier écran | 16,5 Mo | **164 Ko — 54 Ko compressés** |
| + un département | (tout est déjà là) | 186 Ko / 70 Ko compressés |
| contrôles d'invariants | 55 / 64 | **13 statiques + 21 navigateur** |

**Les décisions qui ne se rediscutent pas sans argument neuf :**

1. **Aucun serveur applicatif en production.** `mono/apps/api` sert au
   développement seulement. En production, `data/` est publié tel quel.
2. **Aucune adresse ne porte un code de commune.** Une seule fonction compose les
   adresses (`client.js`), et un contrôle vérifie qu'aucune autre ne le fait.
3. **Deux caches de service worker, pas un.** La coquille est versionnée par le
   build, les données ne le sont pas — sinon la publication quotidienne effacerait
   le département de chaque lecteur chaque matin.
4. **Aucune police chargée depuis un hôte tiers.** Un lien vers
   `fonts.googleapis.com` ferait connaître à Google l'adresse IP de chaque lecteur.
5. **Aucun composant « squelette ».** Un contrôle refuse les mots `skeleton` et
   `shimmer` : une forme grise qui palpite est un contenant sans contenu.

**Les deux chaînes coexistent, et une seule publie.** `collecte.yml` continue de
construire et de mettre en ligne le site à partir du mono-HTML : c'est lui qui
sert les lecteurs. `build-publish.yml` construit le monorepo, l'éprouve, et garde
sa sortie en artefact **sans rien publier**. Basculer la publication est une
décision séparée, à prendre quand cette chaîne aura tourné au vert plusieurs jours
de suite sur les données réelles. Deux chaînes qui publient en même temps se
marcheraient dessus en silence.

**Défauts trouvés le premier jour, par les contrôles eux-mêmes :**

- l'application **ne s'ouvrait pas hors ligne** — le service worker s'enregistre
  après le premier rendu, donc le JS et le CSS n'entraient jamais dans son cache.
  Invisible tant que la coupure était simulée : les requêtes d'un service worker
  échappent à `setOffline`. Le contrôle éteint désormais le serveur pour de bon ;
- une cible tactile à 33 px ;
- un lien vers `fonts.googleapis.com` ;
- 104 pastilles de départements qui remplissaient l'écran.

**Démarrer :**

```bash
cd mono
pnpm install
node scripts/extract-html.js ../app_repere_v18_20.html ./data
pnpm test                                   # 13 controles statiques
pnpm build && cp -r data apps/web/dist/data
node scripts/empreinte-sw.mjs apps/web/dist
node tests/runtime.test.mjs apps/web/dist   # 21 controles dans un navigateur
```

---

## 15. En cas de doute

1. **Mesure.** Ouvre le fichier, compte, lis la capture.
2. **Si tu ne peux pas mesurer, écris-le** dans le rendu et dans le code.
3. **Prouve tes gardes en les cassant.**
4. **Dis ce qui ne va pas**, même si ça contredit ce qui vient d'être demandé.
