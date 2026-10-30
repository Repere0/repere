# Stratégie éditoriale — trois questions ouvertes pour le CEO

Date : 30/10/2026. Ce document pose les questions et rassemble les faits du dépôt. Il ne décide rien.

## Ce qui existe aujourd'hui (faits vérifiés dans le dépôt)

- **Fil de la rédaction** : `data/evenements.json` contient **8 faits**, tous nationaux. Le plus récent date du **14/08/2026** (décision du Conseil constitutionnel), les 7 autres sont des scrutins de juillet 2026. Aucun fait propre à une commune.
- **Format d'un fait** : `docs/data/evenements-format.md`. Chaque fait a un titre et un résumé écrits par un humain, une source officielle (sans source, il n'est pas publié) et une date. Les fichiers validés vivent dans `data/evenements/*.md`.
- **Ce qui se met à jour seul, chaque jour** (`collecte.yml`) : élus, comptes, scrutins, agendas. Rien d'éditorial.
- **Conséquences visibles dans l'application** :
  - l'écran Actualités montre des faits vieux de plus de deux mois ;
  - la carte « Dernières publications » de l'accueil reste masquée (règle : moins de 7 jours) ;
  - les testeurs ne verront « rien de neuf » en revenant.

## Question 1 — Qui publie quoi chaque semaine ?

| Option | Pour | Contre |
|---|---|---|
| **Le CEO lui-même** | contrôle total de la neutralité ; démarrage immédiat | temps ; un seul relecteur ; s'arrête si le CEO est indisponible |
| **Une association partenaire** (civique, journalisme local) | expertise, légitimité, plusieurs plumes | convention à écrire ; risque de ligne éditoriale perçue comme engagée ; relecture de neutralité nécessaire |
| **Un flux automatique** (RSS des sites de mairies, Journal officiel, communiqués) | volume, régularité | Repère ne résume pas automatiquement (règle de `evenements-format.md` : « écrits par un humain ») ; il faudrait au minimum une relecture humaine de chaque fait ; les flux de mairies ne sont pas uniformes |

**Ce qu'aucune option ne change** : chaque fait garde une source officielle et une relecture humaine avant publication (invariant 4, règle éditoriale).

## Question 2 — Sur combien de communes, au minimum ?

| Option | Ce que ça demande |
|---|---|
| **Melun seule** (la commune d'exemple de l'accueil) | quelques faits par semaine ; utile pour montrer le format, pas pour les testeurs d'autres communes |
| **Les communes des testeurs** (5 à 30) | la liste des communes des testeurs, connue après l'envoi du kit (`docs/tableau-retours.csv`, colonne « Commune testée ») |
| **Un top 20 de l'Île-de-France** | à définir sans classement (invariant 3) : par exemple, les préfectures et les sous-préfectures |
| **Toute l'Île-de-France** (1 262 communes) | hors de portée d'une rédaction humaine ; seulement les faits nationaux ou départementaux |

Une piste intermédiaire, non décidée : **des faits nationaux et départementaux pour tous** (une décision de l'Assemblée, du Sénat, du département) plus **des faits communaux pour les communes des testeurs**.

## Question 3 — Quel rythme réaliste ?

| Rythme | Effet dans l'application |
|---|---|
| **Hebdomadaire** | la carte « Dernières publications » reste visible en permanence (règle des 7 jours) |
| **Bimensuel** | elle est visible environ une semaine sur deux |
| **Mensuel** | elle est presque toujours masquée. Il faudrait allonger la fenêtre à 30 jours (`RECENT_JOURS` dans `src/ui/dernieres-publications.tsx`), une décision produit |

Rappel : l'Assemblée publie elle-même des scrutins solennels plusieurs fois par mois en session. Ils sont déjà relevés chaque jour et comptent comme « publications » dans la carte. Le rythme éditorial s'ajoute à celui-là.

## Ce qu'il faut pour commencer, quelle que soit la décision

1. Un relecteur de neutralité, différent de l'auteur, pour chaque fait.
2. Le format existant (`docs/data/evenements-format.md`).
3. Une date de première publication, pour que la carte « Dernières publications » apparaisse aux testeurs.
