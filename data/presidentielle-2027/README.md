# Présidentielle 2027 : les fichiers publiés et leur collecte

Quatre fichiers lus par l'application (`candidats.json`, `debats.json`, `meetings.json`, `meta.json`),
schéma dans `mono/packages/core/src/types/elections.ts`. Un fichier vide est un état normal :
l'application dit alors l'absence. `sources.json` n'est jamais publié.

## Décisions du porteur, 10 novembre 2026

> **Exception du 12/11/2026 (porteur)** : `candidats.json` porte des **candidatures déclarées** (`statut: "declare"`),
> relevées dans la presse le 11/11/2026, chacune avec **deux sources** datées (règle dans `@repere/core`,
> `candidatValide`). Ordre alphabétique, aucun classement. Photos (ADR 0008) : produites par la chaîne dans `photos.json`, jamais saisies ici ; jamais de couleur de parti. À remplacer par la liste officielle en mars 2027.

1. **Candidats : aucune collecte automatique.** Saisie à la main dans `candidats.json` en mars 2027,
   quand le Conseil constitutionnel aura publié la liste. Mettre à jour `meta.json` (date, source) dans
   le même commit.
2. **Débats et réunions publiques : flux RSS autorisés, toujours au brouillon.** Chaque source est
   déclarée avec `"publier": false`. Les entrées lues vont dans `data/auto/presidentielle-brouillon.md` ;
   le porteur relit chaque entrée contre sa page, puis la recopie à la main dans `debats.json` ou
   `meetings.json`, avec `sourceUrl`.
3. **Presse généraliste : refusée** (`CONTEXTE_PROJET.md` § 10, maintenu). Seuls des producteurs
   officiels : institutions, chaînes pour leurs propres débats, sites de campagne pour leurs réunions.

## Décisions du porteur, 13 novembre 2026

- **Cap** : on ne se bat pas sur la présidentielle en profondeur. Le minimum suffit : liste officielle (mars 2027),
  liens, temps de parole Arcom en brouillon. L'énergie va au local, le vrai différenciateur de Repère.
- **Programmes** : la décision 1 du 10/11 est maintenue. Aucune publication automatique tant qu'aucune source
  officielle sous licence claire n'existe (recherche : `docs/sources-programmes-candidats.md`, PR #214). Un jeu sous
  licence ouverte compilé par un tiers n'est pas une source officielle ; la licence CC BY-NC-SA est refusée.
- **`siteCampagne`** : champ facultatif de `candidats.json`. Chaque adresse est ouverte à la main pour confirmer
  qu'elle répond et qu'elle est bien celle du candidat. **Aucun contenu n'est copié.** Site mort, introuvable ou
  simple site générique de parti : pas d'adresse. Le 13/11 le champ n'était pas affiché (huit candidats
  sur vingt-cinq) ; le porteur a levé cette réserve le 14/11 (voir plus bas) : il est affiché quand il existe.

### Décisions du porteur, 14 novembre 2026 (13 adresses sur 25)

