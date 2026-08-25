## 0. Ce que j'ai mesuré avant de répondre

Je n'ai rien modifié. Mesures faites sur `/home/claude/repere/app_repere_v18_20.html` (16 994 801 o) et sur les structures extraites par l'agent précédent (`.../scratchpad/mesure/rne.json`, `ofgl.json`).

| ce que contient l'app aujourd'hui | compte mesuré |
|---|---|
| Fiches d'élus rédigées (`ELUS`) | **6** |
| Décisions du fil (`FEED`) | **13** |
| Tuiles « L'essentiel » (`ESSENTIEL`) | **3**, dont 0 communale, 0 départementale |
| Communes couvertes par `CIRCOS` (commune → député) | **1** sur 34 637 |
| Communes avec un maire dans le RNE | 34 637 ; élus le **15 mars 2026** pour 33 122 d'entre eux |
| Bandeau `L2278` du fichier autonome | *« Le fichier n'a pas été chargé en entier… qui pèse plus de 15 Mo »* |

Ces sept lignes commandent tout le reste de ma réponse. Un utilisateur de Dounoux (Vosges, 884 habitants, maire Gilles NEXON, 4 adjoints, CA d'Épinal) qui ouvre Repère aujourd'hui obtient : un nom de maire, quatre noms d'adjoints, six agrégats comptables, et trois actualités nationales. **Les deux conceptions rendent cela plus rapide et plus indexable. Aucune des deux ne rend cela plus compréhensible.** C'est le fait central.

---

## 1. Le chargeur asynchrone

### Ce que l'utilisateur gagne : pas de la vitesse, de l'existence

La conception vend « 28× moins ». Ce n'est pas le bon argument, et il sous-vend son propre travail. Le vrai argument est écrit dans le fichier lui-même, à la ligne 2278 : l'application embarque un bandeau d'excuse qui dit à l'utilisateur que son téléphone n'a pas réussi à lire le fichier. **Aujourd'hui, sur une partie du parc mobile, Repère ne s'ouvre pas.** Un produit qui ne s'ouvre pas n'a pas de problème de performance, il n'a pas d'utilisateur. Passer de 6,1 Mo gzip à 217 Ko, c'est passer de « parfois » à « toujours ». Ça se fait, ce n'est pas discutable.

### Ce qu'il perd, et la conception le maquille un peu

**a) Le « premier mot lisible à 217 Ko » est une écriture comptable.** Personne n'ouvre Repère pour lire la coquille. On l'ouvre pour taper le nom de sa commune. Le vrai coût de première utilisation, c'est 217 + 254 = **471 Ko avant que la recherche réponde**, puis 557 Ko à l'arrivée. C'est toujours 11× mieux qu'aujourd'hui — dites 11×, pas 28×, ça reste excellent et c'est vrai.

**b) La conception mesure des octets et jamais des millisecondes, et elle l'écrit.** C'est honnête et c'est insuffisant, parce que dans un train ce qui tue n'est pas le volume, c'est le RTT et la coupure. Quatre vagues = quatre occasions de tomber, placées exactement aux quatre moments où l'utilisateur agit : il tape, il choisit, il confirme, il ouvre « Mon argent ». Le timeout est fixé à 8 000 ms : quelqu'un qui met le doigt dans le champ en gare de Nemours regarde une phrase d'attente pendant huit secondes avant d'avoir le droit de voir « Réessayer ». Huit secondes, c'est très long. Je ne recommande pas de le baisser sans mesure — je recommande de **mesurer avant de brancher**, ce que la conception dit elle-même n'avoir pas fait.

