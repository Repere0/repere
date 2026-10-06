# Repère mobile, bêta Île-de-France — « Pourquoi je reviens ? »

*Mesuré le 6 octobre 2026 sur les données publiées en production
(`repereapp.netlify.app/data`, paramètre neuf contre le cache) et sur l'export
web de l'application mobile. Ce qui n'a pas été mesuré est écrit comme tel.*

## 1. Ce qui peut réellement changer pour une commune (audit des données)

| nouveauté possible | fichier / source | date de la donnée | rythme réel | détectable ? | affichable et sourçable ? |
|---|---|---|---|---|---|
| vote solennel du député | `scrutins.json` (catalogue AN) + `scrutins/<dép>.json` | 12 scrutins, le plus récent le **21/07/2026** | à chaque séance de votes solennels (session ouverte le 1er octobre) | oui : numéro de scrutin absent de l'ancien catalogue | oui (page du scrutin) |
| maire | `departments/<dép>.json` (RNE) | publié le 11/08, maires relevés le 05/10 | rare | oui : nom différent dans les deux versions | oui (RNE) |
| député | `deputes.json` | relevé le 05/10 | rare (démission, élection partielle) | oui, une circonscription seulement | oui |
| nouvel exercice de comptes | `departments/<dép>.json` (OFGL) | 29/07, exercices 2021, 2024, 2025 | **annuel** (été) | oui : année absente de l'ancienne version | oui (OFGL) |
| nouveau projet aidé par l'État | `projets/<dép>.json` (DGCL) | 24/07, exercices 2024–2025 | **annuel** | oui : projet absent de l'ancienne version | oui (DGCL) |
| agenda AN / Sénat | `agenda-an.json`, `calendrier-senat.json` | relevés chaque jour | **quotidien** | oui, mais **national** | oui — mais ce n'est pas une nouveauté « chez vous » |
| faits éditoriaux validés | `evenements.json` (clé `r`) | **8 faits publiés** (7 scrutins solennels + 1 décision du Conseil constitutionnel) — *corrigé le 06/10 : une première lecture de ce fichier cherchait une autre clé et avait conclu à tort « 0 fait »* | à chaque validation du porteur | oui : identifiant absent de l'ancien fichier (lot 11) | oui (source du scrutin + source des grands axes) |
| délibérations municipales, marchés, budgets primitifs | aucune source branchée | — | — | **non** | **non** |

**Conséquence honnête.** Pour une commune de la bêta, la plupart des jours,
*rien ne change*. Les votes solennels apporteront de vraies nouveautés pendant
la session budgétaire (octobre à décembre) ; comptes et projets, une fois par an.
Toute promesse d'une nouveauté quotidienne serait fausse.

## 2. Le modèle « changement » (lot 8, `feat/mobile-depuis-derniere-visite`)

- **« Nouveau » = absent de la version que le téléphone avait gardée, présent
  dans la publication du jour.** Jamais « nouveau parce que chargé ».
- **Aucune donnée de plus n'est gardée.** La version précédente est le fichier
  public déjà autorisé dans le cache (invariant 2). Le client la tient *en
  mémoire, pour la session*, au moment où la publication du jour la remplace
  (`precedentDe`, `connaissance` dans `@repere/data-utils`). Ni date de visite,
  ni historique, ni identifiant.
- Comparaison dans `@repere/core` (`changementsCommune`) : seules les familles
  dont une version précédente existait parlent ; plusieurs circonscriptions →
  un décompte, jamais un député nommé.
- **Affiché pour la commune retenue seulement.** Le cache est tenu par
  département : dire « depuis votre dernière visite » d'une commune jamais
  ouverte serait faux.
- **Anti faux-engagement.** Rien de nouveau → « Rien de nouveau depuis votre
  dernière visite. » et rien d'autre. Première visite, cache effacé,
  réinstallation, hors ligne → rien n'est affirmé. Jamais « revenez demain ».

**Limite connue.** Si le lecteur ouvre une autre commune du même département
entre deux visites de la sienne, un changement survenu entre-temps peut ne pas
être signalé. L'inverse est impossible : rien n'est dit nouveau à tort.

**Évaluation de la structure** (question → réponse → visuel → source →
approfondir) : chaque carte dit ce qui a changé (phrase datée), pourquoi ça
concerne le lecteur (une ligne), sa source, et un geste pour approfondir. Quand
il y a du nouveau, il passe avant les trois réponses habituelles : c'est
voulu, c'est ce que le lecteur vient chercher.

## 3. Fraîcheur, par famille (lot 9)

