Aucun fichier du dépôt modifié. Tout est mesuré dans `/tmp/claude-0/-home-claude/4308483e-90d9-5053-bcb6-33eae98f4b9c/scratchpad/mesure/`.

---

# PAGES PUBLIQUES PAR COMMUNE — conception mesurée

Mesuré le 2026-08-25 sur `app_repere_v18_20.html` (16 994 801 o), en engendrant **réellement les 34 942 pages** trois fois (trois dispositions de fichiers) depuis un prototype complet, dans un scratchpad.

---

## 0. Les six mesures qui décident de tout

| mesure | valeur |
|---|---|
| Communes qui peuvent avoir une page | **34 637**, pas 34 875 (§ 6.1) |
| Rendu seul, 34 637 pages | **2,6 s** (13 300 pages/s) |
| Rendu + écriture disque, à plat | **9,4 s** |
| Poids HTML, CSS inline | 11,1 Ko médian · **380 Mo** au total |
| Poids HTML, CSS externe | 8,8 Ko médian · **300 Mo** au total |
| Re-génération sans changement de données | **3,6 s, 0 fichier réécrit** |

**Le temps de génération n'est pas le problème.** Un run GitHub Actions gratuit fait ça en 15 s. Le problème est le **déploiement de 34 637 fichiers vers Netlify**, et je ne peux pas le mesurer (§ 6.3).

---

## 1. LA STRUCTURE DE LA PAGE

Une seule page par commune, pas deux. Raisons mesurées : 34 637 pages au lieu de 69 274 ; et les deux titres demandés tiennent tous les deux dans la page, en `<h2>`, donc les deux requêtes (« maire de Ustaritz », « budget Ustaritz ») trouvent leur phrase exacte sans diluer l'autorité de l'URL. La partie argent est atteignable par ancre `#argent`.

L'ordre suit l'ignorance du lecteur, pas l'organigramme de la République : on commence par ce qu'il cherche, on finit par ce qu'il ne savait pas chercher.

### En-tête
```
Pyrénées-Atlantiques (64) · Repère
H1 : Qui décide à Ustaritz, et où va l'argent de la commune
```
> Ustaritz compte 7 914 habitants (chiffre retenu par l'OFGL pour l'exercice 2025). Cette page rassemble ce que les données publiques disent des personnes qui décident ici, et de l'argent de la commune. Elle n'exprime aucune opinion et ne compare Ustaritz à aucune autre commune.

### § 1 — `H2 : Qui décide à Ustaritz` (couleur ville, `#0e7490`)
Le maire, son nom, sa fonction, sa date de mandat. Puis la traduction :
> Le maire n'est pas élu directement par les habitants : il est choisi par le conseil municipal, lui-même élu aux élections municipales. Il prépare le budget de la commune, dirige ses agents, signe les permis de construire et préside le conseil municipal. Il est aussi, au nom de l'État, officier d'état civil : c'est à ce titre qu'il célèbre les mariages.

Ligne de source, visible : *Répertoire national des élus, ministère de l'Intérieur, mise à jour du 11 août 2026. Licence ODbL 1.0.*

### § 2 — `H3 : Les adjoints au maire`
Liste, avec l'intitulé officiel. Puis :
> Un adjoint reçoit du maire une délégation : il décide à sa place sur un domaine précis — les écoles, les travaux, les finances. Le numéro (1ᵉʳ, 2ᵉ…) est l'ordre du vote du conseil municipal, **ce n'est pas un classement d'importance**. Le Répertoire national des élus ne publie pas le détail des délégations : pour savoir qui s'occupe de quoi, la mairie le dit.

La phrase en gras est là pour l'invariant 3 : une liste numérotée EST un classement aux yeux d'un lecteur, sauf si on lui dit que non.

### § 3 — `H2 : Ce qui ne se décide pas à la mairie` (couleur agglo, `#0891b2`)
C'est la section qui justifie à elle seule le mot « traducteur ».
> Une intercommunalité est un regroupement de communes qui exercent ensemble des compétences qu'elles ne gardent plus chacune de leur côté : le plus souvent la collecte des déchets, l'eau et l'assainissement, les transports, les zones d'activité, parfois l'urbanisme. **Beaucoup de décisions que l'on croit prises à la mairie le sont ici.** Ses conseillers ne sont pas élus à part : ce sont des élus municipaux désignés par leur commune.

Puis `H3 : Les représentants d'Ustaritz au conseil communautaire`.

### § 4 — `H2 : Le département : Pyrénées-Atlantiques` (couleur dept, `#b45309`)
Canton, puis les conseillers départementaux **de ce canton précis** (jointure mesurée `ccan` → `depcan`, § 6.2).
> Le département gère les collèges, les routes départementales, le RSA, l'aide sociale à l'enfance et l'aide aux personnes âgées. C'est l'échelon dont on parle le moins et qui dépense le plus pour le social.