**c) Le vrai piège du train est ailleurs, et la conception le renvoie à plus tard.** Son risque n° 5 : `VERSION` du service worker change à chaque build, le pipeline tourne **tous les jours**, donc tous les caches sont effacés tous les jours et chaque lecteur retélécharge son département quotidiennement. Conséquence utilisateur : *l'installation en PWA ne garantit plus rien hors ligne.* Le monsieur qui installe l'app chez lui le dimanche et l'ouvre dans le TER le lundi tombe sur « les élus de Dounoux n'ont pas pu être chargés ». **Ce n'est pas « à instruire séparément », c'est le même patch.** Un cache de données séparé, versionné par `meta.maj` du RNE (qui bouge une fois par mois) et non par l'empreinte du HTML, est la condition pour que l'invariant 1 survive à la bascule. Sans lui, l'application autonome fonctionne hors ligne et l'application installée, non — ce qui est exactement l'inverse de ce que l'utilisateur croit acheter en installant.

**d) L'échec hors couverture est bien traité sur le fond.** Les phrases C, D, F, G sont justes, distinguent « pas encore arrivé » de « la source ne le porte pas », et le refus de la relance automatique est le bon réflexe. Deux réserves : la phrase D fait deux lignes et demie et contient une négation double (« ce n'est pas que… c'est que… ») — un lecteur de 68 ans en lit la première moitié. Écrivez d'abord la sortie, ensuite l'explication : *« Repère n'a pas réussi à joindre le serveur. Les élus de Dounoux existent, ils ne sont pas arrivés. [Réessayer] »*. Et le mot « liaison avec le serveur a échoué » revient dans quatre phrases sur sept : c'est du vocabulaire d'ingénieur.

### Le jeu en vaut-il la chandelle ? Oui, mais pas au prix affiché

Oui, sans hésitation : une app qui ne se charge pas n'a pas de deuxième chance. Mais le devis est de **24 fonctions modifiées + 11 contrôles de banc + 3 outils Python réécrits**, pour un développeur seul à 250 € qui vise décembre 2026. Deux coupes franches :

- **Prenez l'alternative à +15 Ko.** La conception mesure honnêtement l'option « amorcer les tables départementales avec celles du socle » : `rne/<D>.json` passe de 25,7 à 40,9 Ko gzip, et la fusion d'index disparaît. Elle recommande quand même la fusion en JS « + le contrôle N3 ». C'est le mauvais arbitrage pour ce projet. La fusion d'index est le seul endroit du fichier où une panne affiche **un vrai nom de personne, bien orthographié, sous une vraie fonction, et faux** — pour une application civique qui n'a que sa crédibilité, c'est l'accident qui tue le produit. 15 Ko par lecteur, une fois par mois, pour supprimer cette classe d'accident : achetez-la. Elle libère aussi le développeur d'un contrôle de banc en navigateur qu'il devra maintenir seul pendant deux ans.
- **Le défaut `6AE` (§ 2.5) et les `ofgl/<D>.json` vides sont bloquants et ne se discutent pas.** Deux millions d'Alsaciens privés de leur conseil départemental, et 34 875 communes à qui l'app dirait « vos comptes ne figurent pas dans le fichier officiel » alors qu'ils y sont. Corriger `decouper.py` avant de toucher à l'application : la conception le dit, elle a raison, c'est le seul « avant » du lot.
- **Ne coupez pas le risque n° 6** (repasser par `wireClickables` au re-rendu). Des cartes d'élus qui apparaissent après le fetch et ne sont ni cliquables au clavier ni annoncées au lecteur d'écran, c'est précisément l'utilisateur de 68 ans que vous perdez, en silence, sans qu'aucun test ne bronche.

---

## 2. Les pages publiques : traduisent-elles ?

### Réponse : environ un tiers traduit, deux tiers recrachent

Ce qui traduit vraiment, et qui est bon : le § 3 (« Ce qui ne se décide pas à la mairie »), le § 5 (« aucun conseiller régional ne représente votre commune, et c'est pourquoi cette page n'en désigne aucun »), la phrase du § 6 sur les sénateurs (« votre conseil municipal vote pour eux, vous non »), et les quatre phrases du vide. Ces passages font ce que le produit promet : ils disent au lecteur une chose qu'il ne savait pas et qui change sa façon de se plaindre.