| famille | date affichée près de la donnée | rythme attendu | si ancienne | si source indisponible | si hors bêta |
|---|---|---|---|---|---|
| élus | fiche source (publication RNE) | quelques fois par an | normal : le ministère le republie irrégulièrement (dernière publication le 11/08) | « pas arrivés » + Réessayer | publiés (104 départements) |
| comptes | année dans chaque titre (« · comptes 2025 ») | annuel | normal : dernier exercice publié | « pas arrivés » + Réessayer | publiés |
| projets | année sur chaque projet | annuel | normal | « pas arrivés » + Réessayer | « pas encore disponibles dans la bêta » |
| votes | date du vote dans la phrase | par séance | la date suffit (jamais « dernier ») | « pas arrivés » + Réessayer | publiés (104) |
| agenda | **date du relevé dite au-delà de 2 jours** (lot 9) | quotidien | « Calendrier relevé le … : des séances ont pu changer depuis » | « Le calendrier n'est arrivé… » | national |
| toute l'app | « Publication Repère du … » + bandeau de l'invariant 9 | quotidien | « publication précédente » | « impossible à vérifier » | — |

Distinction tenue partout : aucune donnée ≠ non publiée ≠ indisponible ≠
ancienne ≠ hors bêta (chacune a sa phrase, contrôlée par le parcours).

## 4. Accessibilité — vérifié automatiquement, et ce qui ne l'est pas

**Vérifié dans le parcours (export web, Chromium), à 360, 390 et 430 px :**
pas de débordement, cibles ≥ 44 px, nom accessible sur chaque contrôle,
contraste AA, accents, réduction des animations, panne réseau, états vides ;
**texte à 200 %** (approché en doublant les tailles calculées) sur sept écrans
pour Créteil et Meaux : rien ne déborde, rien n'est coupé.
Emojis décoratifs cachés au lecteur d'écran ; ordre du code = ordre visuel.

**Non vérifié** : VoiceOver, TalkBack, agrandissement réel du système,
feuille de partage native. Le rendu web n'est pas un téléphone.

### Checklist iPhone — 5 minutes

1. **Réglages › Accessibilité › Affichage et taille du texte › Texte plus
   grand** au maximum. Ouvrir Repère, taper « meaux ». *Attendu : rien de coupé,
   les trois réponses lisibles en faisant défiler.*
2. **VoiceOver** (triple-clic sur le bouton latéral). Sur « Meaux », balayer
   vers la droite. *Attendu : chaque réponse est lue comme un titre, puis sa
   source, puis son lien ; aucun emoji n'est lu.*
3. Toucher **« Retenir Meaux sur ce téléphone »**, fermer l'app (balayer vers
   le haut), la rouvrir. *Attendu : « Voir ce qui se passe à Meaux »,
   puis « Rien de nouveau depuis votre dernière visite. »* Toucher
   **« Oublier Meaux »**, fermer, rouvrir. *Attendu : plus rien de proposé.*
4. **« Partager ce qui se passe à Meaux »**, choisir Messages. *Attendu : trois
   phrases, chacune suivie d'une source officielle ; ni code, ni lien de
   suivi.*
5. Taper « paris », **« Comprendre ce vote »**, toucher « 5e ». *Attendu : le
   député de la 5e ; jamais « votre député » affirmé sans adresse.*

6. Sur « Meaux », **« Comprendre ce vote »**. *Attendu : une carte « Ce que
   prévoit ce texte », une phrase, « Tout le détail du texte » qui se déplie,
   « Relu et validé par la rédaction de Repère », et une source.* Avec VoiceOver :
   le détail déplié est lu en entier.

Noter pour chaque point : OK / pas OK + capture.

## 5. Partage

L'adresse de Repère n'est **pas** ajoutée au message partagé : la bêta est
fermée, le message est déjà compréhensible et sourcé, et un lien vers le
produit dans chaque partage est un acte de lancement public. À reconsidérer
au lancement.

## 6. Constats pour l'UX 2.0 (app réelle, 06/10/2026 — rien n'est codé)

**Où c'est excellent.** Des phrases entières et datées (« En 2025, Meaux a
dépensé 2 123 € par habitant ») ; des absences dites avec leur cause ; la
multi-circonscription traitée honnêtement ; la source à portée de doigt ;
« depuis votre dernière visite » sans compte.

**Ce qui est vraiment différenciant.** La part de l'État dans un projet de la
commune ; la dette en mois de recettes ; le vote *localisé* du député ; la
chaîne « qui décide » de la commune à l'Assemblée ; la comparaison honnête
entre deux publications.

**Où l'utilisateur hésite ou ne comprend pas.**
- « ⓘ Calcul Repère » : le libellé ne dit pas qu'il s'ouvre sur une explication.
- La première réponse est souvent un projet de 2025 et un vote de juillet : du
  vrai, mais rarement « ce qui se passe » maintenant.
- Le maire n'apparaît que dans la note de la carte « dépenses » : la question
  « qui décide chez moi » arrive tard.
- « Publication Repère du 5 octobre 2026 » : formulation de producteur, pas de
  lecteur.