Phrase conditionnelle, à n'écrire que si le canton compte exactement 2 élus (mesuré : 1 974 cantons à 2, **35 à 1, 18 à 3**) :
> Chaque canton élit deux conseillers départementaux, une femme et un homme, sur le même bulletin : c'est la loi depuis 2015.

### § 5 — `H2 : La région : Nouvelle-Aquitaine` (couleur région, `#6d28d9`)
> La région gère les lycées, les trains du quotidien (TER), la formation professionnelle et l'apprentissage, et une partie du développement économique. Ses 183 conseillers régionaux sont élus sur des listes régionales : **aucun d'eux ne représente Ustaritz en particulier**, et c'est pourquoi cette page ne désigne pas « votre » conseiller régional. La liste complète est dans l'application.

C'est de la doctrine du vide appliquée à un vide qui n'en est pas un : la donnée existe, mais la rattacher à une commune serait faux.

### § 6 — `H2 : À l'Assemblée nationale et au Sénat` (couleur France, `#1d1d1f`)
> Les Pyrénées-Atlantiques envoient **6 députés** à l'Assemblée nationale et **3 sénateurs** au Sénat. Les députés sont élus par circonscription ; le découpage qui dit laquelle est la vôtre n'est pas encore publié sur cette page, nous ne pouvons donc pas désigner votre député sans risquer de nous tromper. Les sénateurs, eux, sont élus par les grands électeurs — pour l'essentiel les conseillers municipaux du département : **votre conseil municipal vote pour eux, vous non.**

Vérifié contre le réel : 64 = 6 circonscriptions, 3 sénateurs. `outils/circos.json` n'existe pas encore sur le disque ; le jour où `circos.py` produira sa table, ce paragraphe se resserre sur LE député, et c'est là que la page gagnera le plus.

### § 7 — `H2 : Où va l'argent d'Ustaritz` (ancre `#argent`)
> Voici les comptes de la commune pour 2025. Chaque ligne porte le nom officiel de l'agrégat et sa traduction. Le montant par habitant sert à donner un ordre de grandeur : **il ne sert pas à comparer Ustaritz à une autre commune**, qui n'a ni les mêmes charges ni les mêmes compétences.

