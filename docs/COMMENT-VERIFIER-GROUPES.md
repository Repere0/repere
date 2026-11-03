# Vérifier les groupes politiques : mode d'emploi (V62)

Ce document est pour le porteur du projet. Il dit ce qui se vérifie **depuis une branche d'essai** et ce qui ne se vérifie **qu'une fois la chaîne sur `main`**.

## Ce qui est vrai avant de commencer

- Une exécution depuis `test/sdk58-expo-go` **ne publie rien** : la garde `HORS_MAIN` de `collecte.yml` bloque l'enregistrement et la publication Netlify. Ce n'est pas un bug.
- La table des groupes est produite par `mono/scripts/collecte-groupes.mjs` depuis l'archive AMO30 de l'Assemblée. Elle n'a **pas encore été vérifiée sur l'archive réelle** : c'est précisément ce que le premier run doit montrer.
- Si la table est absente ou illisible, l'application affiche « Inconnu ». Aucun groupe n'est deviné.

## 1. Déclencher un run d'essai (depuis le téléphone)

1. Ouvrir `github.com/Repere0/repere`, onglet **Actions**.
2. Choisir **Collecte quotidienne**.
3. **Run workflow**, branche **test/sdk58-expo-go**, puis **Run workflow**.
4. Attendre environ 10 à 15 minutes.

## 2. Lire le résultat dans le run

- Dans le **résumé du job** (page du run, en haut), une ligne doit apparaître :
  - `Groupes : X deputes avec groupe identifie, Y sans groupe` : le calcul a abouti.
  - `ECHEC collecte-groupes (code N) : raison` : le calcul a échoué ; la raison est sur la ligne.
- Repères :
  - **X proche de 574** : la lecture d'AMO30 marche. C'est le résultat attendu.
  - **X = 0 ou un refus « lecture insuffisante (seuil 90 %) »** : le format réel de l'archive n'est pas celui que le code attend. Aller à la section 5.

## 3. Ouvrir le fichier produit

- Dans la page du run, section **Artifacts**, télécharger **collectes-essai**.
- Le fichier `deputes-groupes.json` doit contenir :
  - un bloc `source` (producteur, licence, URL) et une date `genere_le` ;
  - un bloc `groupes` dont les clés sont des identifiants `PA…` et les valeurs `{ "groupe": "…", "nom": "…" }`.
- Le fichier n'est **pas** sur le site public tant que la chaîne n'est pas sur `main` (voir section 4).

## 4. Pour que les groupes apparaissent sur le site public

Le code et la publication passent par `main`. **La branche `test/sdk58-expo-go` ne doit pas être fusionnée sur `main` en bloc** (décision D205). Il faut donc une proposition de fusion limitée aux seuls commits « groupes », relue et validée par le porteur, qui passe la protection de `main` (relecture et épreuve obligatoires).

Quand c'est fait, le fichier est vérifiable à l'adresse : `https://repereapp.netlify.app/data/deputes-groupes.json`. Un JSON avec un bloc `source` et des `groupes` doit s'afficher.

## 5. Si le run échoue

Noter dans `BLOCAGES.md` (section 62 ou suivante) :
- ce que dit la ligne « Groupes : … » ou « ECHEC collecte-groupes » du résumé ;
- si le fichier `deputes-groupes.json` est présent dans l'artefact, et ce qu'il contient ;
- le message d'erreur exact.

Ne pas compléter la table à la main. Un député absent de la table reste « Inconnu ».

## 6. Vérifier sur un téléphone (après publication seulement)

- Ouvrir la fiche d'un député : le badge de groupe doit porter son nom, et sa couleur seulement si le libellé figure dans la palette.
- Un groupe dont le libellé n'est pas dans la palette (par exemple `LFI-NFP` aujourd'hui) s'affiche en texte avec le gris « Inconnu ». C'est voulu tant que la correspondance n'a pas été tranchée (voir `docs/adr/0001-couleurs-partis.md`).

## Ce qui n'est pas dans ce document

- Les sénateurs et les scrutins complets (NosParlementaires) : une étape d'essai existe, en artefact seulement (`nosparlementaires-essai`). Aucun écran ne les lit encore, faute de connaître le format réel.