Ce qui recrache :

**a) Le paragraphe générique est le même sur 34 637 pages.** Le texte du § 1 sur le rôle du maire, du § 4 sur le département, du § 7 sur les comptes : identique à Dounoux (884 habitants, un seul conseiller communautaire) et à Lyon. Ce n'est pas de la traduction, c'est un lexique collé 34 637 fois. C'est aussi, mécaniquement, la raison du risque « doorway pages » que la conception nomme sans le relier à sa cause : si 80 % du texte d'une page est identique à celui des 34 636 autres, le moteur a raison de s'en méfier.

**b) Le vrai matériau spécifique n'est pas exploité.** Il est pourtant dans la donnée et je l'ai mesuré : Dounoux envoie **1 représentant** à une agglomération de **55 communes**, et ce représentant est le maire lui-même. Voilà une phrase que seule cette page peut écrire, qui est calculable, qui n'est pas un classement, et qui apprend quelque chose : *« sur les ordures, l'eau et les transports, Dounoux dispose d'une voix sur 55, et c'est celle de votre maire. »* La conception ne calcule rien de tel : elle affiche des champs.

**c) La section argent est le plus gros ratage.** La conception affiche six agrégats et un montant par habitant, avec un avertissement disant de ne pas comparer. Elle a raison de refuser la comparaison entre communes (invariant 3) — mais elle refuse aussi le **rapport interne**, qui n'est pas un classement et qui est la seule traduction possible d'un budget. Pour Dounoux, les chiffres bruts (935 545 € de recettes, 1 058 €/habitant) ne veulent rien dire pour personne. Les rapports, eux, parlent : la dette vaut **six mois de recettes** ; les salaires font **23 % des dépenses** ; l'investissement fait **46 % des dépenses**, ce qui signale un gros chantier cette année ; la commune dépense **2 500 € par jour**. Aucun de ces chiffres ne compare Dounoux à quiconque. Tous sont dérivés de données déjà ingérées. **Cette traduction ne coûte pas une source de plus, elle coûte dix lignes de calcul, et c'est le meilleur rapport effort/compréhension de tout le dossier.**

### Le paragraphe pour un habitant de 68 ans de Dounoux

> À Dounoux, le maire est Gilles NEXON, élu le 15 mars 2026 avec son conseil, pour six ans. Quatre adjoints décident avec lui : Céline PIERRAT, Olivier JEANDIN, Nadine BRICE, Jean-Paul MATHIEU. Vous les connaissez sans doute. Ce qu'on sait moins, c'est ce dont ils ne décident plus. Les ordures ménagères, l'eau, les zones d'activité et une partie de l'urbanisme sont passés à la Communauté d'agglomération d'Épinal, qui réunit 55 communes ; Dounoux y envoie une seule voix, celle de votre maire. Quand vous appelez la mairie pour une poubelle qui n'a pas été ramassée, la mairie transmet — elle ne décide pas, et elle ne peut pas vous répondre à la place de l'agglomération. Le collège, les routes départementales et l'aide à l'autonomie relèvent du département des Vosges : deux conseillers ont été élus pour le canton du Val-d'Ajol, dont Dounoux fait partie, Véronique MARCOT et Thomas VINCENT. Le lycée et les trains relèvent de la région Grand Est, où personne n'a été élu au nom de Dounoux en particulier. Cette page ne dit ni qui a raison, ni qui travaille bien. Elle dit qui a le pouvoir de décider quoi, pour que vous sachiez à quelle porte frapper.

### Le paragraphe pour un jeune de 19 ans de Dounoux