Les six agrégats viennent tels quels de `OFGL.meta.agregats`, avec leur traduction déjà écrite dans la donnée (Recettes totales → « Ce qu'elle encaisse »…). Rien n'est réinventé côté page.

Puis :
> Ces chiffres disent combien la commune encaisse, dépense et doit. **Ils ne disent pas si une dépense était utile, ni qui l'a votée** : cela se lit dans les délibérations du conseil municipal, publiques et affichées en mairie.

Source visible : *OFGL, comptes 2021, 2024, 2025, mise à jour du 29 juillet 2026. Licence ouverte 2.0. Budget principal seulement, budgets annexes exclus.*

### § 8 — `H2 : Ce que cette page ne dit pas, et pourquoi`
Les invariants, dits au lecteur plutôt que gardés pour nous :
> Elle ne publie **ni le patrimoine ni les revenus** des élus, et **aucune donnée de présence ou d'absence** : ces chiffres se lisent presque toujours de travers. Elle ne donne **aucune note, aucun classement, aucun palmarès** et ne compare pas Ustaritz à la commune d'à côté. Elle n'indique pas l'étiquette politique des élus : le fichier national ne la porte pas pour les communes de moins de 3 500 habitants, l'afficher pour les unes et pas pour les autres créerait une inégalité de traitement. Enfin, une donnée manquante est écrite en toutes lettres plutôt que remplacée par un zéro.

### § 9 — `H2 : Aller plus loin` → le bouton (§ 4 ci-dessous)
### § 10 — Pied : sources, mentions, rectification, INSEE

---

### Les quatre phrases de la doctrine du vide, écrites

**Pas de maire** (305 cas mesurés, § 6.1) :
> Le Répertoire national des élus ne porte pas de maire pour cette commune à la date de la dernière mise à jour. Cela arrive quand une commune vient de fusionner, quand un conseil municipal est incomplet, ou quand la préfecture n'a pas encore transmis le résultat d'une élection. La mairie reste la source la plus sûre : demandez-lui.

**Pas d'intercommunalité** (14 609 communes, mesuré : `ecc` ne couvre que 20 028 / 34 637) :
> Le Répertoire national des élus ne rattache pas cette commune à une intercommunalité. C'est le cas des communes isolées et de la plupart des communes d'outre-mer à statut particulier. Le site de la préfecture publie la carte à jour des intercommunalités du département.

**Pas de comptes OFGL** (67 communes mesurées : 65 en Polynésie/Nouvelle-Calédonie, 2 à Saint-Pierre-et-Miquelon) :
> L'Observatoire des finances locales ne publie pas de comptes pour cette commune. C'est le cas des communes de Polynésie française, de Nouvelle-Calédonie, de Wallis-et-Futuna et de Saint-Pierre-et-Miquelon, dont les finances relèvent d'un régime propre et ne sont pas agrégées dans le fichier national. Le budget voté reste consultable en mairie : c'est un document public.

**Un agrégat à zéro** (2 042 communes ont au moins un 0 sur le dernier exercice, dont **1 733 sur « dette par habitant »** et 1 661 sur « encours de dette ») :
> Pour 2025, la source ne publie pas de montant « encours de dette » cette année-là. **Un montant absent n'est pas un montant nul** : nous préférons l'écrire plutôt que d'afficher un zéro qui serait faux.

C'est le point le plus important de la page argent. 1 733 communes sans dette affichée : si on imprime « 0 € », on invente une commune sans dette. Mesuré rang par rang : les zéros tombent sur les rangs 5 et 6 du vecteur (encours de dette, dette/hab), rarement ailleurs (rangs 7–10 : ~200 cas chacun ; rangs 0, 2, 4, 12 : 6 cas).

---

## 2. LE SCHÉMA D'URL

```
/communes/<slug>-<insee>            →  /communes/ustaritz-64547
/communes/                          →  index alphabétique par département
/communes/64/                       →  les 546 communes des Pyrénées-Atlantiques
```

**Pourquoi le code INSEE dans l'URL, alors qu'il est laid.** Mesuré : les 34 637 noms de commune produisent **32 378 slugs distincts — 2 259 collisions**. « Sainte-Colombe » existe 12 fois, « Saint-Sauveur » 11, « Le Pin » 9. Sans le code, un tiers des pages écraserait une autre, ou il faudrait un suffixe arbitraire (`-2`, `-3`) qui serait, lui, un classement.

**Pourquoi le nom quand même.** L'URL est lue par un humain et par un moteur. `/communes/64547` ne dit rien à personne.

**Le contrôle du banc ne s'y oppose pas, et je l'ai vérifié plutôt que supposé.** J'ai passé les 34 637 URL dans les deux expressions de `test_repere.mjs:396` :
```
/[\/=](\d{5}|2[AB]\d{3})(\.json|\/|$|&)/   et   /insee=|commune=/i
```
→ **0 URL fautive.** La première exige `/` ou `=` *immédiatement* avant les cinq chiffres ; ici c'est un tiret. Ce n'est pas un hasard heureux à conserver par chance : **il faut ajouter un contrôle au banc** qui rejoue cette regex sur toutes les URL engendrées, sinon le jour où quelqu'un écrit `/communes/64547` la règle tombe sans bruit.

Et de toute façon **l'application ne demande jamais ces pages** : le banc n'observe que `page.on("request")` sur `index.html`. Le contrôle actuel garde l'app ; le nouveau garderait le site.

**Pas de `.html` dans l'URL** : Netlify sert `/communes/x-64547.html` sous `/communes/x-64547` et redirige l'un vers l'autre. Mesuré ci-dessous : la variante « un dossier par commune » coûte **69 885 inodes contre 34 943, et 551 Mo sur disque contre 415**, pour exactement le même résultat visible. À plat, donc.

---

## 3. LE SCRIPT GÉNÉRATEUR

### Où il s'insère

`outils/pages_communes.py`, appelé dans `pipeline.sh` en **étape 5 ter**, c'est-à-dire :
- **après** l'étape 5 (`rm -rf site_engendre` puis `build_pwa_reconstruit.py`) — sinon le `rm -rf` l'efface, exactement le piège que la docstring de `decouper.py` tend déjà (défaut ④ du contrat de données) ;
- **après** l'étape 5 bis (copie de `site_donnees/`) — sans importance, mais l'ordre doit être écrit ;
- **avant** l'étape 6 (le banc), pour que le banc puisse contrôler ce qui vient d'être écrit.

```bash
# --------------------- 5 ter. les pages publiques, une par commune
# Elles ne sont JAMAIS demandees par l'application : elles sont la porte d'entree
# publique, pour quelqu'un qui cherche « maire de Ustaritz » et n'installera peut-etre
# jamais rien. On ecrit DANS site_engendre, apres le rm -rf de l'etape 5.
python3 outils/pages_communes.py "$APP" site_engendre/communes \
  || echo "::warning::les pages par commune n'ont pas ete engendrees"
```

Non bloquant comme le découpage, **mais avec une différence** : `[ -d site_donnees ]` du défaut ③ publie la veille en annonçant un succès. Ici il n'y a pas ce risque, puisque `site_engendre` est effacé à chaque run — si le script échoue, il n'y a **pas** de pages, et le banc doit le voir (contrôle 4 ci-dessous).

### Ce qu'il lit

Rien d'autre que `app_repere_v18_*.html`, avec **la même fonction `extraire()` que `decouper.py`** — comptage d'accolades, pas de regex de contenu. Deux structures : `window.REPERE_RNE`, `window.REPERE_OFGL`. Mesuré : lecture + parse = **2,8 s**.

Il ne lit **pas** `site_donnees/` : ces fichiers sont réindexés par département, la page aurait à résoudre des index locaux pour rien, et le défaut ① fait que l'OFGL communal y est vide de toute façon.

Une seule donnée n'existe nulle part dans le dépôt et doit être **déclarée en constante dans le script** : la table **département → région** (101 lignes). Vérifié : ni `REPERE_RNE`, ni `REPERE_OFGL`, ni aucun fichier de `outils/` ne la porte. `RNE.reg` est clé par code de région, `OFGL.ech.region.terr` donne les 17 noms, mais rien ne relie `64` à `75`. Une constante déclarée, gardée par une assertion (§ contrôles), pas une devinette.

### Ce qu'il écrit

```
site_engendre/communes/
├── c.css                      ~1,6 Ko, une fois          ← CSS externe : -80 Mo mesurés
├── index.html                 sommaire par département
├── <dept>/index.html          103 index départementaux
├── <slug>-<insee>.html        34 637 pages
└── _empreintes.json           0,9 Mo, non publié
site_engendre/sitemap.xml      3,36 Mo · 34 637 URL · 0,30 Mo gzip
site_engendre/robots.txt
```

Mesuré : le sitemap tient en **un seul fichier** — la limite sitemaps.org est 50 000 URL / 50 Mo, on est à 34 637 / 3,36 Mo.

### Comment il se contrôle lui-même

Le script se relit sans réutiliser une ligne de ce qui l'a écrit, comme `decouper.py` lignes 165-173 :

1. **Univers fermé** — `assert set(RNE["cl"]) == set(RNE["com"])` (mesuré : vrai, 34 637 des deux côtés, 0 écart dans les deux sens). Le jour où ça diverge, une page se retrouverait sans titre.
2. **Rien d'inventé** — rouvrir une page au hasard, en extraire le `<h1>` et le code INSEE du pied, et vérifier que le nom correspond bien à `RNE["cl"][insee]` lu depuis la source.
3. **Aucune adresse fautive** — rejouer les deux regex de `test_repere.mjs:396` sur les 34 637 URL du sitemap. Mesuré ce jour : 0.
4. **Compte exact** — `find site_engendre/communes -name '*.html' | wc -l` doit valoir `len(RNE["cl"]) + 103 + 1`. Le défaut ① du découpage (103 fichiers de 23 octets publiés sans que rien ne s'alarme) vient précisément de l'absence de ce contrôle côté OFGL.
5. **Doctrine du vide** — compter les pages qui contiennent la classe `vide` et vérifier que le compte tombe sur les nombres attendus : 305 sans maire, 67 sans comptes, 14 609 sans intercommunalité. Si un jour 30 000 pages portent une phrase de vide, c'est une source qui est tombée, pas la France qui a changé.
6. **Invariant 8, mesuré et non promis** — `assert` qu'aucune page ne contient les chaînes `patrimoine`, `présence`, `absence`, `déclaration d'intérêts`, `HATVP`.
7. **Invariant 3** — `assert` qu'aucune page ne contient `classement`, `palmarès`, `note`, `mieux que`, `moins que`, sauf dans le § 8 qui dit précisément qu'il n'y en a pas.
8. **Table dept→région complète** — `assert set(dep(c) for c in RNE["cl"]) - set(DEP_REG) == {"975","977","978","986","987","988","98"}` (les collectivités à statut particulier, qui reçoivent la phrase de vide § 5).
9. **Les formes polymorphes** — voir § 6.2 : trois assertions sur `ccan`, `dadj`, `ecc[1]`.

### Le mode incrémental — mesuré

Le rendu produit une empreinte SHA-256 par page ; **un fichier n'est réécrit que si son empreinte a bougé.**

```
tour 1 (à froid)     : 10,3 s | 34 637 rendues | 34 637 écrites
tour 2 (rien changé) :  3,6 s | 34 637 rendues |      0 écrite
```

Le RNE bouge une fois par mois (`maj: 2026-08-11`), l'OFGL une fois par an (`maj: 2026-07-29`). Sur une chaîne **quotidienne**, 364 runs sur 365 réécrivent **zéro fichier**. C'est ce qui rend l'affaire tenable côté déploiement.

---

## 4. LE LIEN VERS L'APPLICATION, ET CE QU'IL TRANSMET

```html
<a class="cta" href="/index.html#c=Ustaritz">Ouvrir Repère sur Ustaritz</a>
```

**Le dièse, pas le point d'interrogation.** L'application lit déjà ce paramètre, ligne 16176 de `app_repere_v18_20.html` :

```js
var m = /[?&#]c=([^&#]+)/.exec(window.location.search + window.location.hash);
```

Le `#` est **dans la classe de caractères**. J'ai vérifié au lieu de supposer, en rejouant la regex sous Node :

| adresse | ce que l'app lit |
|---|---|
| `?c=Ustaritz` | `Ustaritz` |
| `#c=Ustaritz` | `Ustaritz` |
| `#c=Saint-%C3%89tienne` | `Saint-Étienne` |
| `#c=Les%20Sables-d%27Olonne` | `Les Sables-d'Olonne` |

**Les deux marchent. Un seul est privé.** Le fragment d'URL n'est jamais envoyé au serveur : il ne part pas dans la requête HTTP, il n'atterrit dans aucun journal d'accès Netlify. Avec `?c=`, le nom de la commune du lecteur est écrit dans les logs de l'hébergeur — c'est exactement la fuite que le découpage par département sert à éviter, remise par la porte d'entrée.

**Ce que ça implique ailleurs :** `build_pwa_reconstruit.py` engendre aujourd'hui `accueil.html` avec `window.location.href = "index.html?c=" + encodeURIComponent(valeur)` (ligne ~263). **La landing fuit déjà.** Un caractère à changer, `?` → `#`, dans `JS_ACCUEIL`. Hors de mon poste, mais c'est le même geste.

Ce que le lien transmet, en tout : **rien**. Pas de `referrer` utile (ajouter `<meta name="referrer" content="no-referrer">` sur les pages, pour que la mairie ne voie pas non plus d'où viennent les visites vers ses liens sortants), pas de paramètre de campagne, pas d'identifiant de page, pas de code INSEE. L'app efface ensuite le fragment de la barre (`history.replaceState(null, "", window.location.pathname)`), donc un lien recopié ne transporte pas le lieu de vie de celui qui l'a copié — c'est déjà écrit dans le code et déjà commenté.

Et la phrase qui l'explique au lecteur, sur la page :
> Le nom de votre commune voyage **après le dièse** de l'adresse : cette partie n'est jamais envoyée au serveur, et l'application l'efface de la barre d'adresse dès qu'elle l'a lue.

---

## 5. MENTIONS LÉGALES, RGPD, ROBOTS

### Ce que j'en pense, franchement

**Publier le RNE sous licence ouverte ≠ publier 34 637 pages indexées.** La différence n'est pas juridique, elle est de fait : aujourd'hui, chercher « Piero Rouget » sur un moteur ne remonte rien ; après ces pages, ça remonte « maire d'Ustaritz ». Repère devient, sans l'avoir voulu, **le principal éditeur d'une fiche nominative pour 151 091 personnes** (34 637 maires + 116 454 adjoints, mesuré dans `RNE.meta`).

C'est licite — mandat électif, données rendues publiques par le ministère, licence ODbL, intérêt légitime évident pour une application civique. **Ce n'est pas anodin pour autant**, et trois choses le rendent tenable :

1. **On ne publie que la fonction.** Nom, prénom, intitulé de mandat, date de mandat. Rien d'autre. Pas de date de naissance (elle est dans le RNE source — **elle ne doit jamais entrer dans `REPERE_RNE`, à vérifier**), pas de profession, pas de patrimoine, pas de présence.
2. **La donnée périme.** Un maire battu en mars reste sur la page jusqu'à la réingestion du RNE. C'est le vrai risque de préjudice : une page indexée qui dit « maire » de quelqu'un qui ne l'est plus. D'où la date de mise à jour **sur la page, à côté du nom**, pas enterrée en pied — c'est déjà l'invariant 4, ici il fait double emploi.
3. **La rectification doit être à un clic**, pas au fond d'une page de mentions.

### Ce que je recommande

**a) Un lien de rectification dans le pied de CHAQUE page**, libellé pour être compris :
> Vous êtes élu·e et une information est inexacte : faire rectifier

Il pointe sur `/mentions-legales.html#rectification`, qui dit :
> Repère recopie le Répertoire national des élus, publié par le ministère de l'Intérieur, sans le corriger ni le compléter. Si votre nom, votre fonction ou votre date de mandat sont inexacts, ils le sont d'abord à la source, et corriger seulement notre page laisserait l'erreur partout ailleurs. Écrivez d'abord à votre préfecture, qui alimente le répertoire. **Écrivez-nous aussi** à repere0@protonmail.com en indiquant votre commune : nous retirons l'information contestée sous 72 heures, sans attendre la correction de la source, et nous la remettons quand la source aura été corrigée.

Le retrait **avant** vérification est le bon réflexe : le coût d'un retrait injustifié est nul, celui d'un maintien injustifié ne l'est pas. Ça suppose un mécanisme de retrait : une liste `outils/retraits.json` (INSEE + clé retirée + date), lue par le générateur, avec la phrase de vide à la place. **Cette liste doit exister avant la première publication, pas après la première demande.**

**b) Les mentions légales doivent aussi porter** (LCEN art. 6-III) : l'éditeur (personne physique : nom, prénom, adresse e-mail), le directeur de publication, l'hébergeur (Netlify, avec son adresse). Le pied actuel d'`accueil.html` dit « projet individuel, en beta fermée » et donne l'e-mail — **c'est insuffisant pour un site qui publie 151 091 noms.** L'identité de l'éditeur devient obligatoire dès lors qu'un tiers veut exercer un droit contre lui.

**c) Une page `/opposition`** qui dit ce qu'on fait d'une demande d'opposition (art. 21 RGPD). Réponse honnête à écrire : pour un mandat électif en cours, l'intérêt public à l'information prime, et l'opposition est refusée avec motif écrit ; pour un mandat terminé, la fiche est retirée à la réingestion suivante. Dire les deux.

**d) `noindex` sur les fiches d'adjoints ?** Non. Séparer les maires (indexés) des adjoints (non indexés) serait un traitement différencié qu'aucun critère ne justifie. Tout indexé, ou rien.

