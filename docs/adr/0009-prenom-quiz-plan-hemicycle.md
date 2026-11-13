# ADR 0009 — Prénom local, couleurs du quiz, plan réel de l'hémicycle, Sénat

- Date : 13 novembre 2026
- Statut : accepté (décision du porteur du 13/11/2026, « Bêta App Store »)
- Amende : invariant 2 (deux clés de stockage local) et invariant 7 (couleurs)
- Remplace partiellement : la note d'ordre alphabétique de `packages/core/src/hemicycle.js`

## Contexte

La demande du porteur pour la bêta App Store tient en quatre chapitres : un premier
lancement qui accueille la personne, un quiz qui tient sur un écran, un hémicycle
rangé de la gauche vers la droite, et le Sénat à côté de l'Assemblée.

Trois de ces quatre chapitres touchent un invariant. Les voici, écrits avant d'être
appliqués, parce qu'un agent ne modifie jamais un invariant de sa propre initiative.

## Décisions

### 1. Le prénom, dans `repere.profil` (invariant 2)

Au premier lancement, Repère demande : « Comment souhaitez-vous qu'on vous appelle ? ».
La réponse est **facultative** et **ne crée pas de troisième clé** : elle vit dans
`repere.profil`, à côté de la taille du texte et du contraste.

Ce que cela change à l'invariant 2 : `repere.profil` ne contient plus seulement des
réglages de lecture, mais aussi **une donnée personnelle choisie**. Les garanties, elles,
ne bougent pas :

- le prénom **n'est jamais transmis** : aucune adresse réseau ne le porte, et un contrôle
  du banc (`onboarding-web.mjs`) le vérifie sur toutes les requêtes de la page ;
- il reste **facultatif** : « Passer » n'en garde aucun, et l'écran ne le réclame pas ;
- ce qui n'est pas un prénom (chiffres, balises, plus de 24 caractères) **n'est pas gardé**,
  et c'est dit à l'écran plutôt que corrigé en silence (`nettoyerPrenom`) ;
- « Oublier » l'efface avec le reste, et la page Confidentialité le nomme.

Pourquoi ne pas s'en passer : un écran qui dit « Bonjour Inès » n'est pas un ornement.
C'est la seule chose, dans toute l'application, qui dise à la personne que Repère est à
elle. Le prix (une donnée de plus sur l'appareil) est connu, borné, et réversible.

Rejeté : un compte, un identifiant, un prénom envoyé à qui que ce soit. Rejeté aussi :
le deviner à partir du téléphone.

### 2. Les couleurs du quiz (invariant 7)

Le quiz civique reçoit deux teintes, dans `palette.ts` seulement :
vert sauge `#4A7C59` (juste) et rouge brique `#AA4A4A` (faux).

Ce que cela change à l'invariant 7 : la liste des couleurs autorisées s'allonge de deux.
Ce que cela ne change pas :

- ces teintes **ne codent jamais un vote, une position, un élu, un parti ou une commune** ;
  elles disent *juste* ou *faux* à une question de vocabulaire, ce qui est un fait vérifiable
  et non un jugement ;
- elles sont **distinctes** de l'émeraude et du corail des votes, pour que l'œil ne confonde
  pas les deux registres ;
- **la couleur n'est jamais seule** : une coche ou une croix, et le mot « Juste » ou « Faux »
  écrit sur la carte. Un lecteur daltonien lit la même chose.

Un contrôle du banc (`invariants.test.mjs`) fige ces deux valeurs et interdit qu'une
couleur de vote serve au quiz.

### 3. Le plan réel de l'hémicycle (précise l'invariant 3)

Le porteur a demandé l'ordre `GDR → LFI → EcoS → SOC → LIOT → Dem → EPR → HOR → DR → RN`,
puis a donné la source : le plan publié par l'Assemblée.

L'échantillon pris par le runner le 13/11/2026 montre que ce plan est exploitable (chaque
siège est un tracé identifié, et un attribut donne le député de chaque siège), alors que
`placeHemicycle` dans l'archive AMO30 ne l'est pas (4 cas sur 401).

Décision : **dessiner le plan réel**, et non un ordre écrit par Repère. Chaque point est la
place d'un député dans la salle ; le creux du perchoir et les travées viennent de la source.
La légende suit alors la salle, de la gauche vers la droite vue du perchoir.

Pourquoi ce n'est pas un rang au sens de l'invariant 3 : personne n'est « premier », rien
n'est trié par taille ni par valeur, et aucune note n'est attribuée. C'est la description
d'un lieu, comme le plan lui-même, et l'écran dit d'où elle vient. L'ordre demandé par le
porteur en sort tout seul — parce que c'est celui de la salle.

Tant que le plan n'est pas publié (première collecte, page qui change de forme), l'arc
alphabétique reste, et l'écran écrit en toutes lettres que **la disposition est indicative
et n'est pas le plan de la salle**. On ne présente jamais une disposition inventée comme un fait.

### 4. Le Sénat

L'onglet « L'Assemblée » devient « Le Parlement », avec un contrôle segmenté entre les deux
chambres.

- **Licence relevée, jamais devinée** : la collecte lit la licence sur la page d'open data du
  Sénat à chaque passage. Aucune licence lisible : rien n'est publié (invariant 4).
- **Aucune couleur nouvelle** : chaque groupe du Sénat reprend la teinte déjà attribuée à la
  même famille politique à l'Assemblée (`COULEURS_GROUPES_SENAT`). La correspondance est
  écrite en toutes lettres dans `palette.ts` parce qu'elle est un choix et non un fait : un
  groupe du Sénat n'*est* pas un groupe de l'Assemblée. **À confirmer par le porteur.**
- **Pas de photo du Sénat** : celles-ci ne sont pas sous licence libre. D27 (ADR 0004) tient :
  Wikimedia Commons ou rien. Les cartes portent des initiales tant que la collecte Wikimedia
  ne couvre pas les sénateurs. C'est un écart assumé à la demande (« liste des sénateurs en
  cartes avec photos ») et non un oubli.
- Le plan réel du Sénat n'est pas publié sous une forme lisible : l'arc y est **indicatif**,
  l'ordre reste alphabétique du sigle, et l'écran l'écrit.

## Conséquences

- `CLAUDE.md` et `AGENTS.md` : invariants 2 et 7 mis à jour, `.claude/invariants.sha256` rescellé.
- `app/confidentialite.tsx` nomme le prénom.
- Deux fichiers publiés de plus : `hemicycle-plan.json`, `senateurs.json`, chacun avec sa
  source, sa licence et sa date, et chacun refusant d'écrire du vide.
- Ce qui reste à faire : les photos des sénateurs (Wikimedia), et le plan réel du Sénat s'il
  devient lisible un jour.
