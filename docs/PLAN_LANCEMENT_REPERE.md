# Repère — plan de lancement

**Budget disponible : 250 € sur douze mois. Cap : être connu avant la présidentielle d'avril 2027.**
Document de travail, arrêté au 28 juillet 2026. Il reste donc environ **huit mois et demi** avant
le premier tour, et environ six mois avant la période où l'attention du public bascule sur la
campagne (janvier 2027).

---

## 0. La contrainte qui commande tout le reste

250 € sur un an, cela veut dire qu'une seule ligne de dépense peut dépasser 100 € — et que ce
sera l'App Store ou rien. Le plan qui suit est donc construit à l'envers de ce qu'on fait
d'habitude : on ne commence pas par les magasins d'applications, on commence par le web, parce
que le web coûte zéro et se met en ligne le jour même.

Il y a une deuxième raison, moins évidente et plus importante. Une application publiée sur
l'App Store demande une validation d'Apple à chaque mise à jour, et un compte Google Play
personnel neuf doit d'abord passer un test fermé de **douze testeurs pendant quatorze jours
consécutifs** avant de pouvoir être publié. Sur un calendrier de huit mois, ces délais mangent
les semaines les plus utiles. Une application web installable se corrige en dix minutes.

**La décision : le web d'abord, les magasins ensuite, et seulement quand il y a des gens.**

---

## 1. Ce que coûte réellement le lancement

### Dépenses obligatoires, année 1

| Poste | Coût | Quand | Remarque |
|---|---:|---|---|
| Immatriculation micro-entrepreneur (guichet unique INPI) | **0 €** | Immédiat | Gratuit pour une activité libérale ou commerciale |
| Nom de domaine `.fr` | **7 à 12 €/an** | Immédiat | Chez un bureau d'enregistrement français |
| Hébergement de l'app web + du site | **0 €** | Immédiat | Cloudflare Pages, GitHub Pages ou Netlify, offre gratuite |
| Certificat HTTPS | **0 €** | Immédiat | Inclus partout |
| Mentions légales et politique de confidentialité | **0 €** | Immédiat | Modèles CNIL, à adapter |
| **Sous-total pour exister publiquement** | **7 à 12 €** | | |

### Dépenses de distribution, à déclencher seulement quand il y a de l'usage

| Poste | Coût | Quand | Remarque |
|---|---:|---|---|
| Compte développeur Google Play | **~23 €** (25 $, une seule fois) | Étape 3 | Puis test fermé 12 testeurs / 14 jours |
| Compte développeur Apple | **99 €/an** | Étape 4 | Le poste le plus lourd du budget |
| **Sous-total distribution** | **~122 €** | | |

### Réserve

| Poste | Coût | Remarque |
|---|---:|---|
| Adresse e-mail professionnelle sur le domaine | 0 à 15 €/an | Redirection gratuite chez la plupart des bureaux d'enregistrement |
| Frais de paiement en ligne (Stripe) | 1,5 % + 0,25 € par transaction européenne | Aucun frais fixe, aucun abonnement |
| Imprévu | ~100 € | Ce qui reste du budget |

**Total engagé la première année si tout se déroule bien : environ 130 à 145 €.**
Il reste donc de la marge, et c'est voulu : la marge sert à réagir, pas à dépenser.

### Ce qu'on ne paye pas, et pourquoi

Pas d'agence, pas de logo acheté, pas de publicité, pas d'abonnement à un outil, pas de
domiciliation d'entreprise, pas d'avocat au lancement. Chacun de ces postes coûte plus que le
budget entier et aucun n'est nécessaire pour mettre l'application entre les mains de gens.

---

## 2. Le calendrier

### Étape 1 — Août 2026 : exister légalement et techniquement (2 semaines, ~12 €)

**Immatriculation.** Micro-entrepreneur, via le guichet unique de l'INPI. C'est gratuit et cela
prend une à trois semaines. Sans ce statut, tu ne peux pas vendre l'application de façon
répétée : une vente occasionnelle entre particuliers est tolérée, une activité de vente ne
l'est pas. Le statut donne aussi un SIREN, qui sera demandé par Stripe, par Apple et par Google.

Un point de vigilance : ton adresse personnelle deviendra ton adresse d'entreprise, et pour un
éditeur d'application elle est **publiquement affichée**. Apple impose depuis 2025 la
déclaration d'un « statut de professionnel » avec nom, adresse postale, téléphone et courriel
visibles sur la fiche de l'app. Si cela te dérange, il faudra prévoir une domiciliation, ce qui
coûte environ 15 à 30 € par mois — hors budget cette année. À décider en connaissance de cause.