**e) Aucune mesure d'audience.** Pas de Plausible, pas de Netlify Analytics, rien. Invariant 2 : « aucun traceur ». Le corollaire est qu'**on ne saura jamais si ces pages marchent**. C'est le prix, et il faut l'accepter avant d'écrire le script, pas le regretter après. Le seul signal disponible sans traceur est la Search Console de Google, qui mesure côté moteur et pas côté lecteur.

### `robots.txt`

```
# Repere — les pages par commune sont faites pour etre trouvees : c'est leur raison
# d'etre. L'application, elle, n'a rien a faire dans un index : elle pese 17 Mo et
# n'a pas de contenu propre a offrir a un moteur.
User-agent: *
Allow: /communes/
Disallow: /index.html
Disallow: /donnees/
Disallow: /sw.js

Sitemap: https://<domaine>/sitemap.xml

# LES MOISSONNEURS D'ENTRAINEMENT : le RNE est deja public et deja aspire ; les
# interdire ne protege personne. Ce qui n'est pas public, c'est le TRAVAIL de
# traduction — les phrases de cette page. C'est lui qu'on retire, pas les noms.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: Bytespider
Disallow: /
```

Plus, sur chaque page :
```html
<meta name="referrer" content="no-referrer">
```
et **pas** de `noarchive` : un cache de moteur qui montre une version périmée est un risque, mais l'interdire fait perdre l'accès hors ligne. À trancher ; je penche pour laisser le cache et compter sur la date visible.

