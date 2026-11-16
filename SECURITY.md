# Politique de sécurité

Repère n'a ni compte, ni serveur applicatif, ni donnée personnelle transmise : l'application lit des fichiers publics et garde deux réglages sur l'appareil (voir `CLAUDE.md`, invariants 1 et 2). Une faille reste possible, et elle compte d'autant plus que l'application affiche des informations civiques.

## Versions suivies

| Version | Suivie |
|---|---|
| `main` (bêta Île-de-France, application 0.1.0) | oui |
| `app_repere_v18_*.html` (ère mono-fichier, avant le 23/09/2026) | non |

## Signaler une vulnérabilité

**N'ouvrez pas d'issue publique.** Deux voies, au choix :

1. Le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**.
2. Un courriel à **repere0@protonmail.com**, objet commençant par `[SÉCURITÉ]`.

Indiquez la version ou le commit, les étapes pour reproduire, et l'effet constaté. N'envoyez aucune donnée personnelle d'un tiers.

## Délais

Le projet est tenu par une seule personne, bénévolement. Les délais sont des engagements raisonnables, pas des garanties :

- accusé de réception : sous 7 jours ;
- premier diagnostic : sous 14 jours ;
- correctif ou contournement publié : dès que possible, et la personne qui a signalé est tenue informée.

## Dans le périmètre

- l'application (`mono/apps/mobile`) et ses versions web publiées ;
- la chaîne de collecte et les workflows GitHub (`outils/`, `mono/scripts/`, `.github/workflows/`) ;
- toute altération possible d'un chiffre, d'une source ou d'une date affichés ;
- toute transmission de donnée qui contredirait l'invariant 2 (aucun compte, traceur ni cookie).

## Hors périmètre

- les sites des producteurs de données (data.gouv.fr, Assemblée nationale, Sénat, etc.) : signalez-leur directement ;
- les hébergeurs (Netlify, Vercel, GitHub) ;
- une erreur dans une donnée publique elle-même : c'est un signalement ordinaire, voir `CONTRIBUTING.md`.

La personne qui signale peut être remerciée nommément dans le correctif si elle le souhaite.
