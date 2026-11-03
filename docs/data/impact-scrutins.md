# Fiches « impact concret » des scrutins (V42, bloc 1)

Fichier : `data/contenu/impact-scrutins.json`. Une fiche par scrutin, 19 au total :
12 avec un impact rédigé, 7 à `null`.

## Ce que contient une fiche

| Champ | Contenu |
|---|---|
| `n` | numéro du scrutin à l'Assemblée nationale |
| `titre_officiel` | titre copié tel quel des données locales (`outils/scrutins_an.json`) ou du brouillon `data/auto/scrutin-*.md` |
| `impact_citoyen` | une à deux phrases, ou `null` |
| `source_url` | `https://www.assemblee-nationale.fr/dyn/17/scrutins/{n}`, même motif que les données |
| `relecture_ceo` | `false` tant que le CEO n'a pas relu la fiche |

## Règles appliquées

- **Factuel, à partir du titre seulement.** Chaque impact dit ce que le texte vise, et son étape
  (première lecture, commission mixte paritaire, lecture définitive). Aucune phrase n'annonce un effet
  que le titre ne décrit pas. Le test `mono/tests/impact-scrutins.test.mjs` refuse les mots de jugement.
- **`null` pour une motion, un amendement, un sous-amendement ou une proposition de procédure.**
  Leur titre ne dit pas ce qui change pour une personne. Les titres tronqués à la source (7 fiches) sont
  aussi à `null` : le titre complet n'est pas disponible localement.
- **Pas de date future, pas de chiffre** : aucune fiche ne contient de montant, de pourcentage ou de date
  d'application.

## Procédure : le CEO relit

1. Lancer l'application en développement et ouvrir la route `/dev-impact` (écran « Aperçu impacts (dev) »).
   Hors `__DEV__` (production), cette route ne rend rien.
2. Pour chaque fiche, comparer `impact_citoyen` au titre affiché, et au texte officiel du scrutin.
3. Corriger le fichier `data/contenu/impact-scrutins.json` dans le dépôt, en modifiant la phrase.
4. Passer `relecture_ceo` à `true` seulement pour une fiche relue et juste.
5. Commiter la relecture avec un message du type `feat(contenu): relecture CEO scrutins n° ...`.

L'écran ne modifie rien et ne publie rien : la relecture passe toujours par le fichier, donc par une
modification relue dans le dépôt.

## Ce qui n'est pas fait, et pourquoi

- **15 à 20 scrutins « les plus importants » : 12 fiches exploitables seulement.** Les données locales ne
  contiennent que 12 scrutins avec leur titre complet. Le site de l'Assemblée n'est pas joignable depuis la
  session. Les 7 autres sont des motions ou amendements (voir ci-dessus).
- **L'impact n'explique pas ce que le texte change pour une personne.** Le titre décrit l'objet du texte,
  pas son contenu. La phrase « Ce qui change pour moi » exigerait de lire le texte adopté, ce qui n'a pas été
  fait. C'est la première décision à prendre : garder ce niveau de factualité, ou ouvrir la lecture des
  textes adoptés (voir `BLOCAGES.md`).
- **Longueur** : les impacts font deux phrases au plus, de 112 à 197 caractères. Le brief dit « deux lignes
  max » ; une « ligne » sur mobile tient environ 45 caractères, donc un impact peut dépasser deux lignes
  affichées. À raccourcir si le CEO le juge trop long.
- **Source** : le motif d'URL suit celui des données. Son accès n'a pas été vérifié depuis la session.
