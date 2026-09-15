# REPÈRE — VISION PRODUIT CITOYENNE

**Arbitrage du 15 septembre 2026.** Écrit après cinq relevés d'agents (ÉDUCATION, USER,
NEUTRALITÉ POLITIQUE, DATA, UX), deux relevés antérieurs (RED TEAM, ARCHITECTURE) et une
série de mesures faites ici, sur les fichiers réellement servis. Les agents PRODUCT et
ENGINEERING ont été lancés et **interrompus par une limite de session** : ce qui leur était
demandé est traité ici en direct, et les deux endroits où leur travail manque sont nommés
comme tels (§N, §V).

**Ce document arbitre. Il ne suit pas les recommandations des agents quand elles se
trompent, et il refuse trois demandes du brief.** Les trois refus sont en §P et §J. Ils sont
dits d'emblée parce qu'ils décident du reste :

1. **« Comparer les positions des partis » ne sera pas construit.** Aucune donnée publique
   française n'atteste une position de parti. L'objet n'existe pas.
2. **La progression « à la Duolingo » ne sera pas construite.** Elle exige une mémoire du
   lecteur que le produit a décidé de ne pas avoir. La contourner par un masque de bits dans
   l'unique clé autorisée serait du blanchiment d'invariant.
3. **« Vous avez découvert 3 institutions aujourd'hui » ne sera pas écrit.** Cette phrase
   compte le lecteur. C'est un score, et il porte sur la personne qui lit.

**Et un constat qui passe avant toute vision**, mesuré ici pour la première fois :

> Dans l'exercice 2021, le poste « Frais de personnel » vaut **exactement zéro pour
> 34 868 communes sur 34 868 — 100 %**. Dans les exercices 2024 et 2025, il vaut zéro pour
> 0,6 %. Aucune commune de France ne paie zéro salaire. **Ce n'est pas une donnée, c'est une
> colonne absente écrite comme un montant nul par notre propre chaîne de collecte.**
> Commande : `python3` sur `site_donnees/ofgl/*.json`, comptage des zéros par exercice et par
> poste. Résultat complet en §G.3.

Conséquence directe : **l'aha moment que ce document recommande n'est pas construisible
aujourd'hui.** Il le devient après une correction de trois lignes dans la donnée. C'est le
P0 de tout le reste, et il était invisible parce que l'écran n'affiche qu'un seul exercice.

---

## A. VISION

**Repère répond à une question, et une seule : « qui décide ici, et avec quel argent ? »**

Pas « comprendre la politique » — c'est un programme d'enseignement, et personne ne
télécharge un programme d'enseignement. Pas « retrouver sa place de citoyen » — c'est une
intention noble qui ne dit pas ce que l'application fait à l'écran.

La formulation du brief — *« Repère cherche à reconnecter chaque humain vivant en France à
son statut de citoyen »* — est la bonne raison d'être et la mauvaise promesse produit. Elle
est juste comme boussole interne. Écrite sur un premier écran, elle promet une
transformation personnelle que douze mégaoctets de données publiques ne tiendront pas.

Ce que le produit peut tenir, et que rien d'autre ne tient aujourd'hui :

- **il nomme** les personnes qui décident dans la commune du lecteur, avec la source et la
  date ;
- **il montre** l'argent de cette commune, comparé à lui-même dans le temps ;
- **il traduit** les mots de l'institution au moment où ils apparaissent ;
- **il montre d'où ça vient**, toujours, et il dit ce qu'il ne sait pas ;
- **il ne sait rien du lecteur** : ni compte, ni courriel, ni adresse, ni position, et le
  serveur lui-même ne peut pas apprendre quelle commune est lue.

Cette dernière ligne n'est pas une contrainte subie. **C'est la seule chose que Repère a en
propre**, et c'est elle qui interdit la moitié des fonctionnalités demandées dans le brief.
Le document dit chaque fois laquelle, et pourquoi le prix n'en vaut pas la peine.

### A.1 · Le mot « progressif » est un piège

Le brief demande : SIMPLE, ACCESSIBLE, CONCRET, LOCAL, FACTUEL, SOURCÉ, PROGRESSIF,
MODERNE, VIVANT. Huit de ces neuf mots sont des propriétés d'un écran. **« PROGRESSIF » est
une propriété d'une suite de visites** — donc d'une mémoire du lecteur, donc de la seule
chose que ce produit a décidé de ne pas avoir.

Il faut choisir. Ce document choisit : **la profondeur remplace la progression.** Un écran
peut être profond sans que le produit se souvienne de rien : la couche 1 est lisible en
quatre secondes, la couche 6 est la source primaire, et le lecteur descend aussi bas qu'il
veut, chaque fois, sans que nous sachions où il s'est arrêté la fois précédente. C'est
moins flatteur qu'une courbe de progression. C'est vrai.

---

## B. LE PROBLÈME CITOYEN

Le brief liste onze ignorances (« qui décide ; à quel niveau ; avec quelles compétences… »).
Elles sont réelles. Mais une étude sur huit personnes, faite sur les écrans réels, a produit
un diagnostic plus dur et plus utile :

> **« Ça ne parle pas de chez nous. Ça parle de la France, avec le nom de notre commune en
> haut. »**

Ce n'est pas une susceptibilité. C'est une **proportion mesurée** par l'agent UX sur les
captures réelles :

| mesure | valeur |
|---|---|
| hauteur de l'écran ouvert par défaut (Chevru) | 2 343 px CSS |
| hauteur de ce qui change quand on change de commune | ~135 px |
| **part variable de la page** | **< 6 %** |
| part du texte identique entre l'écran daté d'Aubervilliers et celui de Bagnolet | 55,5 % |
| faits nationaux sur les 8 du fil daté de Bagnolet | 8 / 8 |
| hauteur de la carte « Qui d'autre décide pour vous », zéro donnée, texte identique partout | 518 px, soit 33 % de la page |
| hauteur entre le haut de l'écran et le premier chiffre propre à la commune | 768 à 806 px |

**Le problème citoyen n'est donc pas d'abord l'ignorance. C'est que le produit qui prétend
la corriger parle à 94 % de la France.** Et la prudence du produit — sa plus belle qualité —
est le premier producteur de ce texte national : 19 lignes de mise en garde pour 4 chiffres
sur l'écran de Mulcent, dont 83 % est identique dans les 1 262 communes.

Deuxième fait, du relevé USER : **une seule des huit personnes non professionnelles revient
à trois mois**, et par coïncidence de calendrier. Le seul « ah » observé portait sur
« Votre département — Les collèges… », **le seul écran de l'étude qui ne contient aucune
donnée**. Ce n'est pas un compliment : c'est le diagnostic que le produit n'a encore jamais
fait « ah » avec un chiffre.

Troisième fait, le plus dangereux : Corinne lit un état de vide honnête — « l'État n'a
financé aucun projet à Bagnolet » — en conclut « il n'y a rien de prévu à Bagnolet », et le
répète dans une réunion de collectif avec l'autorité d'une source officielle. **Une absence
de donnée est devenue une absence de fait.** C'est le risque produit numéro un, et il naît
d'une phrase correcte.

---

## C. UTILISATEURS

Les huit personnes du brief (A→H) ont été jouées par l'agent USER contre les écrans réels.
Résultat, non lissé :

| # | qui | ce qui se passe réellement | verdict |
|---|---|---|---|
| A | « je ne m'intéresse pas à la politique » | ouvre, lit un titre national, ferme | **le produit ne lui parle pas encore** |
| B | vote sans comprendre les institutions | trouve son maire, ne comprend pas « circonscription » ni « exercice » | servi à moitié : la traduction manque |
| C | curieux, veut apprendre | va au bout, mais bute sur six expressions opaques déjà à l'écran | servi, à condition de traduire |
| D | très politisé | cherche un classement, ne le trouve pas, part | **non-cible assumée** |
| E | veut comprendre sa commune | **le mieux servi du groupe** : maire, adjoints, comptes, tout existe | servi |
| F | veut suivre son député | trouve un nom et huit lois nationales, aucune activité locale | servi en trompe-l'œil (voir §K) |
| G | veut comparer les positions des partis | **ne sera jamais servi** : l'objet source n'existe pas | **refus définitif** (§L) |
| H | veut vérifier une information | servi, et c'est le seul segment que le produit sert mieux que quiconque | servi |

**Arbitrage.** Le brief demande que A puisse commencer très simplement et que H puisse aller
très loin. C'est faisable pour A, E et H. Ce n'est **pas** faisable pour D et G, et il faut
le dire : un produit qui refuse tout classement, tout score et toute étiquette politique n'a
rien à offrir à quelqu'un qui vient chercher une munition. **Repère est un produit pour A,
B, C, E et H. D et G sont des non-cibles, et c'est un choix, pas un manque.**

Persona qui manque au brief et que l'étude a fait apparaître : **le professionnel** —
journaliste local, agent de collectivité, élu d'opposition, militant associatif. C'est le
segment qui revient le plus, qui a l'usage le plus intense, et dont la présence est le plus
grand danger : **c'est lui qui produit la capture d'écran.** Il n'est pas la cible, il sera
le premier utilisateur, et le produit doit être conçu contre son usage le plus probable
(§P.4).

---

## D. PROPOSITION DE VALEUR

Six promesses, évaluées contre ce que le produit tient réellement.

| # | promesse | ce qu'elle promet implicitement | tenu aujourd'hui ? |
|---|---|---|---|
| 1 | « Repère vous aide à comprendre ce qui se passe autour de vous et à retrouver votre place de citoyen. » | qu'il se passe des choses, et qu'on vous les raconte | **non** : le fil est national à 8/8 ; « retrouver sa place » n'est pas un livrable |
| 2 | « Comprendre son territoire. Comprendre ceux qui décident. Comprendre la politique. » | trois cours | **non** : le troisième tiers est un mensonge, le produit ne parle pas de politique |
| 3 | « La politique expliquée par ce qui se passe chez vous. » | un média d'explication locale | **non** : rien dans le produit n'explique une politique publique |
| 4 | « Qui décide chez vous, et où va votre argent. » *(actuelle)* | deux questions précises | **oui, à 100 % de couverture** — maire 1 262/1 262, comptes 1 262/1 262 |
| 5 | « Ce qui a changé chez vous. » | un fait daté, propre au lieu | **oui, après correction §G.3** : 100 % des communes ont deux exercices comparables |
| 6 | « Les personnes qui décident ici, l'argent qu'elles gèrent, et d'où nous le savons. » | trois faits vérifiables, aucune émotion | **oui, intégralement** |

**Arbitrage : la promesse 4 reste, et 5 devient son premier écran.** La promesse actuelle est
la meilleure des six et le produit ne le sait pas. Elle est courte, elle nomme deux
questions que tout le monde se pose, elle ne promet aucune transformation personnelle, et
elle est **tenue à 100 %** — ce qui est rare et précieux.

Version définitive, mot pour mot :

```
Première ligne   : Qui décide chez vous, et où va votre argent.
Sous-ligne       : Les personnes élues, les comptes de votre commune et
                   les sources officielles. Rien ne quitte cet appareil.
Fiche de magasin : Repère nomme les personnes qui décident dans votre commune,
                   montre l'argent public qu'elles gèrent, et donne la source
                   officielle de chaque chiffre. Sans compte, sans courriel,
                   et sans que rien ne sorte de votre téléphone.
```

**Ce qui est abandonné explicitement** : le mot « politique » dans toute promesse, le mot
« comprendre » en tête (il annonce un cours), et toute formulation qui promet une évolution
du lecteur.

---

## E. L'ANALOGIE DUOLINGO — CE QUI TRANSFÈRE, ET CE QUI NE TRANSFÈRE PAS

Le brief énumère huit propriétés de Duolingo. Quatre transfèrent, quatre ne transfèrent pas,
et les quatre qui ne transfèrent pas sont exactement celles qui font le succès de Duolingo.

| propriété | transfère ? | pourquoi |
|---|---|---|
| découpée | **oui** | une carte = un fait = une source |
| contextualisée | **oui, et c'est notre avantage** | le contexte n'est pas inventé, c'est la commune du lecteur |
| commencer sans prérequis | **oui** | le nom d'une commune suffit |
| petites étapes | **oui** | les six couches de §I |
| progressive | **non** | exige une mémoire du lecteur (§J) |
| répétée | **non** | la répétition espacée suppose qu'on sache ce qui a déjà été vu |
| sensation de progrès | **non** | un progrès mesuré est un score porté sur la personne qui lit |
| ludique | **non** | invariant 6, et « la démocratie n'est pas un jeu » est votre phrase |

### E.1 · La différence de fond, et elle est décisive

L'agent ÉDUCATION l'a formulée mieux que le brief : **Duolingo vend une preuve d'effort, et
la preuve d'effort est inséparable de la notation.** On ne peut pas dire « vous progressez »
sans avoir corrigé quelque chose, donc sans avoir décidé qu'une réponse était fausse. Or
Repère ne peut rien corriger : il n'y a pas de bonne réponse à « qui décide chez vous ».

Ce qui reste disponible, et que Duolingo n'a pas : **la preuve d'avoir fait le tour d'un
objet réel.** « Vous avez vu les six montants publiés pour Bagnolet, et d'où ils viennent »
n'est pas une note, ne compare personne, et ne demande aucune mémoire — l'objet est fini et
c'est lui qui est complet, pas le lecteur.

**Arbitrage : l'analogie Duolingo est retenue pour le découpage et le contexte, et rejetée
pour la progression, la répétition, la mesure et le jeu.** Ce qui la remplace : la
profondeur (§I) et la complétude d'un objet, jamais d'une personne.

---

## F. « LA LANGUE DU CITOYEN »

L'agent ÉDUCATION a écrit les 12 micro-explications, refusé 8 mots, et trouvé 6 expressions
opaques **déjà à l'écran** que le brief n'avait pas listées : *circonscription*,
*projet/proposition de loi*, *première lecture / commission mixte paritaire*, *abstention*,
*17ᵉ législature*, *exercice 2025*.

**Ce point est plus important que la liste du brief.** Le brief propose d'enseigner
« commune, maire, département, député, loi, budget… ». Or ces mots-là, les gens les
connaissent approximativement et s'en arrangent. **Les mots qui bloquent réellement la
lecture sont ceux que l'écran affiche déjà et que personne n'a choisi d'enseigner** :
« exercice », « mandat ouvert », « position non portée », « engagé », « échelon », « première
lecture ». Ce sont des mots de fichier, pas des mots de citoyen.

### F.1 · La règle

**On ne traduit que les mots que l'écran affiche, et on les traduit là où ils sont affichés.**
Aucun glossaire séparé, aucun onglet « apprendre », aucune leçon. Un mot opaque porte sa
glose ; un mot non affiché n'existe pas.

