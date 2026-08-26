# Repère — monorepo

> **Ce dossier vit dans `mono/`, à l'intérieur du dépôt Repère.** Le fichier
> mono-HTML de la racine reste la source des données : `extract-html.js` le lit.
> La chaîne `collecte.yml` continue de publier le site actuel ; celle du monorepo
> construit et éprouve **sans publier**, tant que la bascule n'est pas décidée.

Qui décide chez vous, et où va votre argent. Pour les 34 875 communes de France,
à partir des sources officielles.

## Ce que fait ce dépôt

Il transforme le fichier mono-HTML de Repère (17,3 Mo) en un site qui charge
**54 Ko compressés** au premier écran, puis **une centaine de kilo-octets** par
département — et qui fonctionne hors ligne.

| mesure du 25 août 2026 | valeur |
|---|---|
| premier écran | 164 Ko, **54 Ko compressés** |
| + un département (le 64) | 186 Ko, 70 Ko compressés |
| fichier mono-HTML actuel | 16,5 Mo |
| départements produits | 104 |
| communes réparties | 34 637 |
| département médian | 108 Ko |
| contrôles d'invariants | **13 statiques + 21 dans un navigateur** |

## Démarrer

```bash
pnpm install
pnpm extract  ../app_repere_v18_20.html ./data          # lit les blocs REPERE_*
pnpm dev                                                # web + api de dev
```

```bash
pnpm test                        # invariants statiques, sans navigateur
pnpm build && cp -r data apps/web/dist/data
node scripts/empreinte-sw.mjs apps/web/dist
node tests/runtime.test.mjs apps/web/dist   # invariants dans un navigateur
```

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

## Les huit invariants

Ils sont dans `packages/data-utils/src/invariants.js`, sous forme de données : les
tests les importent, l'écran « Sources » les affiche. Chacun déclare le contrôle
qui le garde — un invariant sans contrôle est une intention, pas une règle.

## Arborescence

```
apps/web            React + Vite. Écrans chargés à la demande.
apps/api            serveur de DÉVELOPPEMENT uniquement.
packages/ui         jetons CSS et composants. Aucun composant « squelette ».
packages/data-utils invariants, magasin IndexedDB, client de données.
scripts/            extraction et empreinte du service worker.
tests/              13 contrôles statiques + 21 dans un navigateur.
data/               engendré. Ne pas modifier à la main.
```