> Dounoux, 884 habitants. Voilà ce qui te concerne vraiment, et ce n'est pas là où tu crois. Ton lycée, ton bus, ton apprentissage, ta formation : c'est la région Grand Est. Ton permis, ta CAF, tes APL : c'est l'État. Le RSA et l'aide sociale, si un jour ça te concerne : c'est le département des Vosges. La mairie, elle, décide de choses qui ont l'air petites et qui ne le sont pas : ce qu'on a le droit de construire ici et où, le terrain de sport, la salle qu'on te prête ou qu'on te refuse, l'horaire d'un local, et un budget de 914 000 euros par an — 2 500 euros par jour. Elle est dirigée par Gilles NEXON et quatre adjoints, élus en mars 2026 jusqu'en 2032. Ils sont cinq à décider pour 884 personnes, et il y a 55 communes comme la tienne dans l'agglomération d'Épinal, qui décide de tes déchets et de tes bus sans que tu aies jamais voté pour elle directement. Tu n'es obligé de rien. Ce que cette page te donne, c'est de savoir à qui parler quand quelque chose ne va pas, au lieu de dire « la mairie » ou « l'État » sans savoir lequel des deux.

**Ce qui les sépare, et pourquoi ce n'est pas cosmétique.** Le premier part de gens qu'il connaît et lui apprend ce qui lui a été retiré ; il finit sur « à quelle porte frapper », parce qu'à 68 ans dans un village on a des démarches concrètes et on perd du temps au mauvais guichet. Le second part de sa vie à lui — lycée, bus, apprentissage, une salle — et lui apprend que presque rien de ce qui le concerne ne se décide à la mairie ; il finit sur le fait qu'il n'a jamais voté pour l'agglomération, parce que c'est là qu'un jeune décroche. Le premier tutoie l'institution, le second se fait tutoyer. **Si votre générateur ne sait produire qu'un seul de ces deux textes, il sert le premier et perd le second** — et c'est exactement ce que produit la conception actuelle, dont le ton (vouvoiement, phrases longues, ordre institutionnel) est celui du premier.

Un générateur qui écrit les deux existe : c'est un bouton « Je découvre » / « Je connais déjà », deux blocs de texte, zéro donnée supplémentaire. Ça coûte une journée.

---

## 3. DECP : non. Ce n'est pas le bon prochain chantier.

L'instruction est bien faite et sa conclusion se lit en creux : **la fonctionnalité serait vide pour la majorité de ses utilisateurs.** 159 435 contrats pour l'ensemble des collectivités territoriales, contre 34 875 communes ; le seuil est à 40 000 € HT. Pour Dounoux, la page « marchés publics » afficherait, année après année, la phrase du vide. Vous auriez construit, au prix du chantier le plus lourd du projet, un écran qui dit « rien » à l'immense majorité des gens. C'est l'exact contraire de « reconnecter ».

Le reste s'additionne : le rattachement SIRET → INSEE exige la base SIRENE dans un pipeline GitHub Actions gratuit ; le taux de rattachement est **non mesuré** et l'agent n'a pas pu le mesurer ; la licence de la seule source exploitable techniquement (Colmo, Parquet 244 Mo) est **en conflit non résolu** ; et la donnée nomme des entreprises, dont des entrepreneurs individuels — c'est-à-dire des personnes physiques — pour un développeur seul, sans budget juridique, dont la pente naturelle serait un palmarès interdit par l'invariant 3. Enfin, et c'est le point de fond : savoir que la commune a signé un marché de voirie de 62 000 € avec l'entreprise X n'apprend **pas qui décide**. C'est de la donnée d'investigation, pas de la donnée de traduction. Repère n'est pas un média — c'est écrit dans sa raison d'être.

### Les trois alternatives, comparées