Mécanisme retenu (conception de l'agent ÉDUCATION, que j'adopte sans modification) :
`<details>` natif, deux niveaux maximum, **une seule cible par carte**, aucun survol, aucun
mot cliquable dans une phrase, aucune fenêtre modale. Raison : un mot cliquable dans une
phrase apprend au lecteur à cliquer au lieu de lire, et une modale sur mobile fait perdre la
place dans la page. Conséquence technique : aucun état à retenir, donc compatible avec
l'invariant 2, et fonctionne hors ligne sans une ligne de JavaScript.

### F.2 · Les huit mots refusés, et le plus instructif

L'agent a refusé de traduire 8 mots. Le refus le plus instructif est **« compétence »** :
le produit a un principe (P3) qui existe précisément pour ne jamais employer ce mot, et lui
donner une entrée de dictionnaire le réintroduirait par la porte de derrière. La bonne phrase
n'est pas « la commune a la compétence des écoles » mais « les écoles primaires, c'est la
commune ; les collèges, c'est le département ».

### F.3 · Les trois entrées qui manquent et qui valent plus que les douze autres

Ce sont les trois que l'agent NEUTRALITÉ a fait apparaître, et elles ne parlent pas de
vocabulaire mais de **ce que la donnée ne dit pas** :

1. **« Pourquoi certains votes portent un nom et d'autres pas. »** Un vote nominatif n'existe
   que si quelqu'un a demandé un scrutin public. La majorité des décisions de l'Assemblée
   sont prises à main levée et ne laissent aucune trace par député.
2. **« Ce qui ne laisse aucune trace. »** Un texte jamais inscrit à l'ordre du jour, un
   article retiré en commission, une matière traitée par décret : rien de tout cela ne
   produit une ligne. Ne pas inscrire un texte est l'un des actes politiques les plus
   lourds, et c'est celui qui ne produit aucune donnée.
3. **« PROMESSE, POSITION, VOTE, ACTION — et ce que l'État publie de chacune. »** Avec la
   phrase : *« Repère n'affiche que la quatrième, parce que c'est la seule que l'État publie
   sous une forme vérifiable. »*

Ces trois entrées coûtent zéro donnée, zéro collecte, zéro risque, et elles désarment par
avance les trois malentendus les plus graves du produit.

---

## G. AHA MOMENT — MESURÉ, PUIS REFUSÉ, PUIS RÉPARÉ

Le brief demande de ne pas supposer l'aha moment mais de le **mesurer** avec les données
existantes, et de comparer le candidat « 94 % des communes ont vu leur dette évoluer » à six
alternatives. C'est fait. Les mesures sont reproductibles sur les fichiers servis.

### G.1 · Couverture des sept candidats

Mesuré sur `mono/data/departments/{75,77,78,91,92,93,94,95}.json`, `mono/data/deputes.json`,
`mono/data/scrutins.json`, `mono/data/scrutins/*.json` et `mono/data/index.json`, le
15/09/2026. 1 262 communes franciliennes.

| candidat | couverture | fraîcheur | verdict |
|---|---:|---|---|
| **évolution des comptes de la commune** (2021→2025) | **1 262 / 1 262 = 100 %** comparables | OFGL, maj 29/07/2026 | **retenu, sous condition §G.3** |
| dont : encours de dette qui a changé | 1 186 / 1 262 = **94,0 %** | idem | le fait le plus fort du produit |
| dont : dépenses totales qui ont changé | 1 262 / 1 262 = **100 %** | idem | filet de sécurité pour les 76 autres |
| **vote nominatif de « votre » député** sur un texte solennel | 1 257 / 1 262 = **99,6 %** | **dernier scrutin : 21/07/2026 — 56 jours** | écarté comme aha (§G.4) |
| **décision municipale / délibération** | **0 %** — aucune source | — | inexistant |
| **projet financé par l'État** | **0 %** — `index.json` porte `"projets": null` | supprimé par D-24 | inexistant |
| **changement d'élu** | **0 %** — aucun historique dans la donnée servie | — | inexistant |
| **explication institutionnelle** | 100 % | intemporel | ne surprend pas, ne concerne personne en particulier |

Quatre des six alternatives demandées par le brief ont une couverture de **zéro**. Ce n'est
pas une question d'arbitrage produit : la donnée n'existe pas dans le paquet servi. Il faut
le savoir avant de dessiner un fil d'actualité locale.

### G.2 · Le candidat retenu, et son amplitude réelle

Variation de l'encours de dette entre le premier et le dernier exercice publié, 1 193
communes où le calcul est possible (dette de départ non nulle) :

| amplitude | communes |
|---|---:|
| 0 % (inchangée) | 27 |
| < 10 % | 155 |
| 10 – 25 % | 253 |
| 25 – 50 % | 343 |
| 50 – 100 % | 241 |
| **> 100 %** | **174** |

Baisses de 50 % ou plus : **199**. Hausses de 100 % ou plus : **152**. Dette entièrement
soldée : **22** communes, dont Boissise-la-Bertrand (160 000 € → 0), Mary-sur-Marne
(89 421 € → 0), Mulcent (200 000 € → 0). Dette nulle aux deux bornes : 49.

Ce candidat satisfait les cinq critères du brief, et il est le seul :
il **surprend** (personne ne sait que sa commune a soldé sa dette) ; il **concerne
directement** (c'est sa commune, pas la France) ; il est **compréhensible** (deux montants et
une soustraction) ; il est **fiable** (un producteur, une date, un lien) ; et il **donne envie
d'en savoir plus** (« qui a décidé ça ? » → l'onglet voisin).

Et surtout : il correspond à la **troisième référence absolue** autorisée par P16 — la
commune comparée à elle-même dans le temps —, la seule qui ne compare aucun territoire à un
autre. **Aucune collecte nouvelle. Le chiffre est déjà dans le fichier de 96 Ko que le produit
télécharge déjà.**

### G.3 · POURQUOI IL N'EST PAS CONSTRUISIBLE AUJOURD'HUI

Mesure faite ici, sur `site_donnees/ofgl/*.json` (les 104 paquets départementaux, France
entière), en comptant les zéros par exercice et par poste :

| exercice | poste | valeurs à zéro | sur | part |
|---|---|---:|---:|---:|
| 2021 | **Frais de personnel** | **34 868** | 34 868 | **100,0 %** |
| 2024 | Frais de personnel | 200 | 34 869 | 0,6 % |
| 2025 | Frais de personnel | 200 | 34 778 | 0,6 % |
| 2021 | Encours de dette | 1 569 | 34 868 | 4,5 % |
| 2024 | Encours de dette | 1 624 | 34 869 | 4,7 % |
| 2025 | Encours de dette | 1 654 | 34 778 | 4,8 % |
| 2021 | Recettes / Dépenses / Impôts | 0 ou 1 | 34 868 | ≈ 0 % |

**Aucune commune de France ne paie zéro salaire.** Le poste « Frais de personnel » est absent
de l'extraction 2021 et notre chaîne l'a écrit comme un montant nul. Un zéro dans le paquet
servi ne distingue donc pas « publié à zéro » de « non publié ».

**Trois conséquences, dont une qui met en cause une correction que j'ai faite moi-même :**

1. **Le correctif P0 du 14/09 sur `OuVaArgent.jsx` est juste sur l'écran et faux sur la
   donnée.** J'ai corrigé `valeur()` pour qu'un zéro publié ne soit plus détruit, et pour
   qu'il produise la phrase « L'Observatoire publie un encours de dette nul pour l'exercice
   2025 : cette commune ne doit rien. » Cette phrase n'est vraie que parce que l'écran
   n'affiche **qu'un seul exercice**, et que le poste affiché n'est pas celui qui est cassé.
   Le jour où l'écran affiche l'évolution 2021→2025 — c'est-à-dire l'aha moment recommandé —
   la même règle écrirait **34 868 affirmations fausses** sur les frais de personnel.
2. **Le chiffre « 94,0 % » reste valide pour la dette** (zéros stables à 4,5–4,8 % sur les
   trois exercices : c'est un fait, pas une colonne manquante) **et il est invalide pour les
   frais de personnel**, où ma première mesure donnait « 99,6 % des communes ont vu leurs
   frais de personnel augmenter ». Cette phrase est un artefact de collecte. Elle aurait été
   affichée avec une source et une date.
3. **Aucun des 134 contrôles ne l'a vu**, parce qu'aucun ne compare une valeur à la
   population entière. La doctrine du vide (invariant 5) interdit un zéro **à l'écran** ;
   rien n'interdit un zéro **dans la donnée**, là où aucun écran ne peut le rattraper.

**Le correctif, et c'est le P0 numéro un du projet :**

```
1. La chaîne écrit `null`, jamais 0, quand la source ne porte pas la ligne.
   Un 0 dans le paquet signifie désormais « publié à zéro », et rien d'autre.
2. Un contrôle exécutable, à ajouter à mono/tests/ :
   pour chaque exercice et chaque poste, si la valeur est nulle pour plus de
   95 % des communes du paquet, le test ÉCHOUE.
   Motif écrit dans le test : « un total de 0 sur une population entière est
   une erreur de collecte, jamais une mesure. »
3. Le même contrôle en sens inverse : si un poste passe de « absent partout »
   à « présent partout » entre deux collectes, la publication s'arrête et le
   dit — c'est le signe que la source a changé de format.
```

Coût : quelques heures. Sans lui, l'aha moment ne doit pas être construit.

### G.4 · Pourquoi le vote du député n'est pas l'aha moment, malgré 99,6 % de couverture

Trois raisons mesurées, et la troisième est éliminatoire.

1. **La fraîcheur.** Le dernier scrutin public de l'Assemblée est le n° 8434 du
   **21 juillet 2026**. L'agenda de la séance publique est **vide**. Le produit afficherait, en
   décembre, une « actualité » de cinq mois. C'est exact, mais ce n'est pas un aha : c'est un
   produit qui a l'air abandonné. *(La phrase honnête « l'Assemblée n'a pas voté depuis le
   21 juillet 2026 » est infiniment préférable à un écran qui semble périmé — et elle doit
   être écrite.)*
2. **Le corpus est national.** Les 8 textes solennels sont **les mêmes pour les 34 969
   communes de France**. C'est la mesure de l'agent UX : 8 faits sur 8 identiques entre
   Bagnolet et Aubervilliers. Un aha moment identique partout n'est pas un aha moment local ;
   c'est précisément « ça parle de la France avec le nom de notre commune en haut ».
3. **La donnée publiée enfreint déjà l'invariant 8 par sa forme** (§K.1). Construire un aha
   moment dessus serait bâtir sur un défaut qu'il faut d'abord réparer.

### G.5 · La règle de sélection du chiffre — et le piège d'invariant qu'elle contient

L'agent UX propose : « le premier des six montants, dans l'ordre du fichier, qui a changé
entre deux exercices ». Le garde-fou est juste (aucun critère d'amplitude, de signe ou de
rang — sinon la règle devient un tri de chiffres, donc l'invariant 3 par la fenêtre).
Mais mesuré : **l'ordre du fichier commence par « Recettes totales », qui a changé pour
100 % des communes.** La règle produirait donc, pour les 1 262 communes, la même phrase
plate sur les recettes, et l'aha moment n'aurait jamais lieu.

**Arbitrage : un poste fixe, déclaré, identique pour toutes les communes — l'encours de
dette —, avec un second poste fixe en repli.** Un poste fixe est l'exact contraire d'un
classement : c'est la même ligne pour tout le monde, et aucune commune n'est choisie pour la
taille de son chiffre.

```
Règle R-AHA (à inscrire dans les décisions) :
  1. poste principal : « Encours de dette », pour toutes les communes.
  2. si la dette n'a pas changé entre les deux exercices publiés
     (27 communes) : poste de repli « Dépenses totales » (100 % de changement).
  3. si aucun des deux n'est comparable : phrase d'absence + lien officiel
     (invariant 5), jamais un gabarit vide.
  4. INTERDIT : tout critère de sélection portant sur l'amplitude, le signe
     ou le rang du montant. Contrôle exécutable à écrire.
  5. INTERDIT : tout pourcentage dans la phrase de premier écran.
```

**La règle 5 est mon ajout, et elle n'est pas cosmétique.** « La dette de votre commune a
augmenté de 112 % » est une affiche de campagne ; le produit en fabriquerait **174** (§G.2).
Deux montants datés et leur différence en euros disent le même fait sans fournir le slogan :

> « Entre 2021 et 2025, la dette de Bagnolet est passée de 149 010 717 € à 136 233 738 €.
> Elle a baissé de 12 776 979 €. »
>
> **Ce que cette phrase ne veut pas dire** — Une dette qui baisse n'est pas en soi une bonne
> nouvelle, et une dette qui monte n'est pas en soi une faute : on emprunte pour construire
> une école qui durera plus longtemps que l'emprunt. Repère n'attribue ce mouvement à
> personne.
>
> *Publié par l'Observatoire des finances et de la gestion publique locales le 29 juillet
> 2026. Vérifier ↗*

Et pour Mulcent : « Mulcent devait 200 000 € en 2021. Depuis 2024, elle ne doit plus rien. »

La carte « ce que cette phrase ne veut pas dire » est **obligatoire**, pas optionnelle. Sans
elle, la phrase est un jugement sur une équipe municipale.

### G.6 · Ce que je ne peux pas mesurer, et qui reste à mesurer

**La surprise ne se mesure pas sur des fichiers.** Les cinq critères du brief comprennent
« surprend » et « donne envie d'en savoir plus » : ce sont des propriétés du lecteur, pas de
la donnée. Tout ce qui précède mesure la **couverture** et l'**amplitude**, qui sont des
conditions nécessaires, pas la preuve.

Ce qu'il faut mesurer en bêta, et c'est la seule métrique d'aha honnête : **la part des
premières visites qui ouvrent « Vérifier » après avoir lu la phrase.** Si le lecteur va voir
la source, le chiffre l'a atteint. C'est mesurable sans identifier personne (§X).

---

## H. ARCHITECTURE PRODUIT

### H.1 · Les quatre piliers du brief, testés contre le produit réel

| pilier | ce qui existe | ce qui est vide | verdict |
|---|---|---|---|
| **COMPRENDRE** | rien de structuré ; 6 expressions opaques déjà à l'écran non traduites | tout, mais le coût est faible et la donnée est nulle | **à construire — meilleur rapport valeur/risque du produit** |
| **SUIVRE** | un nom de maire, un nom de député, 8 votes nationaux vieux de 56 jours | toute notion de suivi : aucun historique, aucune notification, aucune mémoire | **trompe-l'œil — voir §K** |
| **VÉRIFIER** | complet : producteur, licence, date, lien, sur chaque chiffre | rien | **le seul pilier réellement tenu, et le meilleur du marché** |
| **PARTICIPER** | rien | tout | **coquille vide — voir ci-dessous** |

**PARTICIPER est une coquille vide, et il faut renoncer à le remplir en décembre.** Ce que le
produit pourrait honnêtement offrir sans devenir militant ni promettre ce qu'il ne tient pas
se réduit à trois choses, toutes très modestes :

1. **savoir à quelle porte frapper** : « pour une place en crèche, c'est la commune ; pour un
   collège, c'est le département ; pour une carte de transport, c'est la région » — c'est-à-dire
   du COMPRENDRE déguisé, et c'est très utile ;
2. **les dates des prochaines échéances électorales**, si et seulement si une source officielle
   les publie de manière vérifiable ;
3. **« signaler une erreur »** — le seul mécanisme de participation qui soit à la fois honnête,
   utile et sans risque, et il manque aujourd'hui (aucun ours, aucun responsable de publication
   nommé, aucun moyen de signaler une donnée fausse).