Et un `_headers` Netlify pour les pages :
```
/communes/*
  X-Robots-Tag: index, follow
  Referrer-Policy: no-referrer
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

---

## 6. LES CHIFFRES, ET CE QUE JE N'AI PAS PU MESURER

### 6.1 L'univers réel : 34 637, pas 34 875

| ensemble | n |
|---|---|
| `RNE.cl` (libellés de commune) | **34 637** |
| `RNE.com` (maires) | 34 637 — **exactement les mêmes clés** |
| `OFGL.ech.commune.terr` | 34 875 |
| union | 34 942 |
| dans OFGL, absentes du RNE | **305** |
| dans le RNE, absentes d'OFGL | **67** |

Les 305 sont concentrées : Charente (80), Ain (33), Var (23), Doubs (12) — la signature d'anciennes communes fusionnées dont le code INSEE survit dans les comptes. **Et elles n'ont pas de nom** : j'ai vérifié, `OFGL.ech.commune.terr[<insee>]` ne porte que `ex`, jamais `nom` — contrairement aux entrées `departement` et `region`, qui ont un `nom`. **On ne peut donc pas leur faire de page** : pas de titre, pas de `<h1>`, pas de slug. Elles sont hors univers, et il faut l'écrire dans le script plutôt que le découvrir par un `KeyError`.

Les 67 sans comptes sont propres : 65 en Polynésie/Nouvelle-Calédonie (dépt `98`), 2 à Saint-Pierre-et-Miquelon (`975`). Elles ont une page, avec la phrase de vide § 1.

Ni 34 637 ni 34 875 ne sont « les 34 875 communes de France » de l'énoncé du projet — le RNE lui-même annonce `communes_couvertes: 34637, communes_total: 34875, communes_total_confirme: true`. **238 communes n'ont pas d'élu dans le fichier national.** Le produit doit décider s'il dit « 34 637 communes » (vrai et modeste) ou « les 34 875 communes » (l'ambition). Aujourd'hui il ne peut faire que le premier.

### 6.2 Trois pièges de forme, mesurés — absents du contrat de données

Le contrat produit par l'autre agent décrit `ccan`, `dadj` et `ecc` comme « recopiés tels quels ». C'est exact du point de vue de `decouper.py`, qui ne les lit pas. **Un consommateur, lui, se casse dessus** — le prototype a planté à la première exécution :

| clé | forme | mesure |
|---|---|---|
| `ccan` | `int` **ou** `list` | 34 240 entiers, **210 listes** (jusqu'à 12 cantons — Montluçon en a 4, Bourg-en-Bresse 2) |
| `dadj` | `int` **ou** `list` | 34 558 entiers, **22 listes**, parallèles rang par rang à `adj` (vérifié : 22/22, 0 écart) |
| `ecc[1]` | `int` **ou** `list` | 19 690 entiers, **338 listes**, parallèles rang par rang à `ecc[2]` (vérifié : 338/338) |

`ecc[1]` : forme mesurée, **sens inconnu**. Vaut 0 dans 10 118 cas, puis 3, 1, 2, 183, 243… — probablement un second EPCI ou un syndicat par représentant. **Le générateur ne doit pas l'afficher tant que personne ne l'a documenté.** Le contrat de données le décrit comme `[epci, ?, [[p,n,f],…]]` — le `?` est encore un `?`.

Le générateur doit normaliser en liste, systématiquement, avec une assertion qui refuse tout troisième type.

Autres formes vérifiées et régulières : `com` toujours 3 champs (34 637/34 637), éléments d'`adj` toujours 3 champs (116 454/116 454), `ecc` toujours 3 rangs, `dcom` toujours entier.

### 6.3 Poids et temps — les trois dispositions

Les 34 942 pages engendrées **réellement**, trois fois :

| disposition | temps | utile | sur disque | inodes | Ko/page |
|---|---|---|---|---|---|
| à plat, CSS inline | 9,4 s | 379,6 Mo | 415,0 Mo | 34 943 | 11,1 |
| **à plat, CSS externe** | **9,3 s** | **301,7 Mo** | 409,7 Mo | 34 943 | **8,8** |
| un dossier par commune | 12,8 s | 379,6 Mo | **551,2 Mo** | **69 885** | 11,1 |

Rendu seul (sans écriture) : **2,6 s**. Lecture + parse des 17 Mo : **2,8 s**. Archive `tar.gz` : **18,1 Mo** (CSS inline) / **16,2 Mo** (CSS externe). gzip d'une page : **4,3 Ko médian** — c'est ce que le lecteur télécharge réellement, Netlify servant en gzip/brotli.

**Tenable dans un run GitHub Actions gratuit ? Pour la génération, oui, largement.** Un runner `ubuntu-latest` a 14 Go de disque libre et 4 Go de RAM ; on consomme 410 Mo et ~1,5 Go de pointe (RNE + OFGL en mémoire). La chaîne complète passerait de ~2 min à **~2 min 15 s**. Le `timeout-minutes: 30` du workflow ne bouge pas.

**Pour le déploiement, je ne sais pas, et je ne peux pas savoir.** Le conteneur n'a pas de réseau sortant (`curl https://docs.netlify.com` → `CONNECT tunnel failed, 403`). Donc :