**Nom et domaine.** Vérifier d'abord que « Repère » est libre à l'INPI comme marque dans les
classes 9 (logiciels) et 41 (information). Le dépôt de marque coûte 190 € — hors budget, mais
la vérification est gratuite et évite de construire une notoriété sur un nom qu'il faudra
abandonner. Réserver le domaine dans la foulée.

**Mentions légales.** Repère publie des informations sur des personnes nommées : tu es donc
éditeur d'un service de communication au public en ligne, avec les obligations qui vont avec —
identité de l'éditeur, hébergeur, **directeur de publication** nommément désigné, et un dispositif
de droit de réponse accessible. C'est le point juridique le plus important du lancement et il ne
coûte rien d'autre que de l'écriture soignée. Le droit de réponse existe déjà dans la maquette
sous forme de dépliant : il doit devenir un circuit tracé, avec un délai de réponse affiché.

**Confidentialité.** L'atout de Repère, c'est de n'avoir presque rien à déclarer : pas de compte
obligatoire, pas de stockage local, position convertie en commune sur l'appareil puis oubliée.
Il faut l'écrire noir sur blanc, parce que c'est à la fois une obligation et le meilleur argument
commercial de l'app. Pas de cookies non essentiels signifie pas de bandeau de consentement, ce
qui est aussi un avantage d'expérience.

### Étape 2 — Septembre 2026 : la version web publique (4 semaines, 0 €)

L'objectif est une application web installable — on ouvre une adresse, on l'ajoute à l'écran
d'accueil, elle se comporte comme une app. Techniquement, c'est la maquette actuelle, plus un
manifeste, plus une icône, plus un service worker minimal pour le mode hors ligne.

Territoire pilote : les six communes déjà couvertes autour de Fontainebleau. Ne pas élargir. Une
couverture honnête sur six communes vaut mieux qu'une couverture creuse sur trente-six mille,
et le message « nous ne couvrons pas encore votre commune, voici les liens officiels » est déjà
l'un des meilleurs textes de l'application.

Modèle : gratuit au lancement. On ne vend rien tant qu'on n'a pas de retours d'usage. Le prix se
branche à l'étape 5.

### Étape 3 — Octobre 2026 : les cinquante premiers utilisateurs (4 semaines, 0 €)

C'est l'étape que la plupart des projets sautent, et c'est celle qui décide de tout.