- **Zemmour** (https://www.ericzemmour.fr) et **Tondelier** (https://marinetondelier.fr) : inscrits **sur décision du
  porteur**, qui les tient pour leurs sites de campagne officiels. Le relevé n'avait qu'un indice (le site se dit de campagne).
- **Site de parti ou de mouvement** : inscrit si et seulement si sa page d'accueil mentionne explicitement la campagne
  présidentielle 2027. Rouverts le 14/11 : **Asselineau** (https://www.upr.fr), **Egger** (https://solutiondemocratique.fr),
  **Lisnard** (https://www.unenouvelleenergie.fr) : oui, inscrits.
- **Non inscrits** : Markovic (parti-animaliste.fr : aucune mention) ; Philippot (les-patriotes.fr : un appel au
  soutien « Élections 2027 », pas de candidature nommée) ; Retailleau (republicains.fr : 2027 et son équipe n'apparaissent
  que dans des articles d'actualité, cas limite laissé au porteur) ; Branco (2027.juanbranco.org, adresse donnée par
  le porteur : **non ouverte**, l'outil de lecture n'a pas eu l'autorisation, donc non inscrite).
- **Affichage** : le lien « Site de campagne » paraît sur la carte du candidat quand l'adresse existe, avec la phrase
  « Lien vers le site officiel de campagne, quand il existe. » (porteur : ce n'est pas une inégalité, c'est l'état des données).
- melenchon2027.fr : laissé en l'état, le porteur vérifiera à la main.

### Suite du 14 novembre 2026 (14 adresses sur 25)

- **Branco** : https://2027.juanbranco.org ouverte avec l'autorisation du porteur ; la page d'accueil présente
  explicitement la candidature de 2027 (logo « Les Ruches », éditeur non indiqué). **Inscrite.**
- **Philippot** : lespatriotes.fr interdit la lecture automatique, donc non vérifiée. Le site du parti,
  les-patriotes.fr, rouvert ce jour, ne présente aucune candidature : seulement un appel au soutien financier pour les
  « Élections 2027 ». **Non inscrit.**
- **Retailleau** : **non** (porteur). Une actualité sur ses porte-paroles n'est pas une plateforme de campagne ;
  mieux vaut une absence qu'une donnée ambiguë. À ajouter si un vrai site de campagne ouvre.

### Relevé du 13/11/2026 (8 adresses sur 25)

Règle d'inscription : le site se présente comme la campagne 2027 du candidat **et** un second indice le confirme.

| Candidat | Adresse | Second indice |
|---|---|---|
| Arthaud | https://www.nathalie-arthaud.info | lien depuis lutte-ouvriere.org |
| Attal | https://attalpresident.fr | bannière de parti-renaissance.fr |
| Dupont-Aignan | https://www.dupontaignan.fr | lien depuis debout-la-france.fr |
| Glucksmann | https://glucks2027.fr | menu de place-publique.eu |
| Le Pen | https://marinelepen.com | annonce relayée par la presse (07/07/2026) |
| Mélenchon | https://melenchon2027.fr | mentions légales : édité par La France insoumise |
| Philippe | https://edouardphilippe.fr | pied de page : association de financement de la campagne |
| Ruffin | https://nouspresident.fr | liens depuis debout.fr |

Limite : pour melenchon2027.fr, la page des mentions légales a répondu, la page d'accueil a refusé deux fois
l'outil de lecture (erreur côté site). À rouvrir dans un navigateur.

**Non inscrits, à trancher par le porteur :**
- un seul indice (le site se dit de campagne, rien d'autre ne le confirme) : Zemmour (ericzemmour.fr),
  Tondelier (marinetondelier.fr) ;
- la campagne vit sur le site du parti ou du mouvement, pas de site dédié trouvé : Asselineau (upr.fr),
  Branco (ruches.org), Egger (solutiondemocratique.fr), Lisnard (unenouvelleenergie.fr), Labib (rubrique de
  npa-revolutionnaires.org), Mikolajczak (page de parti-equinoxe.fr) ;
- site de parti sans lien vers une campagne : Philippot, Retailleau, Markovic ;
- site qui interdit la lecture automatique, donc non vérifié : Kazib (anassekazib.fr) ;
- rien trouvé : Lalanne, Mathieu, Polony, Riner, Roussel.

Méthode : recherche web, fiches du site tiers votons-2027.fr comme simple piste (jamais comme source), puis
ouverture de chaque site. Pas de recherche exhaustive : une absence ici ne prouve pas qu'aucun site n'existe.

Le script applique ces décisions : par défaut il n'écrit aucun fichier publié et ignore toute source
de type `candidats` (contrôle dans `mono/tests/collecte-presidentielle.test.mjs`).

## Brancher un flux

1. Lire la vraie réponse du flux (skill `ingerer-une-source`). Aucune adresse n'est devinée.
2. Recopier le bloc `exemple_non_lu` de `sources.json` dans la liste `sources`, avec la vraie adresse
   (https), le nom du producteur et le type (`debats` ou `meetings`).
3. La collecte quotidienne (`outils/pipeline.sh`) le lit dès le lendemain. Une source en échec ne casse
   rien : elle est nommée dans le brouillon.

Essai sans réseau, sans écriture, depuis `mono/` :
`node scripts/collecte-presidentielle.mjs --collecter --dry-run --fixtures tests/fixtures/presidentielle`