**CE QUE JE N'AI PAS PU MESURER**
- **La limite de fichiers d'un déploiement Netlify.** `npx netlify-cli deploy` envoie un manifeste d'empreintes puis n'uploade que les fichiers manquants. Avec 34 637 fichiers, le manifeste seul fait ~2 Mo de JSON. Netlify documente des limites (nombre de fichiers, durée de déploiement, bande passante du palier gratuit à 100 Go/mois) que je n'ai pas pu lire. **À vérifier avant d'écrire le script**, avec un déploiement d'essai sur un site jetable.
- **Le temps réel d'un `netlify deploy` de 35 000 fichiers.** Même à empreintes inchangées, il faut hasher et transmettre 35 000 lignes.
- **La bande passante consommée.** 4,3 Ko gzippés par page ; à 100 Go/mois de palier gratuit, ça fait ~23 millions de pages vues. Ce n'est pas la contrainte.
- **Le rendu réel dans un navigateur.** Le banc mesure le rendu de l'app ; je n'ai pas ouvert une seule de ces pages dans un navigateur. Le CSS est écrit, il n'est pas vérifié. **Le jour où on l'écrit, il faut ajouter au banc un contrôle qui charge une page engendrée** — sinon la moitié du banc qui « mesure le rendu réel » ne couvre pas la moitié du site.
- **Si les pages seront indexées.** Personne ne peut le mesurer à l'avance. 34 637 pages engendrées, à contenu structurellement identique, est le profil exact que les moteurs appellent « doorway pages » et désindexent. La défense est le contenu propre à chaque page — noms, montants, canton, intercommunalité — et le fait que la requête cible (« maire de X ») a une réponse unique par page. **Le risque est réel et non mesurable ici.**