Le premier cercle est local et institutionnel, pas médiatique. Concrètement : les mairies des six
communes pilotes, à qui on montre la fiche de leur commune (elles corrigent, elles relaient, et
elles sont flattées d'être les premières) ; les professeurs d'histoire-géographie et
d'enseignement moral et civique des collèges et lycées du secteur, à qui on montre le jeu « Qui
décide ? », qui n'a pas d'équivalent en France ; les services jeunesse et les missions locales ;
les bibliothèques et les CDI. Aucun de ces canaux ne coûte un euro et tous mènent directement
aux 16-25 ans.

Le deuxième cercle est en ligne : les communautés locales sur les réseaux, les forums de commune,
et une présence sur un ou deux réseaux courts avec des captures d'écran de l'application — pas
des discours. C'est là que la refonte graphique en cours prend son sens : une carte de Repère
doit être partageable telle quelle.

**L'objectif chiffré : douze personnes prêtes à tester sur Android.** Ce n'est pas un hasard,
c'est exactement ce que Google exigera à l'étape suivante.

### Étape 4 — Novembre-décembre 2026 : les magasins d'applications (8 semaines, ~122 €)

**Google Play d'abord** (~23 €, une seule fois). Compte créé, application déposée en test fermé,
puis quatorze jours consécutifs avec douze testeurs actifs. Si les testeurs décrochent en cours
de route, le compteur repart. D'où l'étape 3 : les testeurs doivent exister **avant** l'ouverture
du compte, pas après.

**Apple ensuite** (99 €/an). C'est 40 % du budget annuel dans une seule ligne. On ne la dépense
que si l'étape 3 a produit un usage réel et que des utilisateurs iPhone le réclament. Prévoir
deux à quatre semaines de validation avec des allers-retours : une application d'information
politique est examinée avec attention, et il faudra pouvoir démontrer la neutralité éditoriale
et la provenance des données. Les tampons « CHIFFRES VÉRIFIÉS » et l'écran des sources sont
précisément ce qui répond à cette question — c'est un argument de conformité autant qu'un
argument de produit.

Astuce budgétaire : la version web reste la version de référence. Les magasins ne sont qu'un
canal de distribution supplémentaire, pas le produit.

### Étape 5 — Janvier 2027 : brancher le paiement (2 semaines, 0 € de frais fixes)

Stripe, sans abonnement, ~1,5 % + 0,25 € par transaction européenne. Sur le web, un achat à
4,99 € rapporte environ 4,67 €. Via l'App Store, Apple prélève 15 % dans le programme petites
entreprises, soit environ 4,24 € — et la TVA est gérée par Apple, ce qui simplifie la
comptabilité. Les deux se valent ; le web garde l'avantage de la relation directe.

Obligations : conditions générales de vente, et surtout la mention du droit de rétractation de
quatorze jours avec la renonciation expresse pour un contenu numérique fourni immédiatement —
sans cette case, tout acheteur peut se faire rembourser pendant deux semaines après avoir tout lu.

Écrire « une seule fois, pas d'abonnement » juste à côté du prix. Dans un marché saturé
d'abonnements, c'est un argument de confiance autant qu'un argument de prix.

### Étape 6 — Février-avril 2027 : la fenêtre présidentielle

C'est le moment où le sujet devient d'intérêt général et où une application civique neutre a sa
meilleure chance d'être remarquée. C'est aussi le moment le plus dangereux pour sa réputation.

Ce qu'il faut préparer **avant** janvier, parce qu'il sera trop tard après :

Une page publique qui explique la méthode — d'où viennent les chiffres, comment ils sont
vérifiés, ce que Repère ne fait jamais. C'est cette page qu'un journaliste lira en premier.

Une politique éditoriale de campagne écrite et publiée : toutes les familles politiques au même
gabarit graphique, aucun classement, aucun palmarès, aucune position individuelle publiée sans
vérification. Ces règles existent déjà dans le code de l'application ; il faut qu'elles existent
aussi en français, sur une page, signées.

Une vigilance particulière sur le code électoral : pas de publication de sondages la veille et
le jour du scrutin, pas de contenu assimilable à de la propagande électorale, et une prudence
renforcée dans les six mois précédant le scrutin sur tout ce qui pourrait ressembler à un
avantage donné à un candidat. Le principe « aucun classement, jamais » de Repère est ta meilleure
protection juridique autant qu'éditoriale.

Et un contenu simple à relayer : « qui décide de quoi » est exactement la question que tout le
monde se pose en campagne et à laquelle presque personne ne répond correctement.

---

## 3. Ce qu'il faut décider maintenant, pas plus tard

**Le nom.** Vérifier « Repère » à l'INPI cette semaine. Si le nom est pris dans les classes
utiles, mieux vaut le savoir avant d'imprimer quoi que ce soit.

**Le directeur de publication.** Ce sera toi. Cela signifie que tu es juridiquement responsable
de ce qui est publié, y compris des résumés générés automatiquement. C'est la raison pour
laquelle les garde-fous de neutralité inscrits dans le code ne sont pas une coquetterie : ils
sont ta protection.

**L'adresse publique.** Domicile ou domiciliation payante. Décision à prendre avant
l'immatriculation, pas après.

**Ce qu'on ne fait pas.** Pas de dépôt de marque cette année (190 €, hors budget). Pas de
couverture nationale avant d'avoir prouvé la qualité sur six communes. Pas d'Apple avant d'avoir
des utilisateurs. Pas de publicité payante, jamais : elle est incompatible avec la promesse de
neutralité et, à 250 €, elle ne produirait rien.

---

## 4. Les trois choses qui peuvent tuer le projet

**La donnée fausse.** Un seul chiffre erroné attribué à un élu nommé, et la crédibilité est
perdue pour de bon. C'est pourquoi le tampon de vérification n'est pas un ornement : il est le
produit. La discipline « À CONFIRMER plutôt que faux » doit tenir même sous pression de
calendrier.

**L'accusation de parti pris.** Elle viendra, quelle que soit ta rigueur, et elle viendra
probablement de plusieurs bords à la fois — ce qui est plutôt bon signe. La réponse ne
s'improvise pas le jour où elle arrive : elle se prépare en publiant la méthode à l'avance et en
tenant un registre des corrections apportées.

**L'épuisement.** Huit mois, seul, sur un projet à 250 €, avec une échéance qui ne bouge pas.
Le seul remède est de réduire le périmètre plutôt que le sommeil : six communes bien couvertes
valent mieux qu'un projet abandonné en février.

---

## 5. Résumé en une page

| Étape | Quand | Coût | Livrable |
|---|---|---:|---|
| 1. Exister | Août 2026 | ~12 € | Statut, domaine, mentions légales, confidentialité |
| 2. Publier | Septembre 2026 | 0 € | App web installable, 6 communes |
| 3. Diffuser | Octobre 2026 | 0 € | 50 utilisateurs, dont 12 testeurs Android |
| 4. Distribuer | Nov.-déc. 2026 | ~122 € | Google Play, puis Apple si l'usage est là |
| 5. Vendre | Janvier 2027 | 0 € fixe | Stripe, CGV, droit de rétractation |
| 6. Compter | Fév.-avril 2027 | 0 € | Page méthode, politique de campagne, contenus de fenêtre |
| **Total** | | **~135 €** | Marge conservée : ~115 € |
