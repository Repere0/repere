# Architecture de Repère — vue d'ensemble

*Mise à jour : 29/09/2026. Court par intention : lire ceci d'abord, puis le fichier du sujet.*

| fichier | quand le lire |
|---|---|
| [mobile.md](mobile.md) | tout travail sur l'application iOS / Android (`mono/apps/mobile`) |
| [donnees.md](donnees.md) | avant d'ajouter une source, un fichier publié, ou de proposer une API |
| [decisions.md](decisions.md) | avant de reproposer quelque chose : ce qui est tranché, ce qui attend le porteur |
| [tests.md](tests.md) | avant de dire « c'est vert » |
| [conventions.md](conventions.md) | avant d'écrire du code ou du texte affiché |
| [hors-ligne.md](hors-ligne.md) | avant de proposer un mode hors ligne sur téléphone |
| [identite-et-magasins.md](identite-et-magasins.md) | avant toute publication, identifiant, dépense de magasin |
| [ux-parcours-20-secondes.md](ux-parcours-20-secondes.md) | avant de toucher au parcours mobile |

## Le produit en une phrase

Pour chaque commune : **qui décide chez moi, où va mon argent** — chaque chiffre avec sa
source officielle et sa date, aucun classement, aucun compte, aucun traceur (les huit
invariants sont dans `CLAUDE.md` et ne se négocient pas).

## Les trois couches, depuis le 29/09/2026

```
 sources publiques (RNE, OFGL, Assemblée, DGCL, Sénat…)
        │  GitHub Actions, chaque jour (outils/pipeline.sh)
        ▼
 fichiers JSON statiques, un par département  ── publiés sur Netlify (/data)
        │
        ├── mono/packages/data-utils  charger : la SEULE fabrique d'adresses, le cache
        ├── mono/packages/core        dériver : faits, votes, comptes, recherche — sans interface
        │
        ├── mono/apps/web             le site (Preact, Vite) — en production
        └── mono/apps/mobile          l'application (Expo, React Native) — tranche verticale
```

**Règle de partage :** ce qui *décide quoi afficher* vit dans `core` ; ce qui *va chercher*
vit dans `data-utils` ; ce qui *dessine* vit dans chaque application. Une règle écrite deux
fois finit par diverger (la recherche « Évry » l'a prouvé, D-15) : le banc refuse une
seconde définition de `titreLisible`.

## Ce qui n'existe pas, et pourquoi

- **Pas de serveur applicatif, pas de base de données.** Tout ce que Repère affiche est
  public, publié une fois par jour, et identique pour tous les lecteurs d'un département.
  Un fichier statique derrière un CDN y répond mieux qu'une API, sans journaux d'accès ni
  coût. Critères qui feraient changer d'avis : [donnees.md](donnees.md#quand-une-api-deviendrait-necessaire).
- **Pas de page par commune côté serveur.** Une adresse portant un code de commune révèle
  la commune du lecteur (invariant 2).