### 6.4 Deux défauts trouvés en lisant la page engendrée

**a) Les noms d'intercommunalité sont abîmés à la source.** `RNE.e` contient `"Ca Du Pays Basque"`, `"Cc De La Plaine De L'Ain"`. Mesuré : 967 commencent par `Cc`, 211 par `Ca`, 10 par `CC`, 9 par `Metropole`, 8 par `Cu`, 7 par `CA`, 4 par `CU`. Casse incohérente, sigles non développés, particules en majuscules. Sur une page indexée, « Ca Du Pays Basque » est illisible.

Deux options, et je recommande la seconde :
- afficher tel quel + une phrase (« *Cc* veut dire communauté de communes… ») : honnête, laid ;
- **normaliser le libellé** — développer le sigle de tête (`Cc`→ Communauté de communes, `Ca`→ Communauté d'agglomération, `Cu`→ Communauté urbaine), remettre en minuscules les particules (de, du, des, d', la, le, les, et, en, sur, sous, au, aux) — **et le dire sur la page** : « libellé remis en forme à partir du nom officiel du ministère ». La transformation doit être idempotente, testée par assertion, et relue à l'œil sur un échantillon **par un humain, une fois**, avant la première publication. Une normalisation de nom propre n'est pas un contrôle automatique.

**b) Les intitulés de fonction ne s'accordent pas.** Mesuré dans `RNE.f` : « Conseiller départemental », « Conseiller communautaire », « 1er adjoint au Maire » — masculin pour tout le monde. La page affiche donc « Bénédicte LUBERRIAGA — Conseiller départemental ». **On ne doit pas deviner le genre d'après le prénom** : c'est une inférence sur une personne, et elle se trompe. La seule sortie honnête est une note de bas de page :
> Les intitulés de fonction sont repris tels quels du fichier du ministère de l'Intérieur, qui ne les accorde pas au féminin.

