Mesures faites sur `/home/claude/repere/app_repere_v18_20.html` (grep/sed/awk uniquement), `test_repere.mjs`, `outils/decouper.py`, `outils/pipeline.sh`, `outils/build_pwa_reconstruit.py`, `site/sw.js`, `outils/collecte.py`. Aucun fichier modifié.

**D'abord la bonne nouvelle, puisqu'elle est la plus coûteuse à vérifier : les 30 ancres de patch de la conception 1 sont toutes justes.** J'ai recompté chacune par `grep -c -F` : les 23 ancres A1–A23 rendent [1], les 7 ancres B1–B7 rendent [1], y compris A12 avec sa flèche typographique et B3 dont l'ambiguïté est correctement signalée (l'ancre courte rend bien [2], L186 et L205). Les numéros de ligne annoncés dérivent de 3 à 23 lignes (`finishOnboard` annoncé 4792, mesuré 4769 ; `updateValidateState` 4600/4588 ; `obValidateDept` 4682/4677 ; `anRendre` 16116/16100), mais aucune ancre textuelle n'est fausse. Le budget gzip est juste aussi : j'ai réexcisé entre marqueurs, j'obtiens 706 997 o bruts / 217 225 o gzip contre 706 911 / 217 190 annoncés.

Voici ce qui casse.

---

## 1. Le correctif `6AE` de la conception 1 est annulé par sa propre fonction de fusion

**Ce qui casse.** Le § 2.5 propose `ALIAS_DEP = {"67":"6AE","68":"6AE"}` dans `decouper.py`. Le § 2.4 écrit la fusion :

```js
if (paq.dep)    { R.dep    = {}; R.dep[paq.d]    = paq.dep.map(dec); }
if (paq.depcan) { R.depcan = {}; R.depcan[paq.d] = paq.depcan; }
if (paq.ddep)   { R.ddep   = {}; R.ddep[paq.d]   = paq.ddep; }
```

`paq.d` vaut ce que `decouper.py` écrit ligne 116 : `paquet = {"d": d}`, donc `"67"`. L'alias fait bien entrer les conseillers d'Alsace dans `rne/67.json`, et la fusion les range sous `R.dep["67"]`. Or `renderQui()` L3923 lit :

```js
const depRne = (STATE.dept === "67" || STATE.dept === "68") ? "6AE" : STATE.dept;
```

`R.dep["6AE"]` est vide. **Le bloc département reste vide pour le Bas-Rhin et le Haut-Rhin exactement comme sans l'alias**, et l'écran affiche « Le Répertoire national des élus embarqué ne porte aucun conseiller pour le Bas-Rhin » — la phrase que la conception dit vouloir supprimer. Le contrôle N4 attraperait la panne mais pas la cause : l'architecte croirait le correctif appliqué.

J'ai confirmé les deux faits séparément : `RNE["dep"]` porte 95 clés dont `6AE`, `departement()` sur les 34 637 codes INSEE en produit 103 et jamais `6AE`.

**Ce que je propose.** Le paquet doit porter DEUX codes : `d` (le code de fichier, celui de l'URL) et `dk` (la clé sous laquelle le RNE range l'assemblée). `decouper.py` écrit `paquet = {"d": "67", "dk": "6AE"}` quand l'alias s'applique, sinon `dk == d`. La fusion écrit `R.dep[paq.dk]`. Et une assertion dans `decouper.py` : aucune clé de `RNE["dep"]` ne doit rester non écrite — c'est elle qui aurait vu le défaut au départ.

---

## 2. `s-argent` n'est pas un onglet : le re-rendu à l'arrivée de la vague 3 ne se déclenche jamais

**Ce qui casse.** L'item 18 de la conception 1 écrit : « Re-rendu à l'arrivée si `currentTab === "s-argent"` ». Mesuré :

- les onglets déclarés sont exactement `s-fil`, `s-agenda`, `s-jeu`, `s-qui`, `s-moi` (`grep -o 'data-s="[^"]*"'`) ;
- `currentTab` n'est affecté qu'en L6789, à l'intérieur de `showTab()`. `show()` (L6799) ne le touche pas ;
- `s-argent` est atteint 4 fois, toutes par `show('s-argent', …)` (L2738, 5029, 5036, 5408), 0 fois par `showTab`.

Donc `currentTab === "s-argent"` est **toujours faux**. Le fichier le dit lui-même en L5403 : « s-qui est un onglet (showTab), s-argent / s-vote / s-dico sont des écrans ».

**Le scénario.** Le lecteur tape « Où va mon argent » depuis l'essentiel. `renderArgent()` déclenche la vague 3 et peint la phrase F, « Les comptes de Ustaritz sont en cours de chargement ». Les 112 Ko arrivent 400 ms plus tard, `ofglFusionner` réussit, l'état passe à `"servi"` — et l'écran ne bouge plus. La phrase reste à l'écran indéfiniment, alors qu'elle est devenue fausse et que la donnée est en mémoire à un mètre de là. Il faut quitter l'écran et y revenir.

**Et le banc reste vert**, parce que le banc écrit `showTab("s-argent")`, ce qui fixe `currentTab` et fait passer le chemin mort. Un banc vert sur un écran mort : la règle de conception écrite en tête de `test_repere.mjs` interdit précisément cela.

**Ce que je propose.** Un seul prédicat, pas deux règles : `chVisible(id)` qui lit l'écran réellement affiché (classe active sur `#s-argent`, ou `NAV_STACK[NAV_STACK.length-1].id`), utilisé pour `s-qui` comme pour `s-argent`. Et le re-rendu doit repasser par `activate(id, titre)`, pas appeler `renderArgent()`/`renderQui()` directement : la conception le dit elle-même au risque 6 du § 6 (`wireClickables`, `syncLieuLabels`, L4933-4937) et l'oublie à l'item 13 et à l'item 18. Elle se contredit d'un paragraphe à l'autre ; c'est le § 6 qui a raison.

---

## 3. L'app et `decouper.py` ne composent pas le même code de département : 65 communes tombent en échec

**Ce qui casse.** Deux règles, écrites à deux endroits, qui ne disent pas la même chose.

`app_repere_v18_20.html` L4551, `deptFromInsee()` :
```js
return c.startsWith("97") || c.startsWith("98") ? c.slice(0, 3) : c.slice(0, 2);
```
`outils/decouper.py` L26, `departement()` :
```python
if insee[:2] == "97": return insee[:3]
return insee[:2]
```

Mesuré sur les 34 637 codes : désaccord sur **65 communes** — 32 en Polynésie française (l'app dit `987`, le découpage écrit `98`) et 33 en Nouvelle-Calédonie (`988` contre `98`). Le découpage produit un unique `donnees/rne/98.json`.

**Le scénario.** Un habitant de Nouméa choisit sa commune. `STATE.dept` vaut `988`. La vague 2 demande `donnees/rne/988.json` → 404 → état `"echec"` → phrase D : « la liaison avec le serveur a échoué ». C'est faux : la liaison marche, le fichier n'existe pas. Et dans le fichier autonome, ces 65 communes fonctionnent parfaitement. La version servie régresse pour eux seuls, silencieusement.

**Aucun contrôle proposé ne l'attrape** : le N1 de la conception 1 autorise `donnees/(rne|ofgl)/(socle|\d{2,3}|2[AB])\.json`, et `988` satisfait `\d{2,3}`.

**Ce que je propose.** La conception a raison de dire qu'un seul endroit doit composer une URL de donnée ; il faut aller plus loin et dire qu'**un seul endroit dérive un code de département**. Concrètement : `decouper.py` adopte la règle de `deptFromInsee` (98x sur trois chiffres), écrit la liste effective dans le manifeste, et le banc ajoute un contrôle hors navigateur : `set(manifeste.departements) == { deptFromInsee(c) for c in RNE.cl }`. Sans cette égalité écrite quelque part, la divergence se reproduira au prochain territoire à statut particulier.

À noter au passage : `obValidateDept()` construit sa liste déroulante depuis `Object.keys(DEPTS)`, qui compte 101 entrées. `975` et `98x` n'y figurent pas. Ces 67 lecteurs (65 + 2 à Saint-Pierre) ne peuvent déjà pas choisir leur département à la main. C'est antérieur aux deux conceptions, mais c'est le même angle mort.

---

## 4. La PWA installée perd « Qui décide » et « Où va mon argent » hors ligne — invariant 1

**Ce qui casse.** `site/sw.js` précharge `COQUILLE` : `index.html`, le manifeste, `confidentialite.html`, `accueil.html`, cinq icônes. Rien sous `donnees/`. Le cache d'exécution proposé au § 5.3 met en cache **à la lecture**.

**Le scénario.** Quelqu'un installe Repère chez lui, en wifi. Il regarde son fil. Il n'ouvre pas « Qui décide ». Le lendemain, dans le métro, il ouvre l'app pour vérifier le nom de son maire. `rne/socle.json` et `rne/<D>.json` n'ont jamais été lus, donc jamais mis en cache. Écran : « la liaison avec le serveur a échoué ». Aujourd'hui, sur le même geste, il obtient son maire.

L'invariant 1 dit « l'application fonctionne hors ligne, sans serveur applicatif ». La conception 1 le préserve pour le fichier autonome (§ 1.2 : globales absentes = rien à chercher, mécanisme réel, qui existe déjà) et le casse pour la PWA, qui est la version que les gens installent. Le § 6 ne mentionne pas ce cas. Le contrôle N11 teste « requêter, passer hors ligne, requêter à nouveau » — c'est-à-dire exactement le cas qui marche.

À noter que le trou préexiste : la dernière ligne de `site/sw.js` est `caches.match(r).then(m => m || fetch(r))`, qui lit le cache mais n'y **écrit jamais**. `donnees/agenda_an.json` n'est donc déjà pas disponible hors ligne aujourd'hui. La conception 1 hérite du trou et le multiplie par 207 fichiers.

**Ce que je propose.** Au succès de la vague 2 — le moment où le département est connu et où le lecteur a montré qu'il reste —, précharger aussi `ofgl/socle.json` et `ofgl/<D>.json` en tâche de fond. 112 Ko une fois, à l'adoption, pas à chaque lecture. La PWA installée redevient complète pour SON département, ce qui est la promesse. Et le contrôle N11 doit être écrit dans l'autre sens : installer, ne jamais ouvrir `s-qui`, passer hors ligne, ouvrir `s-qui`, exiger un nom de maire.

---

## 5. `ofgl_ingerer.py` et `rne_extract.py` n'existent pas. Rien dans le dépôt ne réingère le RNE

**Ce qui casse.** Vérifié :

- `ls outils/*.py` → 15 fichiers ; ni `ofgl_ingerer.py`, ni `rne_extract.py`, ni `pages_communes.py` ;
- `find . -name ofgl_ingerer.py -o -name rne_extract.py` → rien ;
- `grep -rn "rne_extract\|ofgl_ingerer" --include=*.py --include=*.sh --include=*.md --include=*.yml .` → 0 occurrence ;
- `outils/collecte.py` : le RNE **n'est dans aucune des deux listes de sources**, ni `SOURCES`, ni `SOURCES_LOURDES`. L'OFGL n'est que dans `SOURCES_LOURDES`, désactivée, avec le motif « Déjà embarqué sous forme pré-agrégée ».

Les blocs `REPERE_RNE` et `REPERE_OFGL` sont des artefacts figés, produits une fois par un outil qui n'est pas dans le dépôt.

**Conséquence sur la conception 1.** L'item 19 confie le compte de couverture OFGL à `ofgl_ingerer.py`, « qui l'écrit une fois pour toutes ». Personne ne peut l'écrire. Le seul programme qui lit réellement ces structures est `decouper.py` : c'est lui qui doit calculer le compte (avec la définition exacte du bloc L5608-5616 : une commune compte si `r.ex` est non vide) et l'émettre dans `meta.json`. Sinon le chiffre sera recopié à la main, donc faux au premier changement.

**Conséquence sur la conception 2, et c'est la plus lourde.** Le § 5 dit « La donnée périme. Un maire battu en mars reste sur la page jusqu'à la réingestion du RNE » et s'appuie sur « le RNE bouge une fois par mois ». Il n'y a pas de réingestion. `meta.maj` vaut `2026-08-11` ; nous sommes le 25 août ; rien dans `pipeline.sh` ne peut le faire bouger. La promesse écrite dans les mentions — « nous retirons l'information contestée sous 72 heures, et nous la remettons quand la source aura été corrigée » — a une première moitié tenable à la main et une seconde moitié qu'aucun mécanisme ne peut tenir.

**Ce que je propose.** Ne pas publier 151 091 fiches nominatives indexées avant qu'une étape d'ingestion du RNE existe dans `pipeline.sh`, produise `meta.maj` et échoue bruyamment quand la source ne bouge plus — le même garde-fou que celui déjà écrit pour l'agenda de l'Assemblée à l'étape 4 (« GARDE-FOU CONTRE LE GEL SILENCIEUX »). Le risque juridique réel n'est pas la licence ODbL, qui autorise clairement la republication : c'est de devenir l'éditeur principal d'une fiche nominative pour 151 091 personnes avec un pipeline incapable de la mettre à jour. Une page indexée qui dit « maire de X » de quelqu'un qui ne l'est plus depuis huit mois est un préjudice concret, et l'argument « c'est la source qui est en retard » ne tient pas quand la source, elle, a été corrigée.

---

## 6. Conception 2 : la phrase « Pas de maire » ne peut jamais s'afficher, et son contrôle échouera au premier tour

**Ce qui casse.** Mesuré : `set(RNE["cl"]) == set(RNE["com"])`, 34 637 des deux côtés, écart nul dans les deux sens — c'est d'ailleurs l'auto-contrôle 1 de la conception elle-même. **Toute commune qui a une page a un maire.** Les 305 communes sans maire sont celles qui sont dans OFGL et absentes du RNE, et le § 6.1 explique correctement qu'elles n'ont pas de nom et donc pas de page.

La conception écrit donc une phrase de vide soignée — « Le Répertoire national des élus ne porte pas de maire pour cette commune… » — pour un cas qui ne peut pas se produire, et calibre l'auto-contrôle 5 sur « 305 sans maire » alors que le compte réel est 0. L'assertion tombe au premier run.

**Ce que je propose.** Garder la phrase (le RNE peut perdre un maire à la prochaine ingestion, s'il y en a une) mais l'écrire comme une branche jamais empruntée aujourd'hui, et calibrer le contrôle sur `0`, en le disant. Un contrôle calibré sur un chiffre faux est pire qu'absent : il oblige à le désactiver, et une fois désactivé il ne revient jamais.

---

## 7. Conception 2 : la table département → région existe déjà dans l'app

**Ce qui casse.** Le § 3 affirme : « Une seule donnée n'existe nulle part dans le dépôt et doit être déclarée en constante dans le script : la table département → région (101 lignes). Vérifié : ni `REPERE_RNE`, ni `REPERE_OFGL`, ni aucun fichier de `outils/` ne la porte. »

Elle est dans l'app, L3723 et L3729 :

```js
const REGIONS = { ARA:"Auvergne-Rhône-Alpes", … };   /* 18 régions */
const DEPTS = (() => {
  const t = "01 Ain ARA;02 Aisne HDF;…976 Mayotte MAY";
  …
})();
```

101 entrées, code → `{nom, reg}`. La vérification a porté sur trois endroits et pas sur le quatrième — le code écrit à la main de l'application, que le § 1.1 de l'autre conception liste explicitement parmi les constantes embarquées.

**Le scénario.** `pages_communes.py` déclare sa propre copie. Un jour quelqu'un corrige une des deux. La page publique et l'application disent alors deux choses différentes sur la même commune, dans le même produit. C'est exactement la faute que le commentaire L3719-3722 raconte avoir déjà commise (« plusieurs écrans étaient écrits en dur sur Fontainebleau · Seine-et-Marne · Île-de-France »).

**Ce que je propose.** Le générateur extrait `DEPTS` de l'app comme il extrait `REPERE_RNE`. Ce n'est pas du JSON — c'est une IIFE — donc `extraire()` ne suffit pas ; il faut lire le littéral `const t = "…"` par expression rationnelle et le découper avec la même règle, ou mieux : promouvoir `DEPTS`/`REGIONS` en bloc engendré `window.REPERE_GEO` que `decouper.py` sait relire. Deuxième option préférable — elle supprime la classe entière de problème.

Mesuré au passage, et cohérent avec l'auto-contrôle 8 de la conception : `DEPTS` couvre 101 codes, le RNE en produit 103 ; manquent `975` et `98`, soit 67 communes pour lesquelles `terr()` rend déjà `deptNom: null` et l'app affiche « non identifié ».

---

## 8. Conception 2 : les auto-contrôles 6 et 7 s'annulent eux-mêmes

**Ce qui casse.** Le contrôle 6 exige qu'aucune page ne contienne `présence`, `absence`, `patrimoine`, `HATVP`. Le § 8 de **chaque** page écrit : « aucune donnée de présence ou d'absence » et « ni le patrimoine ni les revenus ». Le contrôle échoue sur 34 637 pages sur 34 637.

Le contrôle 7 exige qu'aucune page ne contienne `classement`, `palmarès`, `note`, « sauf dans le § 8 qui dit précisément qu'il n'y en a pas ». Mais le § 8 est sur toutes les pages : l'exception avale la règle et le contrôle ne mesure plus rien.

C'est le même piège que le banc a déjà rencontré et documenté deux fois — « un banc qui confond la promesse et la violation ne sert à rien » pour `indexedDB`, et le retrait des citations entre guillemets français pour la charte.

**Ce que je propose.** Contrôle structurel, pas textuel : le § 8 vit dans un conteneur d'identité connue (`<section id="ne-dit-pas">`) ; l'assertion retire ce nœud puis cherche les mots dans ce qui reste. C'est ce que fait déjà `test_repere.mjs` pour les commentaires et les citations.

---

## 9. Le banc ne tourne jamais sur le fichier autonome : le contrôle N8 serait décoratif

**Ce qui casse.** `outils/pipeline.sh`, étape 6 : `node test_repere.mjs site_engendre/index.html`. Une seule invocation, sur la version servie.

Le contrôle N8 de la conception 1 — « le fichier autonome ne demande rien », ouvert en `file://` — est présenté comme « le contrôle qui garde les deux sorties divergentes du pipeline ». C'est le gardien de l'invariant 1 et il ne s'exécuterait jamais. Le banc sait pourtant déjà distinguer les deux cas : il ne monte son serveur HTTP que `if (/REPERE_AGENDA_URL\s*=/.test(SRC))`, et teste sinon en `file://`.

**Ce que je propose.** Une seconde ligne dans `pipeline.sh` : `node test_repere.mjs "$APP"` en plus de `node test_repere.mjs site_engendre/index.html`. Deux sorties, deux passages au banc. Sinon la divergence entre les deux versions n'est gardée par rien.

---

## 10. Le contrôle N2 (poids du premier écran) ne peut pas se mesurer sur le serveur du banc

**Ce qui casse.** N2 propose d'« additionner le `content-length` de tout ce qui part avant le premier focus ». Le serveur du banc, `test_repere.mjs:190`, écrit :

```js
rep.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
fs.createReadStream(f).pipe(rep);
```

Aucun `content-length`. La réponse part en chunked. `content-length` sera systématiquement absent, la somme vaudra 0, et le contrôle passera au vert quel que soit le poids — y compris le jour où quelqu'un réembarque une table « juste pour dépanner », c'est-à-dire précisément le cas que N2 dit garder.

**Ce que je propose.** Soit ajouter `"content-length": fs.statSync(f).size` au serveur du banc (une ligne, et c'est plus honnête de toute façon), soit mesurer côté client : `page.on("response", async r => total += (await r.body()).length)`. La seconde option mesure ce qui arrive vraiment, pas ce que le serveur déclare.

---

## 11. La panne de pipeline décrite n'est pas celle qui se produira

**Ce qui casse.** Le risque 4 de la conception 1 dit : « `[ -d site_donnees ]` reste vrai après un échec de `decouper.py` […] un pipeline "réussi" servira des élus périmés ».

`site_donnees/` n'est pas dans le dépôt (pas dans `ls`, et l'étape 3 sexies l'écrit à chaque run). Sur un runner GitHub, qui part d'un clone propre, un échec de `decouper.py` laisse **aucun** répertoire : `[ -d site_donnees ]` est faux, l'étape 5 bis est sautée, et le site publie un `donnees/` qui ne contient que `agenda_an.json`. Le jour de la bascule, ce n'est pas « des élus périmés » que voient les lecteurs, c'est **« la liaison avec le serveur a échoué » pour les 34 875 communes**, sur un pipeline qui annonce un succès.

Le correctif proposé est le bon (rendre l'étape bloquante), mais la phrase que voit l'utilisateur n'est pas la même, et c'est elle qui décide de la gravité. Il faut aussi que N9 et N10 tournent **dans la chaîne**, pas seulement qu'ils existent : ce sont les seuls contrôles hors navigateur, et rien dans `pipeline.sh` n'appelle un contrôle hors navigateur aujourd'hui.

---

## 12. Doctrine du vide : quatre états n'ont pas de phrase

Les phrases A à J de la conception 1 sont bien écrites et bien distinguées — B contre la phrase de `obDemanderDept` L4671, et E contre D, ce sont les deux bonnes distinctions. Il en manque quatre.

**a) Les deux phrases de l'écran Sources deviennent fausses.** L5636 : « Aucun élu embarqué : le bloc RNE de ce fichier est vide. » L5647 : « Aucun compte embarqué : le bloc OFGL de ce fichier est vide. » Dans la version servie les deux blocs SONT vides — la phrase est littéralement exacte et complètement trompeuse : la donnée existe, elle est ailleurs. L'item 19 corrige les comptes et oublie les deux phrases.

**b) « Le découpage n'a pas produit ce fichier ».** C'est l'état des 65 communes du défaut n° 3 et de l'Alsace du défaut n° 1 : le réseau marche, le serveur répond 404, la donnée existe dans la source. Aujourd'hui la conception le rendrait en phrase D, « la liaison avec le serveur a échoué », qui accuse le réseau du lecteur d'une faute de notre chaîne. Il faut une phrase distincte, et un bouton qui pointe vers la source plutôt que vers « Réessayer », puisque réessayer ne peut rien donner.

**c) Hors ligne.** `navigator.onLine === false` n'est pas « la liaison a échoué ». La phrase vraie est : « Vous êtes hors ligne, et ces élus n'ont jamais été téléchargés sur cet appareil. Ils le seront à votre prochaine connexion. » Un bouton « Réessayer » dans un tunnel est un cul-de-sac, exactement ce que N7 dit vouloir éviter.

**d) Conception 2 : la fiche retirée sur demande.** Le § 5 invente `outils/retraits.json` et ne lui écrit pas de phrase. Elle ne doit surtout pas réutiliser « Le Répertoire national des élus ne porte pas de maire pour cette commune », qui serait faux et rejetterait la responsabilité sur le ministère. Il faut : « À la demande de la personne concernée, cette information a été retirée de cette page. Elle reste publiée par le Répertoire national des élus, à l'adresse ci-dessous. »

---

## 13. Conception 2 : l'URL de la page publique est la fuite que le découpage par département sert à éviter

**Ce qui casse.** Le § 4 est méticuleux et il a raison : `#c=` plutôt que `?c=`, parce que le fragment ne part jamais au serveur. J'ai rejoué la regex L16176 : `[?&#]c=([^&#]+)` prend bien le `#`. Correct, et le défaut signalé dans `build_pwa_reconstruit.py` L263 est réel — mais c'est **deux** changements, pas un : il y a aussi `assert "index.html?c=" in accueil` en L319, qui fera tomber le build.

Le problème est ailleurs. `GET /communes/ustaritz-64547` inscrit la commune du lecteur dans les journaux d'accès de l'hébergeur, à chaque visite, pour tout le monde. C'est davantage que ce que l'application enverra jamais après la conception 1. J'ai vérifié que rien ne le voit : les deux expressions de `test_repere.mjs:396` rendent 0 fautive sur ces URL (le caractère qui précède les cinq chiffres est un tiret, pas `/` ni `=`), et le banc n'observe que les requêtes de `index.html`.

Ce n'est peut-être pas une faute — une page publique lue par un visiteur anonyme n'est pas une application installée qui téléphone la commune de son propriétaire à chaque lancement. Mais c'est un **arbitrage**, et la conception le laisse en silence, protégé par un hasard de regex. Le § 2 dit d'ailleurs « ce n'est pas un hasard heureux à conserver par chance » à propos du code INSEE, et s'arrête juste avant de tirer la conclusion.

**Ce que je propose.** Écrire l'arbitrage, à côté de la règle du découpage par département, dans les mêmes termes : ce que le serveur apprend d'un visiteur de page publique, pourquoi c'est acceptable, et ce qui ne doit jamais s'y ajouter (aucun paramètre, aucune mesure d'audience — le § 5 e) le dit déjà et il a raison). Et le contrôle proposé au § 2 (rejouer les regex sur les 34 637 URL) doit interdire en plus toute chaîne de requête sur `/communes/`, pour la même raison que N1 l'interdit sous `donnees/`.

---

## 14. Conception 2 : « ne sert pas à comparer » est une phrase, pas un mécanisme

**Ce qui casse.** L'invariant 3 interdit « aucun classement, score, ou tri numérique de personnes, de partis ou de territoires ». Le § 7 imprime un montant par habitant sur chaque page et écrit « il ne sert pas à comparer Ustaritz à une autre commune ». Dans l'application, ce garde-fou est structurel : le lecteur ne voit que sa commune. Sur 34 637 pages indexées, la structure fait exactement l'inverse — elle constitue un jeu de données comparable, ligne à ligne, par n'importe qui.

La phrase est nécessaire. Elle ne suffit pas. Ce qui la rend vraie, c'est ce que les pages ne contiennent pas.

**Ce que je propose.** Écrire la contrainte, et l'asserter :
- `/communes/<dept>/index.html` ne porte que des noms, aucun chiffre de plus de trois chiffres, aucun `€` ;
- aucune page ne lie une commune à une autre commune (pas de « communes voisines », pas de « voir aussi ») ;
- aucun tableau triable, nulle part.

Sans ces trois lignes dans le générateur, la première demande produit « et si on ajoutait les communes voisines en bas de page », et l'invariant tombe sans qu'aucun contrôle ne s'en aperçoive.

---

## 15. Points où les deux conceptions ont raison, et où je n'ai rien à ajouter

- Le défaut ⛔ OFGL de `decouper.py` est confirmé et je l'ai chiffré : `com_ofgl` itère sur `["terr","exercices","source"]`, `departement("terr")` vaut `"te"`, et les 103 fichiers font **23 octets** — `{"d":"01","commune":{}}`. À corriger avant toute autre chose, sinon l'app dira « les comptes de votre commune ne figurent pas dans le fichier officiel » à 34 875 communes sur 34 875.
- `Promise.all` atomique socle + département : le raisonnement sur `personne()` et les rangs ≥ 2 est exact, et le contrôle de quatre lignes avant installation est le bon geste. N3 est bien le contrôle non négociable.
- Le déclencheur de la vague 2 sur `STATE.dept` et non `STATE.insee` : vérifié, `obDemanderDept()` L4657 fixe bien le département sans INSEE.
- `finishOnboard()` ne lit pas le RNE : vérifié. `coverage()` L8529 ne lit que `STATE.commune` et `STATE.dept`. Le premier écran après l'onboarding se peint sans attendre.
- Le timeout : vérifié, ni `anCharger` L16076 ni `evCharger` L8978 n'en ont, et `fetchWithTimeout` L4540 existe bien.
- `estBonne()` réutilisable dans le cache d'exécution : `rep.type === "basic"` tient, le gestionnaire `fetch` sort déjà avant sur toute origine étrangère.
- Le RNE ne porte **aucune date de naissance** — la conception 2 le laissait « à vérifier », je l'ai vérifié : `com` vaut `[p, n, f]`, `R.d` compte 254 dates, toutes ISO, toutes entre 2017-03-19 et 2026-05-04, aucune antérieure à 1990. Ce sont des dates de mandat. L'invariant 8 tient par construction sur ce point.
- Les chiffres de la conception 2 tiennent au recomptage : 34 637 / 34 875 / 305 / 67 (65 en `98`, 2 en `975`) / 14 609 sans EPCI / 2 259 collisions de slug. Les zéros OFGL : je trouve 2 034 communes et 1 654 / 1 726 sur les rangs 5 et 6, contre 2 042 / 1 661 / 1 733 annoncés — l'écart vient probablement d'une définition légèrement différente, la conclusion est la même et elle est juste.
- L'exigence « aucune chaîne de requête sous `donnees/` » : conclusion juste. J'ai rejoué la regex, `?v=12345` est bien fautif. La démonstration est incomplète (n'importe quel groupe de cinq chiffres après `=` l'est, pas seulement un cache-buster), la règle reste la bonne.
- LCEN : la conception 2 a raison, l'identité de l'éditeur devient obligatoire dès lors qu'un tiers veut exercer un droit. Le pied actuel d'`accueil.html` ne suffit pas.
- Le refus de `noindex` sur les seuls adjoints : raison juste, un traitement différencié sans critère est pire qu'aucun.

---

## 16. Deux points mineurs, notés pour qu'ils ne se perdent pas

- `rneOk()` a **11** appelants, pas 14 (`grep -n -o 'rneOk()'` → 11 ; `ofglOk()` → 3). L'argument de l'item 2 — ne pas transformer `rneOk()` en tri-état — reste juste ; seul le compte est faux.
- `obUseLocation()` L4690 envoie encore les coordonnées GPS exactes du lecteur à `https://geo.api.gouv.fr/communes?lat=…&lon=…`. Le commentaire L4577 dit « L'appel réseau à geo.api.gouv.fr a été retiré » — il l'a été de `fallbackSearch`, pas de la géolocalisation. Ni le contrôle d'architecture du banc (pas de code à cinq chiffres, pas de `insee=`) ni le parcours du banc (qui ne déclenche jamais la géolocalisation) ne le voient. Hors périmètre des deux conceptions, mais le N1 proposé doit décider quoi en faire plutôt que de le croiser sans le nommer.
- Le commentaire L6893 annonce une **seconde clé de stockage**, `repere.acces`, « à inscrire au banc de test avant d'être posée ». Le contrôle `cles.length <= 1` tombera ce jour-là. Hors périmètre, mais c'est écrit dans le fichier et personne ne l'a repris.