**Ce qui paraît administratif.** « Dotation politique de la ville »,
« le conseil municipal le vote », les intitulés officiels sans accents de la
DGCL (recopiés tels quels, par principe).

**Ce qui pourrait paraître politique.** Les couleurs de groupes sur les écrans
Assemblée (signalées comme une lecture de Repère) ; le choix d'un vote parmi
d'autres quand rien n'est récent.

**Trop de choix sur le premier écran.** Trois suites, trois sources, un
partage, « Aller plus loin » (trois liens) et la mémoire.

**Concepts à explorer plus tard, sur données réelles :**
« Mon territoire aujourd'hui » (ce qui a changé, puis les trois réponses) ;
« Votre vie publique en 60 secondes » ; « La question citoyenne » (une
question par écran, la réponse d'abord).

## 7. Raison de revenir — le mécanisme, et ce qui manque

Ce qui marche aujourd'hui, sans compte ni notification : comparer deux
publications. Ce qui le rendra utile plus souvent :
1. **La couche éditoriale** (faits validés, `data/evenements/`) : 8 faits
   publiés, tous de juillet–août. Depuis le lot 11, le mobile les affiche
   (« Ce que prévoit ce texte ») et signale ceux publiés depuis la dernière
   visite. C'est le levier le plus fort ; son rythme ne dépend que du porteur.
2. **Les votes de la session budgétaire** (octobre–décembre) : ils
   apparaîtront seuls dans « depuis votre dernière visite ».
3. **Une source de décisions locales** (délibérations, budgets primitifs) :
   aucune source branchée ; à instruire après la bêta.

Écarté volontairement : notifications, compte, historique de lecture,
« revenez demain ».

## 8. Éditorial — état réel au 6 octobre 2026

- **Publiés en production** (`evenements.json`, clé `r`, mise à jour du 05/10) :
  8 faits `valide: true`, `confiance: verifie` — scrutins 8418, 8419, 8421, 8430,
  8431, 8433, 8434 (source : page du scrutin ; grands axes : texte adopté ou
  transmis, source distincte), et la décision n° 2026-910 DC du Conseil
  constitutionnel.
- **8430** : validé par le porteur le 29/09 (commit `08cfc30`). Ses axes sont
  sourcés au texte transmis au Sénat (n° 911, 2025-2026 ; la page répond). La
  branche `data/8430-axes-sources` (`valide: false`) est dépassée.
- **Pourquoi rien n'apparaissait sur le mobile** : la publication avait abouti,
  mais l'application ne chargeait jamais ce fichier (`evenements: null`).
  Corrigé par le lot 11.
- **Ce qui manque** : tous les faits datent de juillet–août. Le fil ne donnera
  une raison de revenir que si de nouveaux faits sont validés pendant la session
  budgétaire (octobre–décembre). La validation reste au porteur.

## 9. Petites fonctionnalités — évaluation (06/10/2026)

| idée | valeur | coût | décision | pourquoi |
|---|---|---|---|---|
| « Ce que prévoit ce texte » (faits validés sur le vote) | très haute : un vote devient compréhensible | faible | **fait (lot 11)** | la donnée existait, validée et sourcée |
| Retenir sa commune dit « s'il y a du nouveau » | haute : rend visible la raison de revenir | très faible | **fait (lot 12)** | promesse alignée sur ce que fait le code |
| En clair (un « ? » sur un terme) | moyenne | moyen | **BACKLOG (UX 2.0)** | les écrans de détail expliquent déjà circonscription, intercommunalité et vote solennel ; sur le premier écran, un contrôle de plus fait déborder la 3e réponse à 360 px (782/800) |
| Pourquoi ça compte (impact factuel) | moyenne | — | **non pour l'instant** | la dette l'a déjà ; donner du sens au « par habitant » exigerait une comparaison, interdite |
| Contexte Avant → Maintenant | haute | — | **fait** | « Où en est ce texte » (lot 11), « Ce qui a changé entre 2024 et 2025 » |
| Retenir une information | faible | moyen | **non** | aucun usage réel trouvé qui ne devienne pas un système de favoris |

Sources des définitions « En clair » : les pages de vie-publique.fr sont derrière
un mur anti-robot (un code 200 ne prouve pas que la page existe) ; seule la page
« Les intercommunalités » de collectivites-locales.gouv.fr a été vérifiée. À
revoir avant de citer une définition.

## 10. Regard citoyen (Meaux, Paris, Ustaritz — app réelle)

**Forces.** Je comprends en une phrase ce que l'État finance chez moi et ce que
ma commune dépense, avec l'année. Je vois ce qu'a voté mon député et, désormais,
ce que prévoit le texte. Chaque chiffre a sa source à un geste.

**Faiblesses.** Le premier écran parle d'un vote de juillet : vrai, daté, mais
rarement « ce qui se passe » aujourd'hui. La question « qui décide chez moi »
arrive en note, pas en réponse. Hors Île-de-France, deux étapes de plus.