### 6.5 Détails à corriger dans le prototype avant de l'écrire pour de bon

Relevés en lisant la page rendue, pas en relisant le code :
- « Ustaritz appartient au canton **de Ustaritz**-… » → élision manquante sur les noms de canton. Mesuré : **249 cantons sur 2 066 commencent par une voyelle, 208 portent un article**. La fonction `de_()` du prototype est appliquée aux communes, pas aux cantons.
- « Une **commande** de cette taille » → coquille de ma main dans la branche multi-cantons (210 pages concernées).
- « population **légale** 2025 » → je ne sais pas si le rang 0 du vecteur OFGL est la population légale INSEE ou la population DGF. **Non mesuré.** Écrire « chiffre de population retenu par l'OFGL pour l'exercice 2025 » tant que ce n'est pas tranché.
- Le `<title>` porte le code INSEE (`Ustaritz (64547) — …`). Pour un humain, mieux vaut le département : `Ustaritz (Pyrénées-Atlantiques) — qui décide, et où va l'argent`. Il désambiguïse aussi les 1 413 noms partagés par 3 611 communes.
- Le générateur produit 34 942 pages là où l'univers en admet 34 637 : c'est `incr.py` qui a la bonne borne (`sorted(RNE["cl"])`), pas `pages.py`.

---

## Fichiers de la course de mesure, conservés

```
/tmp/claude-0/-home-claude/4308483e-90d9-5053-bcb6-33eae98f4b9c/scratchpad/mesure/
├── pages.py              le prototype de generateur (gabarit complet, textes reels)
├── incr.py               le mode incremental (empreintes SHA-256)
├── ecrire.py             la comparaison des trois dispositions de fichiers
├── couverture.py  ecarts.py  articles.py  noms.py   les mesures de donnees
├── exemple_64547.html    une page complete, Ustaritz, 11 962 o
├── out_plat/ out_plat_css_externe/ out_dossier/ out_incr/   34 942 pages x 3 + 34 637
└── rne.json  ofgl.json   les structures extraites (jamais lues en entier par un outil)
```

`app_repere_v18_20.html` n'a été lu qu'au travers de `grep`, `sed -n`, `awk` et de la fonction `extraire()` de `decouper.py`. **Aucun fichier du dépôt n'a été modifié.**