| chantier | effort | fiabilité | aide-t-il à COMPRENDRE ? |
|---|---|---|---|
| **A. Commune → circonscription → votre député** | **faible.** `outils/circos.py` est **déjà écrit**. Il manque un CSV (`data/circos_bureaux_de_vote.csv`, absent du disque). Une table, aucune jointure, aucun SIRET, aucune base de 2,5 Go. | **haute**, mais avec une réserve écrite dans la docstring : source republiée par un tiers, et une commune peut être à cheval sur plusieurs circonscriptions — il faut alors afficher tous les députés et dire que la commune est partagée. | **Le plus haut du lot.** `CIRCOS` couvre aujourd'hui **1 commune sur 34 637**. La chaîne « locale → départementale → régionale → nationale » qui est la promesse du produit est **rompue au dernier maillon pour 34 636 communes**. C'est le trou, pas les marchés publics. Et 2027 arrive. |
| **B. Traduire les comptes déjà ingérés en rapports internes** | **quasi nul.** Zéro nouvelle source. Dix lignes de calcul sur `OFGL` déjà embarqué. | **maximale** : les chiffres sont déjà datés et sourcés, on ne fait que les diviser entre eux. Aucune comparaison entre territoires, donc aucun risque d'invariant 3. | **très haute.** « La dette de votre commune vaut six mois de ses recettes » apprend quelque chose. « Encours de dette : 472 041 € » n'apprend rien. C'est littéralement le métier annoncé du produit. |
| **C. Le vote de votre député sur les textes du fil** | **moyen**, et **impossible avant A**. `outils/scrutins_an.py` existe déjà. | **haute** (données ouvertes de l'Assemblée). Danger à border : jamais de compteur d'assiduité, jamais de score — invariants 6 et 8. Un vote sur un texte est un fait ; un total de votes est un classement déguisé. | **très haute** : c'est ce qui transformerait les 13 entrées du `FEED`, aujourd'hui nationales et anonymes, en « voici comment la personne élue chez vous s'est prononcée ». |
| **D. DECP** | **le plus lourd** : SIRENE, déduplication par `uid`, découpage par département à écrire, licence à trancher. | **inconnue** — le taux de rattachement n'est pas mesuré, et l'instruction dit d'abandonner s'il est bas. | **faible**, et vide pour la plupart des communes. |

**Ordre que je recommande : B (une journée), puis A (le CSV et la table), puis C. DECP après la bêta, ou jamais.** B et A ensemble donnent, pour chaque commune de France, une phrase sur son budget qui veut dire quelque chose et un nom de député — c'est-à-dire les deux extrémités de la promesse, à un coût qui tient dans le budget restant.

---

## 4. Ce qui, dans ces deux conceptions, ne sert que le développeur

Sans ménagement.

1. **Le mode incrémental du générateur de pages** (empreintes SHA-256, `_empreintes.json` de 0,9 Mo, 3,6 s au lieu de 10,3 s). Il fait gagner **sept secondes par jour** à une machine. Il est présenté comme « ce qui rend l'affaire tenable côté déploiement » — alors que la conception écrit deux paragraphes plus loin qu'elle **n'a pas pu mesurer la contrainte Netlify**. C'est une optimisation construite contre une contrainte inconnue. Le geste honnête est un déploiement d'essai sur un site jetable ; l'optimisation vient après, si elle vient.

2. **Le banc des trois dispositions de fichiers** (à plat / dossiers / CSS externe, 415 Mo contre 551 Mo, 34 943 inodes contre 69 885). Aucun utilisateur ne voit un inode. Trois générations complètes de 34 942 pages pour arriver à « mettez le CSS dans un fichier », qui se savait sans mesure.

3. **La moitié des onze contrôles de banc du chargeur.** N3 (le bon nom de maire) et N4 (l'Alsace) protègent des gens. N9 protège contre la publication de fichiers vides. Les huit autres — N1, N2, N5, N6, N7, N8, N10, N11 — sont du gardiennage que le développeur devra maintenir seul pendant des années, sur un produit qui compte **six fiches d'élus**. Un banc à 54 contrôles autour d'un contenu de six fiches, c'est une cathédrale autour d'une chapelle. Gardez N3, N4, N9, N8 (l'invariant 1, non négociable) ; les autres attendront d'avoir du contenu à protéger.

4. **La recommandation de la fusion d'index en JS plutôt que du socle amorcé.** Elle est présentée comme un arbitrage, et la conception a l'honnêteté de dire qu'un architecte qui paie 15 Ko aurait raison aussi. Mais dans le contexte réel — un développeur, 250 €, trois mois — préférer la solution élégante à la solution qui supprime le risque d'afficher **le nom de quelqu'un d'autre comme maire**, c'est du goût d'ingénieur payé par l'utilisateur.

5. **Le bloc anti-moissonneurs du `robots.txt`.** Le commentaire dit le vrai motif : *« ce qui n'est pas public, c'est le TRAVAIL de traduction — les phrases de cette page »*. C'est la fierté de l'auteur, pas le service du citoyen. Un produit dont la raison d'être est qu'un jeune de 19 ans comprenne qui décide chez lui a plutôt intérêt à ce que ses explications soient atteignables par les outils avec lesquels ce jeune pose ses questions. Ça se défend de bloquer, mais il faut savoir qu'on le fait pour soi.

6. **Les 34 637 pages, à cette date.** La conception l'écrit elle-même, et c'est la phrase la plus grave du dossier : *« on ne saura jamais si ces pages marchent »* (invariant 2, aucune mesure d'audience). Publier 34 637 pages, 300 Mo, un générateur, une refonte des mentions légales obligeant l'auteur à publier son identité civile (LCEN), une liste de retraits à tenir à la main, et une surface juridique de **151 091 personnes nommées** — en ayant décidé d'avance de ne jamais mesurer si ça sert à quelque chose, et sachant que le référencement met six à douze mois, c'est-à-dire qu'il arriverait **après** la bêta de décembre. Ce n'est pas une stratégie, c'est un pari pris pendant que le contenu du produit tient en six fiches.
   **Contre-proposition concrète :** publiez d'abord **104 pages** — les 103 pages départementales et une page d'index. Même générateur, un centième du risque, déployable en dix minutes, indexable, et mesurable par la Search Console (qui est un outil côté serveur, pas un traceur : elle ne viole pas l'invariant 2). Si les 103 pages remontent sur « conseil départemental des Vosges », vous saurez que le pari tient, et vous engendrerez les 34 637 en connaissance de cause. Sinon vous aurez perdu une journée au lieu d'un trimestre.

7. **Ce qui, à l'inverse, sert franchement l'utilisateur et doit être gardé quoi qu'il arrive :** le `#c=` au lieu du `?c=` (le nom de la commune ne part plus dans les journaux de l'hébergeur — et la découverte que `accueil.html` fuit déjà aujourd'hui, ligne ~263 de `build_pwa_reconstruit.py`, est le meilleur point du dossier) ; le refus de la relance automatique ; le refus de deviner le genre d'après le prénom ; la phrase « un montant absent n'est pas un montant nul » sur les **1 733 communes** sans dette publiée ; et le passage par `wireClickables` au re-rendu.

### Le mot de la fin, puisqu'il est demandé franchement

Ces deux conceptions sont d'excellent niveau technique et elles répondent, l'une et l'autre, à une question qui n'est pas la plus urgente. **Le chargeur est nécessaire — c'est de la survie, pas du produit.** Les pages publiques sont un chantier de distribution engagé avant que le produit ait quelque chose à distribuer. Entre les deux, il y a un trou qu'aucun des deux rapports ne nomme : à trois mois de la bêta, un habitant de Dounoux qui ouvre Repère n'y trouve **aucune décision prise chez lui**, aucun nom de son député, et six chiffres qu'il ne sait pas lire. Faites le chargeur — c'est obligatoire. Faites la traduction des comptes — c'est une journée. Faites la table des circonscriptions — le script est déjà écrit. Puis, et seulement puis, décidez si vous publiez 34 637 pages.