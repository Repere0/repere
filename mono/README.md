# Repère — monorepo

> **Ce dossier vit dans `mono/`, à l'intérieur du dépôt Repère.** Le fichier
> mono-HTML de la racine reste la source des données : `extract-html.js` le lit.
> La chaîne `collecte.yml` continue de publier le site actuel ; celle du monorepo
> construit et éprouve **sans publier**, tant que la bascule n'est pas décidée.

Qui décide chez vous, et où va votre argent. Pour les 34 637 communes que portent les fichiers officiels,
à partir des sources officielles.

## Ce que fait ce dépôt

Il transforme le fichier mono-HTML de Repère (17,3 Mo) en un site qui charge
**21 Ko compressés** au premier écran, puis **une centaine de kilo-octets** par
département — et qui fonctionne hors ligne.

| mesure du 26 août 2026 | valeur |
|---|---|
| premier écran | 57 Ko, **21 Ko compressés** |
| dont le socle de rendu | 19,5 Ko, 7,8 Ko compressés |
| + un département (le 64) | 248 Ko, 93 Ko compressés |
| fichier mono-HTML actuel | 16,5 Mo |
| départements et collectivités | 104, tous nommés |
| communes réparties | 34 637 |
| département médian | 107 Ko |
| contrôles d'invariants | **21 statiques + 34 dans un navigateur** |

Le premier écran ne demande qu'un seul fichier de données : `data/index.json`.
Aucun paquet départemental n'est téléchargé avant que le lecteur ait choisi son
département.

## Démarrer

```bash
pnpm install
pnpm extract  ../app_repere_v18_20.html ./data          # lit les blocs REPERE_*
pnpm dev                                                # web + api de dev
```

```bash
pnpm build          # vite + copie de data/ dans dist/ + empreinte du service worker
pnpm test           # 21 contrôles statiques, puis 34 dans un vrai navigateur
```

`pnpm build` copie `data/` dans `dist/` lui-même, avec un script Node : la
commande est la même sous Windows, sous macOS et sous Linux. `pnpm test` a besoin
d'un `pnpm extract` (pour `data/`) et d'un `pnpm build` (pour le banc navigateur).

## Les décisions qui ne se discutent pas

1. **Aucun serveur applicatif en production.** `apps/api` sert au développement
   seulement ; `data/` est publié tel quel par n'importe quel hébergeur statique.
   Un serveur, ce sont des journaux d'accès — donc des adresses IP, donc de la
   donnée personnelle — et un hébergement à payer.
2. **Aucune adresse ne porte un code de commune.** La maille est le département.
   Une seule fonction compose les adresses, et un contrôle vérifie qu'aucune autre
   ne le fait.
3. **Deux caches, pas un.** La coquille est versionnée par le build ; les données
   ne le sont pas. Sinon la publication quotidienne effacerait le département de
   chaque lecteur chaque matin.
4. **Aucune police chargée depuis un hôte tiers.** Un lien vers `fonts.googleapis.com`
   ferait connaître à Google l'adresse IP de chaque lecteur, à chaque ouverture.
5. **IndexedDB ne reçoit que de la donnée publique.** Une garde refuse toute
   écriture qui n'est pas un paquet départemental, et un contrôle vérifie qu'il
   n'existe qu'un seul magasin.
6. **Deux thèmes, un seul seuil de lisibilité.** Le thème sombre n'est pas une
   variante décorative : un contrôle mesure le contraste réel de chaque texte
   coloré dans un navigateur en thème sombre, et refuse tout ce qui passe sous
   3:1. La couleur d'échelon reste sur le filet des cartes ; elle ne porte le
   titre que là où elle est lisible.

## Ce que le lecteur voit, dans cet ordre

1. **Où je suis** — un département, puis une commune. Le département se cherche
   par son nom autant que par son numéro (« pyrenees at », « cotes armor », « 64 ») :
   savoir qu'on habite « dans le 64 » n'est pas un prérequis pour entrer.
   Le choix de la commune est fait UNE fois : il ne se refait pas à chaque
   onglet, et une ligne le rappelle au-dessus des onglets.
2. **Qui décide** — le maire, ses adjoints, la circonscription législative.
3. **Où va l'argent** — six montants publiés, puis ce qu'ils veulent dire.
4. **D'où ça vient** — chaque carte porte sa source, son producteur et sa date.
5. **Donnée ou calcul** — deux étiquettes qui ne se confondent pas :
   « Donnée officielle » pour ce qui est publié tel quel, « Calcul Repère » pour
   ce que Repère déduit. Un contrôle navigateur vérifie que les deux sont là et
   qu'elles diffèrent.

## Le socle de rendu

`preact/compat`, par alias dans `apps/web/vite.config.js`. Le socle React pesait
141,8 Ko — 82 % du premier écran d'un produit dont l'argument est de peser peu.
Repère n'utilise de React que `createRoot`, `StrictMode`, `lazy`, `Suspense` et
les hooks d'état : preact les implémente pour 19,5 Ko. Aucun fichier de
l'application n'a changé, et le banc navigateur mesure le résultat sur
l'application réelle. Un contrôle statique refuse un alias incomplet et un socle
qui regrossirait.

## D'où viennent les noms des départements

Le fichier mono-HTML ne porte que des codes. Les noms sont relevés **une fois**
auprès de sources officielles et rangés dans `scripts/noms-territoires.json`,
avec leur producteur, leur licence et la date du relevé ; `extract-html.js` les
fond dans `index.json`. Le build ne touche donc pas au réseau, l'application ne
demande pas un fichier de plus, et l'écran « Sources » affiche ces producteurs
comme les autres. Un contrôle refuse un territoire publié sans nom.

## Les huit invariants

Ils sont dans `packages/data-utils/src/invariants.js`, sous forme de données : les
tests les importent, l'écran « Sources » les affiche. Chacun déclare le contrôle
qui le garde — un invariant sans contrôle est une intention, pas une règle.

## Arborescence

```
apps/web            Preact + Vite. Écrans chargés à la demande.
                    public/ : service worker, manifeste, icônes de la PWA.
apps/api            serveur de DÉVELOPPEMENT uniquement.
packages/ui         jetons CSS et composants. Aucun composant « squelette ».
packages/data-utils invariants, magasin IndexedDB, client de données.
scripts/            extraction, copie de data/ et empreinte du service worker.
tests/              21 contrôles statiques + 34 dans un navigateur.
data/               engendré. Ne pas modifier à la main.
```