Tout le reste — pétitions, consultations, « contactez votre élu », budget participatif —
suppose soit une source qui n'existe pas, soit un acte que le produit ne peut pas garantir,
soit un geste militant. **Refus pour décembre.**

**Arbitrage : trois piliers, pas quatre.** COMPRENDRE / VÉRIFIER / **CE QUI A CHANGÉ** — ce
dernier remplaçant SUIVRE, parce que « suivre » promet une mémoire que le produit n'a pas,
alors que « ce qui a changé » ne promet qu'un état daté, ce qui est exactement ce que la
donnée permet. PARTICIPER est différé, et ses deux morceaux honnêtes sont versés dans
COMPRENDRE.

### H.2 · L'axe central du brief, et deux architectures concurrentes

L'axe proposé compte **onze étages** (MA VIE → MON TERRITOIRE → CE QUI CHANGE → QUI DÉCIDE →
CE QUI A ÉTÉ DÉCIDÉ → COMMENT → CE QUE MON ÉLU A FAIT → CE QUE LES PARTIS PROPOSENT →
POURQUOI → SOURCE → CE QUE JE PEUX FAIRE).

Testé contre la donnée, **cinq de ces onze étages ont une couverture nulle** : CE QUI A ÉTÉ
DÉCIDÉ (au sens municipal : 0 %), CE QUE MON ÉLU A FAIT (au sens local : 0 %), CE QUE LES
PARTIS PROPOSENT (0 %, et refus définitif §L), POURQUOI (0 % — aucune source ne publie le
motif d'un vote), CE QUE JE PEUX FAIRE (0 %). Un axe dont cinq étages sur onze sont vides
n'est pas une architecture, c'est une feuille de route de collecte.

**Alternative 1 — « LA QUESTION, PUIS LA PREUVE » (trois étages).**

```
CE QUI A CHANGÉ ICI     un fait daté, chiffré, propre au lieu
QUI DÉCIDE ICI          les personnes, par échelon, avec ce dont chacun répond
D'OÙ ÇA VIENT           producteur, licence, date, lien, et ce que nous ne savons pas
```
Couverture : 100 %, 100 %, 100 %. Tout ce qui est affiché existe. Aucun étage vide.

**Alternative 2 — « L'OBJET, PAS LA PERSONNE » (trois entrées).**

```
MA COMMUNE      les personnes, l'argent, les échelons
UN TEXTE        ce qu'il est, où il en est, comment l'Assemblée s'est prononcée
UN MOT          le dictionnaire, atteignable depuis n'importe quel écran
```
Le pari : l'unité suivie est un **objet** (une commune, un texte, un mot), jamais une
personne. Conséquence heureuse : ni classement, ni présence, ni étiquette politique — les
trois refus du produit deviennent structurels au lieu d'être gardés par des listes de mots.

**Arbitrage : Alternative 1 pour la bêta de décembre, Alternative 2 comme cible.** La 1 est
construisible avec la donnée d'aujourd'hui et corrige le défaut mesuré (« ça parle de la
France »). La 2 demande le suivi d'un texte, qui suppose les dossiers législatifs (§M), donc
pas décembre.

**Ce que j'abandonne** : l'axe à onze étages ; l'idée que « MA VIE » puisse être un étage
(le produit ne sait rien de la vie du lecteur, et c'est voulu) ; et les cinq onglets du
brief — voir ci-dessous.

### H.3 · Combien d'onglets

Le brief propose cinq onglets (ACCUEIL / APPRENDRE / SUIVRE / EXPLORER / MOI) et demande de
ne pas supposer que cinq est la bonne réponse. Ce n'est pas la bonne réponse, pour quatre
raisons dont trois sont mesurées :

- **MOI** n'a aucun contenu : la seule préférence du produit est la commune, déjà dans
  l'en-tête, et il n'y aura jamais de compte. Un onglet pour une ligne.
- **APPRENDRE** comme onglet contredit §F : un dictionnaire séparé est un manuel scolaire, et
  l'apprentissage doit émerger de l'information réelle. Le dictionnaire doit être **partout**,
  donc nulle part comme onglet.
- **SUIVRE** promet la mémoire absente (§S).
- **EXPLORER** (France / institutions / partis) est l'onglet qui fabrique la comparaison
  inter-territoires et la comparaison de partis, tous deux interdits. C'est l'onglet le plus
  dangereux du brief.

**Arbitrage : trois onglets, et ils existent déjà** — `Qui décide` · `Ce qui a été décidé` ·
`L'argent de <commune>` — plus `D'où ça vient` en pied de page, pas en onglet. Le quatrième
onglet actuel (`Sources`) est renommé, et le jeu est déjà sorti de la barre (Phase 2).

**Et la barre d'onglets n'est plus le premier écran.** Elle arrive après la première phrase.
La carte du produit existe et reste nommée — P2 est respecté —, mais elle n'est plus la
première chose qu'on lit, parce que la première chose qu'on lit doit être un fait sur le lieu
du lecteur.

---

## I. ARCHITECTURE UX

### I.1 · Les 30 premières secondes, aujourd'hui

Mesuré par l'agent UX sur les captures réelles, téléphone de 390 px :

- **41 % du premier écran est du sol vide** (509 → 870 px : rien).
- La plus belle phrase du produit — *« Repère ne demande jamais votre adresse : le nom de
  votre commune suffit, et il ne quitte pas cet appareil »* — est **sous** le champ de
  saisie, donc **sous le clavier**, donc invisible au moment exact où elle sert.
- Le champ propose comme exemples `Ustaritz, Bayonne…` à un lecteur du 93 : deux communes du
  Pays basque.
- Le premier chiffre propre à la commune arrive à **768–806 px**, sous la ligne de flottaison
  de tous les téléphones.
- **La deuxième visite n'a pas d'écran d'entrée** : d'où la phrase entendue 8 fois sur 8,
  *« Il faut encore que je repasse toute la liste des communes. »*

### I.2 · Le premier écran retenu

Quatre variantes ont été conçues et comparées (« la première phrase », « l'alphabet », « une
seule touche », « la question d'abord »). **Retenue : la première phrase, avec l'alphabet
comme chemin sans clavier.**

Raison décisive, et elle est de contenu, pas d'ergonomie : les trois autres variantes
changent le **chemin** ; seule celle-ci change **ce qu'il y a au bout**. Le verdict des huit
testeurs ne portait pas sur la recherche.

```
Avant le choix
──────────────
REPÈRE
Qui décide chez vous, et où va votre argent.
Les personnes élues, les comptes de votre commune et les sources
officielles. Rien ne quitte cet appareil.

Repère ne demande jamais votre adresse. Le nom de votre commune
suffit, et il ne quitte pas cet appareil.          ← AU-DESSUS DU CHAMP

Quelle commune ?
[  Bagnolet, Bobigny, Meaux…                                    ]
ou choisissez une première lettre
[A][B][C][D][E][G][L][M][N][P][R][S][T][V]
Je ne trouve pas ma commune — chercher par département

Après le tap  (ni en-tête, ni onglets, ni sélecteur)
────────────────────────────────────────────────────
Bagnolet
Seine-Saint-Denis (93) · 41 918 habitants au dernier exercice publié

Entre 2021 et 2025, la dette de Bagnolet est passée
de 149 010 717 € à 136 233 738 €.
Elle a baissé de 12 776 979 €.

Ce que cette phrase ne veut pas dire
[…]

Pourquoi cette phrase et pas une autre
C'est l'encours de dette, le même poste pour les 1 262 communes.
La règle ne regarde ni la taille du chiffre, ni son sens, ni la commune.

D'où vient ce chiffre ? Publié par l'État — Observatoire des finances
locales — le 29 juillet 2026. Vérifier ↗

[ Le reste sur Bagnolet — les élus, les comptes, ce qui a été décidé ]
```

**Cible mesurable qui remplace l'ancienne** : la métrique « 106 cibles cliquables ramenées à
2 » est abandonnée — elle mesurait la mauvaise chose, et le produit l'a prouvé puisque
l'écran à 2 cibles est le seul sur lequel une personne a fait « ah » sans rien apprendre.
Nouvelle métrique : **hauteur en pixels entre le haut de l'écran et le premier chiffre propre
à la commune. Aujourd'hui 768–806 px. Cible : moins de 250 px.**

**Géolocalisation : abandonnée définitivement.** Pas par prudence : parce que son coût est la
substance de l'invariant 2 et la seule promesse que ce produit a en propre. Une variante a
été conçue avec elle, en énonçant honnêtement le prix ; le prix n'en vaut pas la peine, et la
décision n'est pas à rouvrir dans six mois. *(Le sujet a déjà été tranché une fois dans la
revue d'ingénierie, option C rejetée. C'est la deuxième fois, et la dernière.)*

### I.3 · Les six couches, et la seule qui manque

Le modèle à six niveaux du brief est bon, et le produit en a déjà cinq. Mesuré :

| niveau | ce qui existe | état |
|---|---|---|
| 1 · une phrase | le titre d'écran, aujourd'hui un nom de commune | **à réécrire : un nom n'est pas une information** |
| 2 · quelques chiffres | les six montants de « Où va l'argent » | existe |
| 3 · explication simple | **manque : c'est le dictionnaire de §F** | **à construire** |
| 4 · contexte institutionnel | les phrases de compétence par échelon (P3) | existe, mais mal placé (518 px en pleine page) |
| 5 · données détaillées | les 72 votes de détail, les exercices | existe |
| 6 · source primaire | producteur, licence, date, lien | existe, et c'est le meilleur du produit |

**Un seul niveau manque, le 3.** Le brief présente les six couches comme une architecture à
inventer ; c'est en réalité **une couche à ajouter et un ordre à corriger**. C'est une bonne
nouvelle, et elle rend le chantier petit.

Règle d'ordre, qui découle de la mesure 6 de l'agent UX (« la preuve passe avant le fait
suivant ») : **le niveau 6 ne s'intercale jamais entre deux faits.** Aujourd'hui, entre le
nom du maire et l'élément local suivant, le lecteur traverse deux phrases sur la donnée et
aucune sur sa commune.

### I.4 · Le « fil de citoyenneté » — pourquoi il ne peut pas être construit tel quel

Le brief en donne l'exemple : conseil municipal / finances / Assemblée / territoire / loi.
Mesuré, sur les cinq entrées de cet exemple :

| entrée du fil | couverture réelle |
|---|---|
| 🏛️ « Une nouvelle décision concerne votre commune » | **0 %** — aucune source de délibérations |
| 💶 « La dette de votre commune a évolué de X % » | 100 %, mais ce n'est pas un événement : c'est un état, publié une fois par an |
| 🏛️ « Votre députée a participé à ce vote » | 99,6 %, mais **identique pour toute la France** et vieux de 56 jours |
| 🚆 « Un projet concerne votre département » | **0 %** — `projets: null` |
| 📜 « Cette loi vient d'être adoptée » | national, donc pas « autour de vous » |

**Un fil suppose un flux. Le produit n'a pas de flux : il a des états, publiés à des rythmes
annuels ou trimestriels, et un corpus national suspendu depuis juillet.** Construire un fil
sur cette donnée produit mécaniquement ce que l'étude a mesuré : un écran d'actualité
nationale sous un titre communal.

Ce qui remplace le fil, et qui est honnête : **un état daté**, avec sa date en clair et la
phrase qui dit pourquoi elle est ancienne. « Voici l'état de votre commune au 29 juillet
2026 » est vrai. « Voici ce qui s'est passé autour de vous » ne l'est pas.

Le fil redevient possible le jour où une source de délibérations municipales existe à la
maille commune. Elle n'existe pas (§M).

---

## J. MODÈLE D'APPRENTISSAGE — ET LE REFUS DE FABRIQUER UNE MÉMOIRE

### J.1 · Le conflit, énoncé plutôt que contourné

Le brief demande une progression. Le produit a **une seule clé de stockage local nommée**
(invariant 2), qui contient le département choisi. Il n'a donc aucun moyen de savoir ce que
le lecteur a déjà vu, ni combien de fois il est venu.

L'agent ÉDUCATION a exploré la seule échappatoire technique — encoder dans cette unique clé
un masque de bits des explications déjà ouvertes — et **l'a refusée**, avec la formule
exacte : *« ce serait du blanchiment d'invariant »*. **J'endosse ce refus.** Une clé qui
contient un département et l'historique de lecture du lecteur n'est plus « une seule clé,
aucun traceur » : c'est un traceur d'une seule clé. La lettre de l'invariant serait
respectée et son objet détruit.

**Conséquence, dite sans adoucissement : la progression demandée par le brief ne sera pas
construite.** Ni séries de consultation, ni objectifs personnels, ni « vous avez découvert
3 institutions aujourd'hui », ni répétition espacée, ni compteur de quoi que ce soit portant
sur le lecteur.

Le brief lui-même donne la raison de ce refus, deux paragraphes plus haut que la demande :
*« La démocratie n'est pas un jeu. »* Et l'invariant 6 en interdit déjà le vocabulaire.

### J.2 · Trois conflits d'invariant que le brief crée, et qu'il faut trancher par écrit

Ce sont les trois seuls endroits où le brief demande quelque chose que le produit s'est
interdit. Ils sont dits ici parce qu'un conflit tranché en silence revient toujours.

| # | invariant, mot pour mot | demande du brief | arbitrage |
|---|---|---|---|
| **6** | « Rien qui gamifie le vote ou l'opinion. » | « séries de consultation éventuellement », « objectifs personnels », « vous avez découvert 3 institutions » | **l'invariant gagne.** Refus complet, et pour deux raisons cumulées : la gamification et l'absence de mémoire. Même sans l'invariant 6, la phrase serait impossible. |
| **8** | « Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence. » | « suivre son élu : votes, interventions, amendements, **présence** » | **l'invariant gagne, et il est déjà enfreint** — non par un écran, mais par la forme de la donnée publiée (§K.1). Priorité de réparation avant toute nouvelle fonctionnalité. |
| **3** | « Aucun classement, score ou tri numérique de personnes, de partis ou de territoires. » | « comparer les positions des partis » | **l'invariant gagne, et la question ne se pose même pas** : l'objet source n'existe pas (§L). |

### J.3 · Ce qui remplace la progression : la répétition incidente, et la complétude d'un objet

Deux mécanismes, tous deux sans mémoire.

**1 · La réencontre incidente, avec des formulations gelées.** L'agent ÉDUCATION a établi que
la répétition espacée est un contresens ici : le citoyen n'a pas à *produire* ce vocabulaire,
il a seulement à le *reconnaître*. Or la reconnaissance se joue sur la forme exacte des mots.
Donc : **une explication a une formulation unique, gelée, et elle réapparaît identique partout
où le mot apparaît.** Le lecteur qui rencontre « exercice 2025 » pour la quatrième fois relit
exactement la même phrase — et c'est cette identité, pas un algorithme de répétition, qui
produit l'apprentissage. Coût technique : zéro. Contrainte d'écriture : les explications
vivent dans un seul fichier et ne sont jamais reformulées à l'endroit où elles s'affichent.
C'est un contrôle exécutable trivial (une explication, un seul texte source).

**2 · La complétude de l'objet, jamais de la personne.** « Vous avez vu les six montants
publiés pour Bagnolet, et d'où ils viennent » est vérifiable à l'instant même, sur l'écran,
sans rien retenir : c'est l'objet qui est complet. La phrase interdite est sa jumelle
apparente, « vous avez découvert 3 institutions aujourd'hui », qui compte le lecteur et
suppose qu'on se souvienne de lui.

### J.4 · La forme de l'explication

Règles, toutes issues du relevé ÉDUCATION et adoptées sans modification :

- **40 mots maximum**, et l'explication doit tenir sans que le lecteur quitte sa place ;
- **une seule cible par carte** — pas de mot cliquable au fil de la phrase ;
- **aucun survol, aucune modale, aucun bouton « Compris »** *(un bouton « Compris » enregistre
  un état : il suppose la mémoire refusée en §J.1)* ;
- **aucune question posée au lecteur**, jamais, sous aucune forme : une question implique une
  réponse, une réponse implique une correction, une correction implique une note ;
- l'explication **ne dit jamais ce qu'il faut en penser** : « le conseil municipal vote le
  budget » est une explication ; « le conseil municipal devrait mieux associer les habitants »
  est une opinion.

---

## K. SUIVI DES ÉLUS

### K.1 · Le fait le plus grave du document : l'invariant 8 est déjà enfreint par la forme

L'agent NEUTRALITÉ a mesuré ceci sur la donnée que nous publions aujourd'hui, en statique :

| fichier | poids | contenu |
|---|---:|---|
| `data/scrutins.json` | 28 Ko | catalogue de 80 scrutins, toute la France |
| `data/scrutins/*.json` (107 fichiers) | 58 Ko | positions de 574 députés |
| `data/deputes.json` | 53 Ko | nom, prénom, circonscription, `acteurRef` |

Les positions sont stockées comme **une chaîne par député, couvrant les 80 scrutins dans
l'ordre** : `"...............ppcpcppppa.ppacpp"`. Le point signifie « position non portée ».

**Compter les points d'une chaîne est l'opération la plus simple qui existe.** Mesuré sur
notre propre donnée : médiane **65 positions non portées sur 80** par député, 486 députés sur
574 en portent 40 ou plus. Un tiers qui veut publier « taux de présence de votre député »
trouve **19 % pour le député médian**, en une ligne de JavaScript, sur des fichiers signés
Repère.

Ce taux serait **faux** — la plupart des 80 scrutins sont des scrutins ordinaires à faible
participation (441 votants sur l'un, 106 sur un autre) — mais il serait calculé sur nos
fichiers, et l'erreur nous serait imputée.

**Et la garde est verte.** L'invariant 8 est gardé par une liste de **noms de champs**
(`CHAMPS_INTERDITS` : `presence`, `absence`, `assiduite`, `taux_presence`…) vérifiée sur le
texte brut des fichiers produits. Aucun champ ne s'appelle `presence`. **L'invariant est
enfreint par la forme de la donnée, pas par son vocabulaire, et le contrôle ne peut pas le
voir.**

C'est le P0 numéro deux du projet, à égalité avec le zéro structurel de §G.3. Correctif :

```
1. Indexer les positions PAR SCRUTIN, pas par personne.
   { "8431": { "PA721908": "p", ... } }  au lieu de  { "PA721908": "...pp.c" }
   Une suite par personne n'existe plus dans la donnée publiée.
2. Ne publier que les scrutins réellement affichés (8, pas 80).
3. Retirer de l'écran toute ligne correspondant à une position non portée.
4. Contrôle exécutable : aucun fichier publié ne contient, pour une clé
   nommant une personne, une valeur dont la longueur est celle du catalogue.
```

Tant que ce n'est pas fait, **aucune fonctionnalité de « suivi des élus » ne doit être
construite** : elle s'appuierait sur une donnée qui enfreint déjà l'invariant.

### K.2 · Le piège de l'absence, mesuré sur un cas réel

Mesuré ici : sur les **97 sièges** d'Île-de-France, **95** ont un fichier de positions. Les
deux qui n'en ont pas sont les sièges de la **4ᵉ de Paris** et de la **5ᵉ des Yvelines** —
ce dernier étant celui de la personne qui préside l'Assemblée nationale, laquelle, par
usage, ne prend pas part aux scrutins.

**Cinq communes franciliennes** ont donc aujourd'hui, pour seule information sur « leur »
député, une absence de position. Un écran qui écrit « aucune position portée » leur présente
un usage institutionnel comme un comportement individuel. **C'est exactement l'erreur que
l'invariant 8 existe pour empêcher, et elle est déjà là.**

La bonne réponse n'est pas d'écrire la cause — nous ne la connaissons pas, et l'inventer
serait pire. C'est de **ne pas afficher la ligne**. Une absence de donnée n'est pas un fait
sur une personne.

### K.3 · Ce que « suivre son élu » peut honnêtement signifier

Le brief liste dix objets de suivi. Verdict, objet par objet :

| objet | verdict |
|---|---|
| votes | **oui, sous six conditions** : accès depuis le texte et jamais depuis la personne ; un scrutin par bloc ; décompte officiel avant la position ; aucune ligne pour une position non portée ; un seul nom par écran ; donnée non indexée par personne |
| présence | **refus** — invariant 8, et la donnée est fausse dans 17 % des cas mesurés |
| interventions | **refus** — source en XML seul, documentation de structure datée de 2016, index interdit aux robots, et une intervention est de la prose : en tirer un sens demande une interprétation |
| amendements | **sous condition, valeur faible** : aucun champ territorial n'existe. « Un amendement qui concerne votre commune » serait un rattachement deviné, donc interdit. Seule phrase possible : « un amendement déposé par le député élu ici » |
| prises de position | **refus** — aucune source publique ; les déduire d'un discours ou d'un programme est une interprétation |
| décisions | **0 % de couverture** |
| projets | **0 % de couverture** (`projets: null`) |
| mandat | **oui** — dates, circonscription, source. C'est la donnée la plus sûre du produit |
| historique | **refus pour décembre** — aucun historique dans la donnée servie |
| prochaines échéances | **sous condition** qu'une source officielle vérifiable existe |
| **groupe parlementaire** | **sous condition** : un seul groupe (celui du député du lecteur), jamais une liste, accompagné systématiquement de « un groupe parlementaire n'est pas un parti » |

**Arbitrage — et c'est un changement d'objet, pas un adoucissement : on ne suit pas une
personne, on suit un texte.** Le lecteur marque un texte de loi ; l'écran lui dit ce qui lui
est arrivé — adopté, rejeté, parti au Sénat, jamais inscrit. L'objet suivi n'est pas une
personne, donc il n'y a ni classement, ni présence, ni étiquette. Compatible avec l'invariant
2 : une seule clé locale, rien n'est expédié.

**Je recommande de construire cela à la place du suivi des élus.** C'est la traduction
honnête du mot « suivi » dans ce produit.

Deuxième forme acceptable, et elle répond littéralement à « reconnecter citoyen ↕ élu » :
**suivre une fonction, pas une personne.** « Qui est maire de ma commune » est un objet
durable ; l'événement est « le titulaire a changé ». Aucun flux d'activité, aucun compte,
aucune note.

### K.4 · Un contrôle qui manquait, et qui aurait trouvé une contradiction dès sa première exécution

L'agent DATA a relevé qu'une même personne est affichée par le produit **à la fois comme
député en exercice** (source Assemblée nationale) **et comme maire d'une commune** (source
Répertoire national des élus) — pour La Courneuve (93027). Le cumul d'un mandat de député et
d'un mandat de maire est interdit : **l'une des deux affirmations est périmée, et Repère
affiche les deux.**

Je ne tranche pas laquelle : aucune source dont je dispose ne l'établit. Mais la leçon est
générale et elle vaut plus que le cas :

> **Un fichier régénéré chaque jour n'est pas un fichier vérifié chaque jour.** Les archives
> de l'Assemblée portent un horodatage de génération ; il dit quand le fichier a été écrit,
> pas quand son contenu a été mis à jour.

Contrôle à écrire, **gratuit, sans source nouvelle** : aucune personne ne doit apparaître à
la fois dans les députés en exercice et dans les maires du RNE. Il y a au moins un cas en
Île-de-France ; il aurait été trouvé à la première exécution.

---

## L. SUIVI DES PARTIS — REFUS DÉFINITIF

### L.1 · L'objet source n'existe pas

L'Assemblée nationale publie des **groupes parlementaires**, pas des partis. Ce n'est pas un
détail de vocabulaire :

- un groupe peut réunir plusieurs partis ;
- un député peut être *apparenté* à un groupe sans appartenir au parti ;
- des députés sont *non-inscrits* : aucun groupe, aucun parti dans la donnée ;
- un parti peut avoir des élus dans deux chambres sous deux noms de groupe différents ;
- **aucun fichier public français ne publie « position du parti X sur le texte Y ».**

Notre propre donnée le confirme : `mono/data/deputes.json` porte `prenom`, `nom`,
`acteurRef`, `dateDebut`. Rien d'autre. Et le produit écrit déjà, à trois endroits de
`QuiDecide.jsx` : *« Ni étiquette politique, ni parcours : le fichier des mandats n'en porte
pas. »*

**Donc : « comparer les positions des partis » obligerait Repère à décider lui-même quel
groupe correspond à quel parti — c'est-à-dire à fabriquer l'étiquette politique qu'il promet
en trois endroits de ne pas fabriquer.** Le refus tombe avant même la question de la
neutralité d'affichage.

### L.2 · Et même si la donnée existait, l'écran serait indéfendable

Trois raisons, cumulatives :

1. **Aucun ordre d'affichage n'est neutre.** Par nombre de sièges = un tri numérique de
   partis (invariant 3). Par ordre protocolaire de l'Assemblée = un tri par nombre de sièges
   déguisé. Alphabétique = arbitraire mais défendable — et c'est le seul, à condition de le
   déclarer à l'écran. Deux colonnes « favorables » / « opposés » = une répartition sur un axe
   moral.
2. **Un sous-ensemble est une sélection, donc un jugement.** Tous les groupes ou aucun.
3. **Son usage le plus probable est la capture militante.** C'est la troisième des cinq
   captures les plus dangereuses que le produit pourrait fabriquer.

**Verdict : cette fonctionnalité ne mérite pas d'être construite.** Elle n'aide en rien le
citoyen à savoir à quelle porte frapper, qui est la raison d'être écrite du produit.

### L.3 · Ce qui est possible à la place, et qui est meilleur

**La position majoritaire d'un groupe sur un scrutin**, si et seulement si le champ
`positionMajoritaire` existe bien dans l'archive des scrutins de l'Assemblée — l'agent DATA a
relevé le nom du champ dans un schéma engendré par notre propre chaîne, mais n'a pas pu
ouvrir l'archive. **À décrire sur le runner avant toute décision.**

Si le champ existe, la phrase acceptable est celle-ci, et c'est le producteur qui prononce le
verdict, pas nous :

> « Le groupe auquel appartient ce député a fait connaître une position majoritaire "contre"
> sur ce scrutin. Une position majoritaire de groupe n'est pas la position de chacun de ses
> membres. Un groupe parlementaire n'est pas un parti : il peut en réunir plusieurs, et des
> députés y siègent sans appartenir à aucun. »

Conditions : tous les groupes ou aucun ; ordre déclaré ; aucun cumul entre textes ; atteignable
depuis un texte, jamais depuis une personne ni depuis une commune ; décompte officiel sur le
même écran. **Même sous ces conditions, je ne le recommande pas. Je dis seulement que ce
n'est pas impossible.**

### L.4 · PROMESSE ≠ POSITION ≠ VOTE ≠ ACTION

La distinction du brief est juste, et elle est **une entrée de dictionnaire, pas une
fonctionnalité** :

| catégorie | ce que l'État publie |
|---|---|
| PROMESSE | rien de structuré. Les professions de foi existent en fac-similé, non exploitable |
| POSITION | rien. Aucune source publique ne publie la position d'un parti ou d'un élu |
| VOTE | **oui** : les scrutins publics, nominativement, quand un scrutin public a été demandé |
| ACTION | partiellement : amendements et questions écrites, sans rattachement territorial |

**Et le « décalage promesse / vote » ne sera pas construit, sous aucune forme, même atténuée
par des réserves.** Mettre côte à côte ce qu'une personne a dit et ce qu'elle a voté n'est
pas une information : c'est une **accusation**, et le produit ne dispose d'aucun moyen de
la contextualiser (un texte change entre la promesse et le vote ; une promesse porte sur un
programme et un vote sur un article ; un vote « contre » peut viser un cavalier législatif).
Ce n'est pas de la prudence : c'est que la mise en regard produit un jugement que la donnée
ne soutient pas.

---

## M. DONNÉES DISPONIBLES

Le brief demande de chercher agressivement, mais de chercher **des réponses à des questions
citoyennes**, pas des jeux de données pour remplir des écrans. L'agent DATA a testé les
sources par appels réels. Trois limites d'outillage sont dites d'abord, parce qu'elles
qualifient tout le reste : `curl` est refusé par la politique de sortie du conteneur pour la
totalité des hôtes de données publiques françaises ; l'outil de lecture web disponible résume
avec un petit modèle et **n'est fiable que pour recopier, pas pour compter** (interrogé deux
fois sur le même fichier, il a répondu « 577 lignes » puis « 578 ») ; et deux hôtes sont
interdits par `robots.txt`. **Aucun dénombrement produit par cet outil n'est repris comme un
fait.**

### M.1 · Exploitable maintenant

| source | ce qui est vérifié | valeur citoyenne |
|---|---|---|
| **`liste_deputes_libre_office.csv`** (Assemblée) | 200 ; en-tête recopié : `identifiant, Prénom, Nom, Région, Département, Numéro de circonscription, Profession, Groupe politique (complet), Groupe politique (abrégé)` ; page datée 14/09/2026 ; CSV nu, sans archive | **le meilleur rapport valeur/coût du corpus** : il porte le département, la circonscription et le groupe, et évite de dépiler 14 Mo |
| **volet « par groupe » des scrutins** | noms de champs relevés dans un schéma engendré par notre chaîne : `positionMajoritaire`, `nombreMembresGroupe`, `decompteVoix` | **déjà téléchargé chaque matin, jamais lu.** Coût marginal nul. C'est le producteur qui prononce le verdict de groupe ; nous n'interprétons rien |
| **`Dossiers_Legislatifs.json.zip`** | 200 ; MD5 et horodatage du 15/09/2026 ; Licence ouverte explicite | sans lui, un scrutin solennel est un intitulé de procédure. **C'est la source qui permet « suivre un texte » (§K.3)** |
| **table commune → circonscription** (ministère de l'Intérieur) | **1 262 / 1 262 communes franciliennes couvertes**, 97 circonscriptions, 1 248 communes (98,89 %) à circonscription unique | le verrou du produit, et il tient — sous deux réserves, §M.4 |
| **dotations d'investissement (DGCL)** | LOv2 vérifiée ; `last_update 2026-07-24` ; clé INSEE native ; 3,2 Mo par année | déjà intégré ; confirmé bon |
| **élections agrégées via `tabular-api`** | totaux réels obtenus (838 bureaux en Seine-Saint-Denis, 70 102 en France) ; maille commune ; LOv2 | interrogeable ligne à ligne malgré un fichier source de 405 Mo |

### M.2 · Exploitable sous condition

- **Amendements** — condition : ne l'afficher que comme un acte de la personne, jamais comme
  un fait local. Aucun champ territorial. Champs non vérifiés : ne pas écrire l'ingestion
  avant qu'un schéma soit engendré sur le runner.
- **Questions écrites** — la **seule activité parlementaire qui a bougé pendant la
  suspension** (07/09/2026). Aucun champ territorial. La plus lourde archive du corpus.
- **Marchés publics consolidés (DECP)** — `last_update 2026-09-15`, LOv2, filtrable par
  commune. **Trois conditions** : filtrer sur les données actuelles et la catégorie
  « Commune » ; et **écrire que le consolidateur est un mainteneur unique privé dont le code
  est public** — la version officielle porte `[DEPRECIE]` dans son titre.
- **Base permanente des équipements (INSEE)** — condition unique et **bloquante en l'état** :
  **aucune licence n'est affichée sur la page INSEE**. Vérifié, pas supposé.
- **Liste HATVP des déclarants** — producteur, licence et date vérifiés, **contenu non lu**
  (le fichier revient en binaire). À faire relire par le runner. *Réserve de neutralité : une
  déclaration d'intérêts lue à côté d'un vote produit dans la tête du lecteur une
  qualification — « conflit d'intérêts » — que seul un juge peut porter. Refus d'affichage
  conjoint (§P).*
- **Répertoire national des associations** — condition : géocoder l'adresse du siège, faute de
  code INSEE. **C'est exactement « deviner un rattachement »**, sauf si le taux d'appariement
  est mesuré et affiché. 408 Mo par mois.

### M.3 · Mirages

- **Comptes rendus de séance** — XML seul, absent de data.gouv, documentation de structure
  datée de **2016**, index interdit aux robots, et une intervention est de la prose. **Hors
  règle du projet deux fois** : provenance non vérifiable et interprétation nécessaire.
- **Agenda de la séance publique** — trois colonnes, aucune colonne d'orateur, **fichier
  vide** au 15/09/2026.
- **Sénat** — diffusion principale en **dump PostgreSQL 8.4**, **aucun jeu « scrutins »
  visible sur le portail**, sénateurs élus au département. Seul point qui s'améliore : la
  licence est établie (Licence Ouverte 2.0), là où le catalogue la disait non vérifiée.
- **Recueils des actes administratifs des préfectures** — un **index de PDF** à la maille
  département, publié par un **particulier**, en ODbL, **12 préfectures manquantes**.
- **Délibérations de conseils municipaux** — **aucune source nationale ouverte n'existe.**
  C'est la donnée qui manque le plus au produit, et celle qu'aucun effort de collecte ne
  résoudra : elle n'est pas publiée.
- **Contours nationaux des circonscriptions** — trois recherches, aucun jeu national.

### M.4 · Deux défauts de provenance à corriger, dans un produit qui affiche ses sources

1. **Le lien de provenance de la table des circonscriptions renvoie 404.** `outils/circos.json`
   porte une URL data.gouv.fr qui ne répond plus sur aucune de ses trois formes. **Repère
   affiche donc aujourd'hui un lien brisé sur la donnée la plus structurante du produit.**
2. **La licence est écrite trop haut** : l'API dit Licence Ouverte **1.0** ; notre catalogue
   dit « 2.0 ».

Et le fait central, qu'il faut écrire à l'écran : **la seule table nationale officielle
commune → circonscription déclare une fréquence annuelle et n'a pas bougé depuis le 11 avril
2017 — neuf ans et cinq mois.** Le découpage lui-même date de 2010. La couverture
francilienne est parfaite, l'objet n'est donc pas faux, mais il est **figé, non maintenu, et
sans plan de succession**. La seule voie de sortie mesurée est une dérivation depuis les
résultats électoraux de 2024 par candidat, **à mener comme contrôle croisé d'abord,
substitution ensuite, jamais l'inverse.**

### M.5 · Les cinq sources à intégrer, dans l'ordre

1. **Le volet « par groupe » des scrutins** — déjà sur le disque, coût marginal nul.
2. **`liste_deputes_libre_office.csv`** — le fichier le plus léger du corpus, et il porte le
   groupe.
3. **Les dossiers législatifs** — la condition de « suivre un texte ».
4. **Les marchés publics consolidés** — la seule donnée d'argent à la maille commune, à jour
   du jour.
5. **La dérivation commune → circonscription depuis 2024** — pour sortir de la dépendance à un
   fichier de 2017.

**Et une source à ne pas chercher** : rien qui demande un traitement de langage. Le produit
s'est déjà interdit l'impact écrit par un modèle de langage et l'ingestion de flux de presse.
Les interventions en séance tombent sous le même refus, et il faut l'écrire explicitement
pour ne pas y revenir.

---

## N. LE GRAPHE REPÈRE

L'agent ENGINEERING a été interrompu par une limite de session avant de rendre son relevé.
Ce qui suit est mon propre arbitrage, avec les mesures faites ici ; les deux points qui
demandaient son travail sont nommés comme non mesurés.

### N.1 · Ce qui existe déjà, mesuré

Structure réelle d'une commune dans le paquet départemental :

```json
"93001": { "nom": "Aubervilliers",
           "maire": { "nom": "Sofienne KARROUMI", "fonction": "Maire" },
           "adjoints": 20,
           "circo": 6,
           "comptes": { "2021": [...13 valeurs], "2024": [...], "2025": [...] } }
```

Les arêtes déjà présentes : commune → maire, commune → nombre d'adjoints, commune →
circonscription (donc → député via `deputes.json`), commune → comptes. Poids : **11,7 Ko pour
les 39 communes de Seine-Saint-Denis**, 129 Ko pour les 505 communes de Seine-et-Marne, et le
plus lourd paquet de France est à 267 Ko (Aisne, 796 communes).

Les arêtes absentes : intercommunalité, département comme collectivité (et non comme
découpage), région, parti, compétence, décision, projet (`projets: null`), financement, et
tout historique.

### N.2 · Le graphe et l'architecture sans serveur sont-ils compatibles ?

Réponse franche : **partiellement, et la contrainte qui les sépare est un choix de vie
privée, pas une limite technique.**

Un graphe se parcourt. Repère sert des fichiers **par département** pour une raison précise :
le serveur ne doit jamais pouvoir apprendre quelle commune est lue. Toute arête qui sort du
département — commune → région, commune → un texte de loi, commune → un marché public —
oblige à l'un de ces trois choix :

| choix | conséquence |
|---|---|
| **dénormaliser dans le paquet départemental** | le paquet grossit ; la fraîcheur devient coûteuse (un maire qui change oblige à régénérer un paquet entier) ; mais **aucune fuite** |
| **un index national léger, chargé par tous** | pas de fuite si tout le monde charge le même fichier ; taille bornée par le fait que tout le monde le télécharge |
| **une requête par objet** (un texte, un élu) | **fuite immédiate** : l'adresse porte l'identifiant de l'objet, donc le serveur apprend ce que ce lecteur regarde |

**Le troisième choix est interdit** — c'est l'invariant 2, et c'est la promesse propre du
produit. Donc : **le graphe de Repère ne sera jamais un graphe parcourable côté client ; ce
sera un graphe pré-aplati à la compilation, servi en deux étages.**

```
ÉTAGE 1  socle national, chargé par tout le monde, identique pour tous
         — les 6 postes et leurs libellés, les sources, les explications,
           le catalogue des textes, les groupes parlementaires, les échelons
         cible : < 80 Ko, gelé entre deux collectes
ÉTAGE 2  un fichier par département, chargé pour le département du lecteur
         — communes, élus, comptes, circonscriptions, arêtes locales
         mesuré aujourd'hui : 11,7 à 267 Ko
```

Budget que je fixe, et qui doit devenir un contrôle exécutable : **socle + paquet
départemental ≤ 350 Ko**. Le plus gros paquet actuel est à 267 Ko ; il reste donc moins de
100 Ko pour tout ce que le graphe ajoutera au niveau départemental. C'est peu, et c'est la
vraie contrainte de conception : **chaque arête nouvelle se paie en kilo-octets sur le
téléphone de quelqu'un qui n'en lira qu'une.**

**Non mesuré, et c'est ce qui manquait à l'agent ENGINEERING** : (a) le poids réel d'un paquet
départemental portant les arêtes intercommunalité + marchés publics + textes suivis ; (b) le
temps de premier affichage sur un réseau mobile lent. Les deux doivent être mesurés avant
d'ajouter une seule arête.

### N.3 · L'avantage structurel n'est pas le graphe

Le brief dit du graphe qu'il « pourrait devenir notre avantage structurel ». Je ne le crois
pas, et il faut le dire : **un graphe de données publiques françaises n'est pas défendable**
— les sources sont ouvertes, quiconque peut les joindre, et plusieurs acteurs le font déjà
mieux et plus complètement.

L'avantage structurel de Repère est ailleurs, et il est rare : **c'est le seul produit qui
peut montrer ces données sans apprendre qui les regarde.** Aucun concurrent financé par la
publicité ou par un modèle de compte ne peut copier cela sans renoncer à son modèle. Le
graphe est un moyen ; la maille départementale et l'absence de compte sont l'avantage.

---

## O. PROVENANCE

C'est le pilier le mieux tenu du produit, et il n'a besoin que de corrections.

**La règle reste celle du brief, et elle est déjà appliquée** : aucun chiffre sans producteur,
licence, date et lien ; un calcul dérivé annoncé comme un calcul ; « nous ne savons pas
encore » est une réponse acceptable.

Ce que ce document ajoute, et qui vient des mesures :

1. **Un zéro n'est pas une donnée.** §G.3. La provenance ne protège de rien si la valeur elle-même
   est un artefact. Il manquait un contrôle de vraisemblance de population : il est spécifié.
2. **Une régénération n'est pas une vérification.** §K.4. Un horodatage de génération dit quand
   le fichier a été écrit, pas quand son contenu a été mis à jour. Le contrôle de cohérence
   inter-sources (personne à la fois maire et député) est la seule preuve gratuite disponible.
3. **Un lien de provenance doit être testé.** §M.4. Le produit affiche aujourd'hui un lien 404
   sur sa donnée la plus structurante. Contrôle à écrire : chaque URL de provenance affichée
   est appelée par la chaîne, et un code non 200 fait échouer la publication.
4. **La fraîcheur doit être calculée au rendu, avec un seuil par source.** Le cache local
   n'expire jamais, la fonction de purge n'est jamais appelée, le cache est lu avant le
   réseau, et **aucun des 134 contrôles ne compare une date à un seuil**. Un testeur de
   décembre verrait indéfiniment des données du 26 août. Spécification :

```
Trois états, trois phrases distinctes, calculées au rendu (jamais à l'écriture) :
  À JOUR      → la date de publication s'affiche, sans mention d'âge
  ANCIEN      → « Publié le <date>. La source n'a rien publié depuis. »
  TROP ANCIEN → « Ces chiffres datent du <date>. Nous n'avons pas réussi à les
                 rafraîchir depuis <n> jours. Voir la source ↗ »
Seuils PAR SOURCE, parce qu'une donnée annuelle n'est pas périmée en 24 h :
  élus (RNE, mensuel)          : ancien 45 j,  trop ancien 120 j
  comptes (OFGL, annuel)       : ancien 400 j, trop ancien 550 j
  scrutins (AN, quotidien)     : ancien 30 j,  trop ancien 90 j
  circonscriptions (2017, figé): jamais « ancien » — porte sa phrase propre
Contrôle exécutable : la publication échoue si une source dépasse son seuil
« trop ancien » sans que la phrase correspondante soit présente à l'écran.
```

   *Note : au 15/09/2026, les scrutins sont à 56 jours, donc « anciens ». La phrase
   correcte est « l'Assemblée n'a pas tenu de scrutin public depuis le 21 juillet 2026 » —
   ce qui est un fait sur l'institution, pas un défaut du produit, et c'est précisément
   pourquoi le seuil doit produire une phrase et non un avertissement.*

5. **La provenance doit être dite en langue citoyenne.** « Répertoire national des élus » ne
   dit rien ; « le fichier des élus tenu par le ministère de l'Intérieur » dit tout. Et
   l'étiquette `DONNÉE OFFICIELLE` doit disparaître : elle apparaît deux à trois fois par
   écran, elle repousse le nom du maire sous la ligne de flottaison, et **elle ne distingue
   rien** puisque 100 % des données affichées sont officielles. Seule reste l'étiquette de
   l'exception, renommée `NOTRE CALCUL — PAS UN CHIFFRE PUBLIÉ`.

---

## P. NEUTRALITÉ POLITIQUE

### P.1 · Le principe opérationnel

« DONNER UNE INFORMATION ≠ DIRE QUOI PENSER » est juste, et insuffisant comme règle de
travail, parce qu'un produit dit quoi penser **sans écrire aucune opinion**. Quatre canaux,
tous mesurés dans les écrans réels :

1. **le choix de ce qui est affiché** — sélectionner un texte parmi 8 434 est une position ;
2. **l'ordre de lecture** — ce qui est en haut est ce qui compte ;
3. **la mise en regard** — deux faits côte à côte produisent une conclusion que ni l'un ni
   l'autre ne porte ;
4. **la forme de la donnée publiée** — une suite de positions par personne est un taux de
   présence en attente d'être calculé (§K.1).

Le produit garde le canal 1 par une règle de sélection, et ne garde ni 2, ni 3, ni 4. Les
trois manquent.

### P.2 · La règle de sélection des textes

Cinq règles ont été examinées ; quatre échouent.

- **« les N derniers scrutins publics »** *(règle actuelle)* — indéfendable : la fenêtre fait
  **quatre jours sur trois ans** (les 80 scrutins retenus vont du 16 au 21 juillet 2026, sur
  8 434 publiés). « Pourquoi ces textes ? » — « parce qu'ils sont les derniers arrivés » n'est
  pas une réponse.
- **« tous les scrutins solennels »** — défendable, mais **un vote solennel n'est pas un vote
  plus important : c'est un vote mis en scène**, décidé par un organe politique (la Conférence
  des présidents). Retenir les solennels, c'est retenir les votes que les groupes ont voulu
  rendre visibles. Repère amplifierait une mise en scène en croyant filtrer du bruit.
- **« les textes définitivement adoptés »** — exclut par construction tout ce qui a été rejeté.
- **« les scrutins qui concernent la commune du lecteur »** — classer un texte comme
  « concernant » une commune est une décision éditoriale thématique. À ne pas rouvrir.
- **« tout scrutin portant sur l'ensemble d'un texte »** — critère **textuel et mécanique**
  (l'intitulé officiel commence par « l'ensemble de la / du »), exhaustif, inclut les textes
  **rejetés**, ne dépend d'aucun organe, reproductible par un tiers, et le code sait déjà
  reconnaître l'amorce. **Mesuré : sur les 80 scrutins servis, cette règle sélectionne
  exactement les 8 solennels.**

**Arbitrage : la dernière règle, avec une phrase de portée affichée à côté de chaque liste**,
et un contrôle qui échoue bruyamment si le taux de textes reconnus s'effondre — jamais un
retour silencieux à zéro.

> « Repère retient tous les scrutins publics portant sur l'ensemble d'un texte, du début de
> la 17ᵉ législature au 21 juillet 2026 : 8 sur 8 434 scrutins publiés. Les autres sont des
> amendements, des articles et des motions ; ils construisent un texte ligne à ligne et
> restent accessibles sur le site de l'Assemblée. »

**Et le vote nominatif sort du fil communal.** Un vote de l'Assemblée est un fait **national**
affiché sous un titre **communal** (« Ce qui a été décidé pour Bagnolet »), ce qui fait porter
à la commune une décision qui n'est pas la sienne et au député la responsabilité d'un écran
qui serait sinon vide. Tant que le vote est dans le fil communal, **la sélection du texte est
aussi la sélection de ce que la commune a « eu »**.

### P.3 · Formulations, mot pour mot

**Acceptables** — chacune nomme un seul objet, un seul scrutin, et met le collectif avant
l'individuel :

> « Bastien Lachaud a voté contre. Texte adopté le 21 juillet 2026 · version mise au point
> entre l'Assemblée et le Sénat · 279 pour, 81 contre, 66 abstentions. »
>
> « Sur ce texte, 426 députés ont pris part au scrutin, sur 577 sièges. »
>
> « Ce texte a été adopté en premier passage devant l'Assemblée. Il continue son parcours au
> Sénat : ce n'est pas encore une loi. »
>
> « Un vote nominatif n'existe que si quelqu'un a demandé un scrutin public. La plupart des
> décisions de l'Assemblée sont prises à main levée et ne laissent aucune trace par député.
> Ce que vous lisez ici n'est donc pas l'ensemble des votes de votre député, et son absence
> d'une liste ne veut rien dire. »

Cette dernière phrase **manque aujourd'hui**, et c'est la plus importante du chantier.

**À refuser, quelle que soit la note qui les accompagne** — une note ne répare pas un titre,
le lecteur lit le gras :

> ✗ « Votre député a voté contre 5 des 8 textes. » — un compte, donc un score.
> ✗ « 3 abstentions, 1 position non portée. » — un compte d'absence.
> ✗ « Taux de conformité au groupe : 87 %. » — un score, et une norme inventée.
> ✗ « Les groupes favorables au texte · Les groupes opposés au texte » — une répartition sur
>   un axe moral.
> ✗ « Position du parti X : contre. » — aucune source ne l'atteste.
> ✗ « Comparer avec un autre élu / un autre parti » — un bouton qui produit une grille **est**
>   une grille.
> ✗ « Les députés de votre département et la protection des enfants » — grille personne × texte.
> ✗ « Plutôt favorable aux questions d'environnement » — une synthèse, donc un jugement.
> ✗ « Ce qu'il avait promis · ce qu'il a voté » — une accusation (§L.4).
> ✗ « Il n'a pas participé à ce vote. » — une affirmation de présence, et fausse dans 17 % des
>   cas mesurés.

### P.4 · Les cinq captures d'écran les plus dangereuses

Le produit doit être conçu contre son usage le plus probable. Les cinq captures qu'il ne doit
pas pouvoir fabriquer :

1. **« Zéro position sur les lois de juillet »** — un compteur d'absences, fabricable
   aujourd'hui à partir de notre donnée (§K.1), et faux.
2. **La grille « les députés de chez vous et le texte X »** — fabriquée involontairement à
   Paris, dont les 18 circonscriptions donnent 18 noms sur un même écran.
3. **Le comparateur de partis** — s'il est construit. Il ne le sera pas (§L).
4. **« Ce qu'il avait promis · ce qu'il a voté »** — refusé (§L.4).
5. **« Aubervilliers obtient, Bagnolet n'obtient rien »** — fabriquée par deux habitants de
   communes voisines qui posent leurs deux téléphones côte à côte. **Le produit n'offre aucune
   comparaison entre territoires et la comparaison a lieu quand même.**

Ce que les cinq ont en commun : **aucune ne demande une fonctionnalité de comparaison.**
Quatre sur cinq naissent d'un écran correct, lu par quelqu'un qui cherche une munition.

### P.5 · La comparaison entre voisins : inévitable, donc à désarmer par écrit

Elle n'est pas évitable, et ce n'est pas la bonne question. La bonne question est : **quand
elle a lieu, est-elle fausse ?** Aujourd'hui oui, pour trois raisons mesurables :

- les budgets annexes (eau, assainissement) sont **exclus** : deux communes qui ont fait des
  choix différents d'organisation ne sont pas comparables sur le budget principal ;
- les compétences transférées à l'intercommunalité diffèrent d'un territoire à l'autre : la
  même dépense apparaît chez l'une et pas chez l'autre ;
- les exercices publiés ne sont pas toujours les mêmes d'une commune à l'autre (4 communes
  franciliennes n'ont pas d'exercice 2025).

Donc la phrase à écrire n'est pas une interdiction — « ne comparez pas » n'a jamais empêché
personne — mais une **raison** :

> « Ces chiffres ne se comparent pas d'une commune à l'autre : chacune n'a pas les mêmes
> compétences (certaines les ont transférées à l'intercommunalité), et les budgets annexes —
> eau, assainissement — ne sont pas comptés ici. Deux communes voisines peuvent afficher des
> montants très différents pour le même service rendu. »

C'est la règle générale, et elle vaut au-delà des comptes : **une phrase de raison remplace
une phrase d'interdiction, partout.** Un produit qui dit « nous ne faisons pas ceci » sans
dire pourquoi apprend au lecteur à le faire lui-même.

### P.6 · Expliquer gauche / droite / centre — la demande la plus risquée du brief

Le brief demande que Repère « puisse expliquer gauche, droite, centre, écologistes,
socialistes, libéraux, conservateurs, souverainistes, etc. sans devenir lui-même militant ».

**Verdict : non, et pas pour décembre — sans doute jamais sous cette forme.** Trois raisons :

1. **Aucune source officielle ne définit ces termes.** Toute définition serait écrite par
   Repère, donc une position éditoriale sur l'objet le plus disputé du pays.
2. **Une liste de familles politiques est un ordre**, et aucun ordre n'est neutre (§L.2).
3. **Le rattachement d'un parti à une famille est contesté par les partis eux-mêmes.**

Ce qui est possible à la place, et qui répond au vrai besoin : **expliquer les objets
institutionnels, pas les familles idéologiques.** Ce qu'est un groupe parlementaire, ce qu'est
la majorité, ce qu'est l'opposition, ce qu'est un non-inscrit. Ce sont des faits de droit
parlementaire, définis par le règlement de l'Assemblée, vérifiables, et ils suffisent à ce
qu'un lecteur comprenne ce qu'il lit.

---

## Q. ACCESSIBILITÉ

Le brief demande : compréhensible sans connaissances politiques, sans vocabulaire spécialisé,
avec une connexion lente, sur petit écran, avec des capacités numériques limitées.

État réel, mesuré :

| exigence | état | ce qui manque |
|---|---|---|
| sans connaissances politiques | **échec partiel** : 6 expressions opaques déjà à l'écran | le dictionnaire de §F |
| sans vocabulaire spécialisé | **échec** : « exercice », « mandat ouvert », « engagé », « échelon », « position non portée », « runtime », « statique » | les remplacements de §Q.1 |
| connexion lente | **tenu** : 11,7 à 267 Ko par département, hors ligne après la première visite | un budget de poids qui devient un contrôle (§N.2) |
| petit écran | **échec mesuré** : le premier chiffre propre à la commune arrive à 768–806 px ; 41 % du premier écran est vide ; une étiquette passe seule sur sa ligne sous 480 px et repousse le nom du maire sous la ligne de flottaison | §I.2 |
| capacités numériques limitées | **échec** : la deuxième visite n'a pas d'écran d'entrée ; la liste de 1 262 communes se reparcourt entièrement | l'alphabet déplié au retour |

### Q.1 · Les mots à changer, mot pour mot

Les plus coûteux, relevés dans les captures réelles :

| aujourd'hui | à la place |
|---|---|
| `Voir les 104 départements publiés` | `Je ne trouve pas ma commune — chercher par département` |
| `Département 93 · Seine-Saint-Denis — changer` | `Seine-Saint-Denis (93) — changer de département` |
| `Tapez les premières lettres — Ustaritz, Bayonne…` | `Tapez trois lettres — Bagnolet, Bobigny…` *(les exemples doivent venir du département affiché : défaut réel)* |
| `39 communes dans ce département.` | `39 communes ici. Tapez trois lettres, ou choisissez une première lettre.` |
| `Sources` *(onglet)* | `D'où ça vient` |
| `Où va l'argent` *(onglet)* | `L'argent de <commune>` |
| `Les comptes de la commune · exercice 2025 · budget principal` | `L'argent d'Aubervilliers en 2025 · 89 662 habitants · budget principal (les budgets annexes — eau, assainissement — ne sont pas comptés ici)` |
| `Siège à l'Assemblée nationale` | `Le député élu ici` |
| `Mandat ouvert depuis le 30 juin 2024, 17e législature.` | `Élu le 30 juin 2024, pour la législature en cours.` |
| `Répertoire national des élus` | `le fichier des élus tenu par le ministère de l'Intérieur` |
| `texte de la commission mixte paritaire` | `version mise au point entre l'Assemblée et le Sénat` |
| `première lecture` | `premier passage devant l'Assemblée` |
| `L'État a engagé 533 466 €` | `L'État a mis 533 466 €` + note : `« Engagé » est le mot du fichier : l'argent est réservé pour ce chantier, il n'est pas forcément déjà versé.` |
| `Trois échelons que Repère ne publie pas encore` | `Trois autres qui décident chez vous, et que nous ne pouvons pas encore nommer` |
| `Non renseigné pour l'exercice 2025.` | `L'Observatoire n'a rien publié sur cette ligne pour 2025. Ce n'est pas un montant nul : c'est une ligne absente.` |
| `Position non portée` | `Le relevé de l'Assemblée ne dit pas comment il s'est prononcé` — **et la ligne ne s'affiche plus** (§K.2) |

### Q.2 · « Votre » n'est pas « chez nous »

Les huit personnes de l'étude n'ont pas dit « ça ne parle pas de chez vous ». Elles ont dit
**« chez nous »**. « Votre commune » est le registre d'un guichet qui s'adresse à un usager :
il maintient exactement la distance que le produit veut abolir.

**Arbitrage : le nom du lieu remplace le possessif partout où il est connu.** « L'argent de
Bagnolet », pas « les comptes de votre commune ». « Le député élu ici », pas « votre
député ». Le possessif ne subsiste qu'à un seul endroit, l'écran d'entrée, avant que le lieu
soit connu — et il y est juste.

### Q.3 · Ce qui doit être supprimé

1. **Tout le vocabulaire d'atelier** : « Cinq kilo-octets, une seule fois », « Le code de cet
   écran est téléchargé à la demande », et les huit lignes de type `Gardé par : runtime:
   service worker installé, réseau coupé` — sur l'écran dont le seul métier est la confiance.
   Les mots `runtime` et `statique` ne sont même pas français. **Les huit règles restent** :
   ce sont elles qui ont produit le seul « ah » observé. Une seule phrase les remplace :
   *« Chacune de ces huit règles est vérifiée automatiquement avant chaque publication. Si
   l'une est enfreinte, la publication échoue — ce n'est pas une intention, c'est un
   blocage. »*
2. **La carte « Qui d'autre décide pour vous » en pleine page** — 33 % de l'écran par défaut,
   zéro donnée, texte identique dans les 1 262 communes. Son contenu est juste et reste
   (P3 l'exige) : il passe derrière une ligne repliée. **Ce qu'on supprime, ce n'est pas le
   savoir, c'est sa place.**
3. **L'étiquette `DONNÉE OFFICIELLE`** (§O.5).

---

## R. VIE PRIVÉE

Rien à changer, et c'est le seul chapitre du document dans ce cas. **La vie privée n'est pas
une contrainte du produit : c'est son avantage** (§N.3).

L'état réel :

- **une seule clé de stockage local nommée**, qui contient le département choisi ;
- aucun compte, aucun courriel, aucun cookie, aucun traceur ;
- **aucune adresse réseau ne porte un code de commune** : le serveur reçoit une demande pour
  « le département 93 » et ne peut pas savoir si le lecteur habite Aubervilliers ou Bagnolet.
  C'est gardé par un contrôle exécutable qui rejette toute URL portant un code INSEE ou un
  paramètre `insee=` / `commune=` ;
- la géolocalisation est refusée, et pour la deuxième et dernière fois (§I.2).

Trois demandes du brief sont refusées ici, et c'est la même raison chaque fois :

| demande | refus |
|---|---|
| « centres d'intérêt facultatifs » | une seconde clé, donc un profil de lecteur. Et un centre d'intérêt politique stocké sur l'appareil est la donnée la plus sensible qu'un produit civique puisse détenir |
| « suivi personnalisé » | idem |
| « apprentissage progressif » | §J.1 |

**Et la plus belle phrase du produit remonte au-dessus du champ de saisie** — aujourd'hui elle
est en dessous, donc sous le clavier, donc invisible au moment précis où elle sert :

> « Repère ne demande jamais votre adresse. Le nom de votre commune suffit, et il ne quitte
> pas cet appareil. »

Une dernière chose manque, et elle est juridique autant que morale : **un ours.** Un éditeur
nommé, un responsable de publication, et un moyen de signaler une erreur. Un produit qui
publie des données nominatives sur des personnes publiques et qui n'a pas d'ours n'est pas
prêt pour une bêta publique.

---

## S. MÉCANISMES DE RETOUR

### S.1 · La contrainte, dite franchement

Le produit n'a **aucune mémoire du lecteur** et **aucune notification**. Les neuf mécanismes
proposés par le brief se répartissent en trois classes :

| mécanisme du brief | verdict |
|---|---|
| nouveaux événements locaux | **impossible** — 0 % de couverture (§G.1) |
| nouveaux votes | **possible mais inerte** — dernier vote il y a 56 jours |
| évolution des finances | **possible, une fois par an** — l'OFGL publie annuellement |
| décisions | **impossible** — 0 % |
| changements chez les élus | **possible** — le RNE est mensuel, et un maire qui change est un vrai événement |
| échéances | **sous condition** d'une source officielle vérifiable |
| nouvelles lois | **possible**, mais national |
| suivi personnalisé | **refusé** — §R |
| apprentissage progressif | **refusé** — §J.1 |

### S.2 · La réponse honnête aux trois questions

**« Existe-t-il une raison honnête de revenir demain ? »** — **Non.** Aucune source du produit
ne publie quotidiennement quelque chose qui concerne une commune. Prétendre le contraire, par
un badge ou un fil, serait fabriquer un mouvement qui n'existe pas. **Il faut renoncer au
retour quotidien, et l'assumer.**

**« Dans un mois ? »** — **Oui, une fois** : le fichier des élus est mensuel. Un maire, un
adjoint, un député qui change est un événement réel, local, vérifiable, et c'est le seul du
produit.

**« Dans trois mois ? »** — **Oui, et c'est le bon rythme.** Le produit est un **produit de
consultation ponctuelle**, pas un produit d'habitude. On l'ouvre quand on a une question :
« qui est mon maire », « la ville a-t-elle des dettes », « qui est le député d'ici », « est-ce
que ce chiffre que j'ai lu est vrai ». C'est un usage rare et important, comme un service
public — pas comme un réseau social.

**Arbitrage, et il contredit le brief : Repère ne cherchera pas le retour quotidien.** Le
brief dit « Repère doit avoir une raison de revenir » et « le retour doit venir de la
valeur ». La seconde phrase est juste et elle contredit la première : la valeur de ce produit
est d'être **juste quand on en a besoin**, pas d'être ouvert tous les jours. Un produit
civique qui optimise la fréquence de retour finit par fabriquer de l'indignation, parce que
c'est la seule chose qui fait revenir tous les jours. **Nous n'irons pas là.**

La métrique de retour est donc à changer : non pas « revient demain » mais **« revient quand
il a une question, et trouve la réponse »** (§X).

### S.3 · Les deux mécanismes retenus

1. **L'écran d'entrée du retour.** Le vrai problème du retour n'est pas la motivation, c'est
   que la deuxième visite n'a **pas d'écran d'entrée** : le lecteur reparcourt la liste de
   1 262 communes. Correctif : au retour, le département est connu (unique clé), **l'alphabet
   est déplié par défaut**, et une lettre rend 1 à 6 communes. Coût : nul. C'est la
   correction de retour la plus efficace du produit, et elle n'ajoute aucune donnée.
2. **Le changement de titulaire d'une fonction.** « Le maire de votre commune a changé depuis
   votre dernière visite » est impossible (pas de mémoire). Mais « Maire depuis le 30 mars
   2026 » est un fait daté, affiché toujours, qui produit le même effet sans rien retenir :
   le lecteur voit lui-même que c'est récent.

---

## T. FEATURES CANDIDATES

Format du brief : QUESTION CITOYENNE → VALEUR → DONNÉE → SOURCE → UX → COMPLEXITÉ → RISQUE →
FRÉQUENCE → RAISON DE REVENIR.

| # | question citoyenne | donnée | complexité | risque | classement |
|---|---|---|---|---|---|
| 1 | *Ma commune s'est-elle endettée ?* | comptes, 100 % de couverture, **après correction §G.3** | faible (la donnée est déjà servie) | moyen : la phrase est instrumentalisable si un pourcentage apparaît | **P0** |
| 2 | *Que veut dire ce mot ?* | aucune donnée nouvelle | faible | nul | **P0** |
| 3 | *Ces chiffres sont-ils à jour ?* | dates déjà présentes ; calcul au rendu | faible | nul, et ferme un risque majeur | **P0** |
| 4 | *Qui décide chez moi ?* | RNE, 100 % | **existe déjà** | faible | **P0 — corriger, pas construire** |
| 5 | *Ce chiffre est-il vrai ?* | provenance, déjà là | faible ; corriger un lien 404 | nul | **P0** |
| 6 | *Comment signaler une erreur ? qui édite ce produit ?* | aucune | faible | **ne pas l'avoir est le risque** | **P0** |
| 7 | *Où en est ce texte de loi ?* | dossiers législatifs (§M.1) | moyenne | faible : l'objet est un texte, pas une personne | **P1** |
| 8 | *Comment l'Assemblée s'est-elle prononcée sur ce texte ?* | scrutins, volet collectif | faible | faible si le décompte précède la position | **P1** |
| 9 | *Quel est le groupe du député élu ici ?* | `liste_deputes…csv` (§M.1) | faible | moyen : exige la phrase « un groupe n'est pas un parti » | **P1** |
| 10 | *Quels marchés publics ma commune a-t-elle passés ?* | DECP consolidées | **élevée** (247 Mo à filtrer, mainteneur unique privé) | moyen | **P2** |
| 11 | *Quelles aides l'État a-t-il versées ici ?* | dotations DGCL, déjà intégré | faible | faible | **P1 — restaurer** |
| 12 | *Comment a voté ma commune aux dernières élections ?* | élections agrégées, maille commune | moyenne | **élevé** : un résultat électoral par commune est la donnée la plus instrumentalisable du corpus | **P2, sous étude** |
| 13 | *Qui décide de quoi entre commune, département et région ?* | aucune donnée ; c'est de l'écriture | faible | nul | **P1** |
| 14 | *Quelles sont les prochaines échéances électorales ?* | à vérifier | faible | nul | **P2** |
| 15 | *Comment mon député a-t-il voté sur ce texte ?* | scrutins, **après correction §K.1** | moyenne | **élevé** | **P1, conditionné à P0** |

**Les six P0 ne sont pas six fonctionnalités : cinq sur six sont des corrections.** C'est le
point le plus important de cette section. Le produit n'a pas besoin de nouvelles
fonctionnalités pour décembre ; il a besoin que ce qu'il affiche déjà soit vrai, daté,
lisible et attribuable.

---

## U. FEATURES REJETÉES

| feature | raison du rejet |
|---|---|
| **Comparateur de positions des partis** | l'objet source n'existe pas ; aucun ordre d'affichage n'est défendable ; usage le plus probable = capture militante. **Ne mérite pas d'être construite** (§L) |
| **Taux de présence / d'absence d'un élu** | invariant 8 ; et la donnée serait fausse — médiane de 65 positions non portées sur 80 pour des raisons qui n'ont rien à voir avec l'absence (§K.1) |
| **Décalage promesse / vote** | une accusation, pas une information (§L.4) |
| **Tout compte ou taux portant sur une personne** | « 5 votes contre sur 8 », « 87 % de conformité au groupe » : invariant 3 |
| **Toute grille personne × texte**, tout bouton « comparer » | un bouton qui produit une grille est une grille (§P.3) |
| **Comparaison entre communes** | invariant 3 ; et elle serait fausse pour trois raisons mesurables (§P.5) |
| **Séries de consultation, points, badges, objectifs personnels** | invariant 6, et absence de mémoire. « La démocratie n'est pas un jeu » (§J) |
| **« Vous avez découvert 3 institutions aujourd'hui »** | compte le lecteur : c'est un score porté sur la personne qui lit |
| **Interventions en séance** | source en XML seul, doc de structure de 2016, et une intervention est de la prose : la résumer est une interprétation (§M.3) |
| **Déclarations d'intérêts affichées à côté d'un vote** | produit dans la tête du lecteur une qualification — « conflit d'intérêts » — que seul un juge peut porter |
| **Géolocalisation** | son coût est la substance de l'invariant 2. Deuxième et dernier refus (§I.2) |
| **Onglet « MOI »** | une seule préférence existe, et elle est déjà dans l'en-tête |
| **Onglet « EXPLORER » (France / institutions / partis)** | c'est l'onglet qui fabrique les deux comparaisons interdites |
| **Fil d'actualité locale** | 0 % de couverture sur trois de ses cinq entrées ; un fil suppose un flux, le produit a des états (§I.4) |
| **Définir gauche / droite / centre** | aucune source officielle ne les définit ; toute définition serait une position éditoriale (§P.6) |
| **Impact d'une loi sur votre commune** | déjà refusé une fois (« impact écrit par un modèle de langage ») ; refus étendu à toute qualification thématique d'un texte |
| **Notifications** | aucune source ne publie quotidiennement quelque chose de local ; une notification fabriquerait un mouvement inexistant |

**Une feature excellente techniquement mais faible produit doit être supprimée plutôt que
conservée parce qu'elle a demandé du travail.** Deux candidats dans le produit actuel : les 72
votes de détail (amendements, motions, articles) — techniquement irréprochables, sans valeur
citoyenne, et ils portent 90 % du poids du corpus ; et la carte des échelons non publiés,
dont la place est le premier contributeur mesuré au verdict « ça parle de la France ». La
première est reléguée derrière un pli, la seconde aussi. Aucune n'est supprimée du savoir ;
les deux sont supprimées de la place.

---

## V. ROADMAP — P0 / P1 / P2

### V.1 · P0 — rien de tout cela n'est une fonctionnalité

Dans l'ordre de dépendance, pas d'importance : chaque ligne bloque celles d'après.

| # | chantier | preuve que c'est nécessaire |
|---|---|---|
| **P0-1** | **Le zéro n'est plus une donnée.** `null` quand la source ne porte pas la ligne ; contrôle qui échoue si un poste est nul pour > 95 % d'un paquet | 34 868 / 34 868 communes à « zéro frais de personnel » en 2021 (§G.3) |
| **P0-2** | **Les positions ne sont plus indexées par personne.** Index par scrutin ; publier 8 scrutins et non 80 ; retirer la ligne des positions non portées | un taux de présence de 19 % calculable en une ligne sur nos fichiers (§K.1) |
| **P0-3** | **Un seul chemin de publication.** `netlify.toml` sur la branche principale ; `site/index.html` (gel du 19 août, données du 29 juin) hors du chemin ; **un contrôle qui compare ce qui est en ligne à ce qui est construit et échoue s'ils diffèrent** | trois chemins pour une URL ; le public voit un produit que nous ne construisons plus |
| **P0-4** | **La fraîcheur calculée au rendu**, trois états, trois phrases, seuils par source ; purge du cache appelée ; réseau avant cache quand le réseau est là | aucun des 134 contrôles ne compare une date à un seuil ; un testeur de décembre verrait le 26 août indéfiniment (§O.4) |
| **P0-5** | **Réparer la collecte quotidienne** — morte depuis le 26 août 2026, 19 exécutions rouges consécutives ; et cesser de dégrader chaque collecteur en avertissement | sans elle, tout le reste sert des données mortes |
| **P0-6** | **L'écran d'aha moment** : la phrase de §G.5, le « ce que cette phrase ne veut pas dire », la provenance en langue citoyenne, et la règle R-AHA inscrite dans les décisions | le seul « ah » observé portait sur un écran sans données |
| **P0-7** | **L'ours** : éditeur, responsable de publication, « signaler une erreur » | le produit publie des données nominatives sans éditeur nommé |
| **P0-8** | **Le contrôle de cohérence inter-sources** : personne à la fois maire et député | au moins un cas en Île-de-France, affiché aujourd'hui (§K.4) |
| **P0-9** | **Le lien de provenance testé** ; corriger le 404 et la licence de la table des circonscriptions | le produit affiche un lien mort sur sa donnée la plus structurante (§M.4) |
| **P0-10** | **Les corrections de langue** de §Q.1, et les trois suppressions de §Q.3 | 6 % de la page varie d'une commune à l'autre (§B) |

**Les quatre communes manquantes** — 77021, 77253, 92077, 94075, absentes de tous les paquets
alors que le code officiel géographique en donne 1 266 pour l'Île-de-France quand le produit
en connaît 1 262 — sont à réintégrer dans P0-5. Un habitant de ces quatre communes ne trouve
pas son nom dans la liste.

### V.2 · P1 — après décembre, et seulement si les P0 tiennent

- le dictionnaire complet (12 entrées + les 3 de §F.3 + les 6 expressions opaques) ;
- « suivre un texte » : les dossiers législatifs, l'état dans la navette, le décompte collectif ;
- le groupe parlementaire du député élu ici, avec sa phrase obligatoire ;
- la restauration des projets financés par l'État, avec une source vérifiée ;
- « qui décide de quoi » entre commune, intercommunalité, département, région ;
- le vote nominatif, sous les six conditions de §K.3, **et seulement après P0-2**.

### V.3 · P2 — à étudier, pas à planifier

Marchés publics ; résultats électoraux par commune (sous étude de risque) ; échéances
électorales ; dérivation commune → circonscription depuis 2024 ; extension hors
Île-de-France.

### V.4 · Ce qui manque à cette feuille de route

**Les deux relevés interrompus.** L'agent ENGINEERING devait mesurer le poids réel d'un
paquet départemental portant les arêtes nouvelles et le temps de premier affichage sur réseau
lent ; l'agent PRODUCT devait chiffrer les six promesses contre la couverture. Les deux
manques sont bornés et nommés : §N.2 (deux mesures) et §D (les six promesses ont été évaluées
ici, mais sans le contre-regard demandé).

---

## W. PARCOURS BÊTA

Les cinq parcours du brief, testés contre la donnée réelle.

| # | parcours | verdict | preuve |
|---|---|---|---|
| 1 | *Je découvre ce qui se passe chez moi* | **FAISABLE DÉGRADÉ** — et seulement après P0-1. « Ce qui se passe » n'existe pas ; « ce qui a changé » existe à 100 % | §G.1, §G.3 |
| 2 | *Je comprends qui décide* | **FAISABLE** — maire 1 262/1 262, adjoints 99,2 %, circonscription 100 %. C'est le parcours le plus solide du produit | mesuré ici |
| 3 | *Je découvre ce qui a été décidé* | **INFAISABLE au sens local** : 0 % de délibérations, 0 % de projets. Faisable au sens national, mais c'est le parcours qui produit « ça parle de la France » | §G.1, §I.4 |
| 4 | *Je comprends ce que fait mon élu* | **INFAISABLE tel quel**, et dangereux : au sens local, 0 % ; au sens parlementaire, la donnée enfreint l'invariant 8 par sa forme | §K.1, §K.2 |
| 5 | *J'apprends sans avoir l'impression de suivre un cours* | **FAISABLE** — coût nul en donnée, et c'est le meilleur rapport valeur/risque du produit | §F |

**Deux des cinq parcours du brief sont infaisables, et ce sont les deux qui portent la
promesse politique du produit.** Il faut le dire avant décembre, pas pendant.

### W.1 · Les cinq parcours que je recommande à la place

Chacun est faisable avec la donnée servie aujourd'hui, après les P0.

1. **« Ma commune s'est-elle endettée ? »** — l'écran d'aha moment. Deux montants datés, la
   différence en euros, ce que ça ne veut pas dire, la source. Couverture 100 %.
2. **« Qui décide ici ? »** — maire, adjoints, conseil, député élu ici, et les trois échelons
   que nous ne savons pas encore nommer, énoncés comme une absence et non comme un vide.
   Couverture 100 %.
3. **« Que veut dire ce mot ? »** — le dictionnaire au fil du texte, 40 mots, formulation
   gelée, aucune question posée au lecteur. Couverture : tous les écrans.
4. **« Est-ce que ce chiffre est vrai, et de quand date-t-il ? »** — la provenance en langue
   citoyenne, les trois états de fraîcheur, le lien qui marche. C'est le parcours que Repère
   sert mieux que quiconque.
5. **« Où en est cette loi, et comment l'Assemblée s'est-elle prononcée ? »** — l'objet est le
   texte, jamais la personne ; le décompte collectif avant toute position individuelle. P1,
   mais c'est le cinquième parcours vers lequel il faut aller.

**Ce que ces cinq ont en commun et que les cinq du brief n'avaient pas : aucun ne promet un
événement, aucun ne suit une personne, et tous les cinq sont vrais.**

---

## X. MÉTRIQUES

Contrainte : aucune mesure ne doit identifier un lecteur, ni apprendre au serveur quelle
commune est lue. Donc **aucune mesure d'usage n'est collectée**. Ce qui est mesurable est
d'un autre genre, et ce genre est plus honnête.

### X.1 · Mesures sur le produit, automatiques, sans lecteur

| mesure | aujourd'hui | cible décembre |
|---|---|---|
| hauteur entre le haut de l'écran et le premier chiffre propre à la commune | **768–806 px** | **< 250 px** |
| part de la hauteur de page qui varie d'une commune à l'autre | **< 6 %** | **> 40 %** |
| part du texte identique entre deux écrans datés de communes différentes | **55,5 %** | **< 25 %** |
| postes dont la valeur est nulle pour > 95 % d'un paquet | **1** (frais de personnel 2021) | **0**, et un contrôle qui échoue |
| sources dépassant leur seuil « trop ancien » sans phrase à l'écran | **non mesuré** | **0** |
| liens de provenance affichés répondant autre chose que 200 | **au moins 1** | **0** |
| écart entre ce qui est en ligne et ce qui est construit | **produit entièrement différent** | **nul, et gardé par un contrôle** |
| poids socle + plus gros paquet départemental | 267 Ko + socle | **≤ 350 Ko** |
| personnes apparaissant à la fois comme maire et comme député | **≥ 1** | **0** |

### X.2 · Mesures de bêta, avec des humains, pas avec des traceurs

Huit à douze personnes, en présence, sur leur propre téléphone, leur propre commune. Ce sont
des observations, pas des statistiques, et c'est ce qui les rend utiles.

1. **L'aha** : la personne ouvre-t-elle « Vérifier » après avoir lu la première phrase ? C'est
   le seul signal honnête que le chiffre l'a atteinte.
2. **Le reproche** : la phrase « ça parle de la France » est-elle encore prononcée ? Elle l'a
   été par les huit.
3. **Le mot bloquant** : quel mot fait décrocher, et à quel endroit ? Six expressions opaques
   sont déjà identifiées ; combien en reste-t-il ?
4. **Le malentendu de Corinne** : la personne conclut-elle, d'une absence de donnée, une
   absence de fait ? C'est le risque produit numéro un, et il se teste en une question :
   « d'après cet écran, y a-t-il des projets prévus dans votre commune ? »
5. **Le retour** : la personne retrouve-t-elle sa commune en moins de trois gestes à la
   deuxième ouverture ? La plainte 8/8 portait là.

**Métrique explicitement refusée** : la fréquence de retour (§S.2). Un produit civique qui
optimise le retour quotidien fabrique de l'indignation.

---

## Y. RISQUES

| # | risque | probabilité | ce qui le ferme |
|---|---|---|---|
| 1 | **Un chiffre faux affiché avec une source officielle.** Le cas est réel : 34 868 zéros de frais de personnel en 2021 | **certaine — c'est déjà le cas** | P0-1 |
| 2 | **Une absence de donnée lue comme une absence de fait**, puis répétée en réunion avec l'autorité d'une source officielle | **observée** | la phrase de raison (§P.5), jamais la phrase d'interdiction |
| 3 | **Un taux de présence calculé par un tiers sur nos fichiers**, et l'erreur nous est imputée | **élevée, et l'outil est déjà publié** | P0-2 |
| 4 | **Le produit public n'est pas le produit construit** : trois chemins de publication, un gel du 19 août en ligne | **certaine — c'est déjà le cas** | P0-3 |
| 5 | **Des données mortes servies indéfiniment** : cache jamais expiré, collecte morte depuis le 26 août | **certaine** | P0-4, P0-5 |
| 6 | **Une capture d'écran instrumentalisée** contre un élu | **élevée** dès la première visibilité | §P.3, §P.4, et l'interdiction du pourcentage (§G.5) |
| 7 | **Deux affirmations contradictoires** affichées simultanément (maire et député) | **certaine — au moins un cas** | P0-8 |
| 8 | **Un rattachement deviné.** La table des circonscriptions est figée depuis 2017 ; 14 communes franciliennes sont partagées entre plusieurs circonscriptions | présente | afficher toutes les circonscriptions d'une commune partagée, et dire que la table date de 2017 |
| 9 | **Un contrôle vert sur un invariant enfreint.** C'est arrivé deux fois : l'invariant 8 par la forme (§K.1), le zéro par la donnée (§G.3) | **démontrée deux fois** | tout nouvel invariant doit être gardé par une propriété, pas par une liste de mots |
| 10 | **Le produit devient un média.** La pente est réelle : un fil, un flux, une actualité, une fréquence de retour | modérée | §S.2 : renoncer au retour quotidien par écrit |
| 11 | **Le produit devient une arme.** Le professionnel militant est le premier utilisateur et n'est pas la cible | **élevée** | concevoir contre lui (§C, §P.4) |
| 12 | **Épuisement de l'auteur sur des chantiers de correction** pendant que la feuille de route promet des fonctionnalités | élevée | les P0 **ne sont pas des fonctionnalités**, et il faut l'assumer auprès de soi-même |

### Y.1 · Le risque que je ne sais pas fermer

**Le produit est vrai, prudent, sourcé — et personne ne revient.** Une personne non
professionnelle sur huit revient à trois mois, et par coïncidence. Toutes les corrections de
ce document rendent le produit plus juste ; **aucune ne démontre qu'il sera désiré.**

C'est la seule hypothèse du projet qui ne se mesure pas sur des fichiers, et il faut la
tester avec des humains avant de construire quoi que ce soit de plus. Si, après l'écran d'aha
moment et les corrections de langue, sept personnes sur huit ne reviennent toujours pas, la
bonne conclusion n'est pas « il manque des fonctionnalités ». C'est que la question à
laquelle Repère répond n'est pas posée assez souvent pour soutenir un produit — et il faudra
alors choisir entre être un service de référence rarement consulté (ce qui est honorable) et
changer de question.

---

## Z. VISION FRANCE ENTIÈRE

### Z.1 · Ce qui passe à l'échelle sans rien changer

**La donnée est déjà nationale.** Mesuré : **104 paquets départementaux, 34 637 communes
servies**, le plus gros paquet à 267 Ko. Les comptes existent pour 34 868 communes sur les
trois exercices. Le RNE est national. Les circonscriptions couvrent 34 626 communes, dont
34 508 (99,7 %) à circonscription unique.

**L'aha moment passe à l'échelle tel quel** : un poste fixe, la commune comparée à
elle-même, aucune comparaison entre territoires. La règle R-AHA est la même pour Mulcent et
pour Marseille.

**L'architecture passe à l'échelle par construction** : un fichier par département, le serveur
n'apprend jamais la commune. C'est vrai pour 8 départements comme pour 104.

### Z.2 · Ce qui casse à l'échelle

1. **Paris, Lyon, Marseille.** Paris est à la fois commune et département, avec **18
   circonscriptions pour une seule commune**. La notion de « votre député » n'y a aucun sens
   sans l'adresse du lecteur, que le produit ne demandera jamais. Les arrondissements ont
   leurs propres maires, qui ne décident pas des mêmes choses. **Ces trois villes demandent un
   traitement propre, et elles représentent une part importante de la population.**
2. **Les 118 communes à circonscription multiple** (14 en Île-de-France). La seule sortie
   honnête est d'afficher toutes les circonscriptions et de dire que la commune est partagée.
3. **L'outre-mer.** Les paquets existent (971 à 976) mais la Nouvelle-Calédonie, la Polynésie
   et Wallis-et-Futuna ont des paquets quasi vides (23 à 33 octets) et un régime institutionnel
   différent. **Un produit qui dit « chaque humain vivant en France » ne peut pas servir un
   écran vide à ces territoires.** Soit on les traite, soit on écrit pourquoi on ne les traite
   pas encore.
4. **Les communes nouvelles et les fusions.** Le code officiel géographique change chaque
   année ; un code INSEE qui disparaît est un lecteur qui ne trouve plus sa commune. Il manque
   un contrôle : tout code servi doit exister dans le millésime courant.
5. **La table des circonscriptions figée depuis 2017.** À l'échelle nationale, le risque n'est
   plus théorique : un redécoupage rendrait 34 626 rattachements faux du jour au lendemain, et
   nous n'aurions aucune source de remplacement (§M.4).

### Z.3 · L'ordre d'extension

**Île-de-France → un département rural → une métropole hors Île-de-France → Paris/Lyon/
Marseille → outre-mer.**

La deuxième étape est la plus instructive et elle est contre-intuitive : **un département
rural, pas une grande ville.** Raison mesurée : les 22 communes qui ont soldé leur dette sont
presque toutes de très petites communes (Bussières, 4 805 € ; Cessoy-en-Montois, 6 437 €), et
c'est là que l'aha moment est le plus fort — un habitant d'un village de 200 personnes n'a
aucun autre moyen de savoir cela. Les grandes villes ont des journalistes locaux, des
oppositions organisées et des budgets participatifs ; **les petites communes n'ont personne, et
c'est là que Repère est irremplaçable.**

### Z.4 · Ce que Repère ne deviendra pas

Il faut l'écrire, parce que la pression ira dans ces directions :

- **pas un média** : aucun flux, aucune actualité, aucun choix éditorial de sujet ;
- **pas un réseau social** : aucun compte, aucune contribution, aucun commentaire ;
- **pas un observatoire de la vie politique** : aucun classement, aucun score, aucune
  étiquette, aucun palmarès ;
- **pas un outil de campagne** : conçu contre la capture d'écran militante, y compris au prix
  de fonctionnalités que les militants réclameront ;
- **pas un produit d'habitude** : aucune notification, aucune série, aucune optimisation de la
  fréquence de retour.

**Ce qu'il peut devenir, et personne d'autre ne le peut : le service qui dit à n'importe quel
habitant de France qui décide chez lui et avec quel argent, sans jamais apprendre qui le lui
demande.**

C'est moins vaste que « reconnecter chaque humain vivant en France à son statut de citoyen ».
C'est tenable, c'est vérifiable, et c'est déjà, à 100 % de couverture, ce que le produit fait
— dès que les dix corrections P0 auront rendu vrai ce qu'il affiche.

---

## ANNEXE — LES SEPT PHRASES À RETENIR

1. **34 868 communes sur 34 868 affichent zéro frais de personnel en 2021.** Ce n'est pas une
   donnée, c'est une colonne absente écrite comme un montant nul par notre chaîne.
2. **Un taux de présence de 19 % est calculable en une ligne sur nos fichiers publiés**, et la
   garde de l'invariant 8 est verte parce qu'elle cherche des noms de champs.
3. **Moins de 6 % de la hauteur de page varie d'une commune à l'autre.** Le verdict des huit
   testeurs était une lecture exacte de l'écran.
4. **94 % des communes franciliennes ont une dette qui a changé**, et ce fait est déjà dans le
   fichier que le produit télécharge. C'est l'aha moment, et il n'est pas construisible avant
   la correction du point 1.
5. **Quatre des six alternatives d'aha moment demandées par le brief ont une couverture de
   zéro.**
6. **« Comparer les positions des partis » n'a pas d'objet source.** Aucune donnée publique
   française ne publie la position d'un parti.
7. **Il n'existe aucune raison honnête de revenir demain**, et c'est une bonne nouvelle : la
   valeur de Repère est d'être juste quand on en a besoin.
