# Démonstration de Repère — Ustaritz, en six écrans

Ce document se lit sans connaître le code. Il décrit ce qu'un spectateur voit,
dans l'ordre, et ce que Repère affirme à chaque étape. Chaque affirmation
présentée comme officielle porte à l'écran son producteur, sa licence et sa date.

**Ce qui est démontré ici est le monorepo (`mono/`), pas le site actuellement en
ligne.** Le site en ligne, au 28 août 2026, est encore l'application mono-fichier
de 17 Mo. Voir « Ce qui n'est pas encore vrai », à la fin.

Pour lancer la démonstration sur un poste :

```bash
cd mono
pnpm install
pnpm extract ../app_repere_v18_20.html ./data
pnpm build
npx serve apps/web/dist        # ou n'importe quel serveur de fichiers statiques
```

---

## 1. Premier écran — « Où je suis »

Le titre dit la promesse en une phrase : *Qui décide chez vous, et où va votre
argent.* Sous le titre, une seule chose à faire : choisir un département, par son
nom ou par son numéro (« pyrenees at », « 64 », « cotes armor » fonctionnent tous
les trois — sans accents, sans traits d'union).

**Ce qui compte pour un spectateur :** rien n'est demandé. Pas de compte, pas de
courriel, pas d'adresse, pas de bandeau de cookies — il n'y a rien à accepter,
parce qu'il n'y a rien à collecter. Le premier écran pèse **21 Ko compressés**.

**Ce qui est mesuré :** un contrôle refuse de laisser le premier écran dépasser
120 Ko, et un autre vérifie qu'aucune adresse demandée par l'application ne porte
un code de commune — le serveur n'apprend jamais où habite le lecteur, seulement
quel département il a ouvert.

## 2. Le territoire — les Pyrénées-Atlantiques

Le département choisi, l'application télécharge **un seul fichier** : celui du 64
(190 Ko). La longue liste des 104 territoires se replie sur une ligne : ce que le
lecteur est venu voir passe devant le moyen d'y arriver.

**À dire à voix haute :** la maille est le département, jamais la commune. C'est
une décision d'architecture, pas un détail technique : un fichier par commune
révélerait au serveur la commune consultée.

## 3. La commune — Ustaritz

On tape « Ustaritz ». Une ligne rappelle en permanence où l'on est —
*Ustaritz · Pyrénées-Atlantiques (64)* — et elle ne bouge plus quand on change
d'onglet. Le titre de l'onglet du navigateur devient « Ustaritz — Repère ».

## 4. Qui décide — la commune, puis la circonscription, puis le député

**Carte 1 — Ustaritz.** Le maire, **Piero ROUGET**, et le nombre d'adjoints qui
siègent avec lui (8). Aucune étiquette politique, aucun parcours : le Répertoire
national des élus n'en contient pas, et Repère n'en invente pas.
*Source affichée : Ministère de l'Intérieur · ODbL 1.0 · mise à jour du 11 août 2026.*

**Carte 2 — À l'Assemblée nationale.** Deux blocs séparés par un filet, parce
qu'ils n'ont pas le même producteur :

- la **6e circonscription législative**, celle où vote Ustaritz.
  *Source : Ministère de l'Intérieur · Licence Ouverte · découpage de 2010.*
- le député qui y siège, **Peio Dufau**, mandat ouvert depuis le 7 juillet 2024,
  17e législature.
  *Source : Assemblée nationale — Acteurs, mandats et organes · Licence Ouverte 2.0
  · relevé le 26 août 2026.*

**Ce qui se dit ici, et qui est le cœur de la démonstration :** ce lien
commune → circonscription → député n'existe dans aucune source unique. Le
Répertoire des élus ne le porte pas. Il est construit en rapprochant deux
fichiers officiels, et le rapprochement est affiché avec les deux sources, pas
avec une seule qui couvrirait les deux.

**Ce que Repère refuse de faire, et qu'il faut montrer :** ouvrir une commune à
cheval sur plusieurs circonscriptions (par exemple une grande ville). Aucun nom
n'apparaît : laquelle est la vôtre dépend de votre adresse, et Repère ne la
demande pas. Il écrit la phrase au lieu de deviner.

## 5. Où va l'argent — six montants, et ce qu'ils veulent dire

Six agrégats publiés pour Ustaritz : recettes, dépenses, dette, investissement,
frais de personnel, impôts et taxes. Chacun est traduit en une phrase de français
courant (« ce qu'elle encaisse », « ce qu'elle doit »).

**Deux étiquettes qui ne se confondent jamais :** « Donnée officielle » pour ce
qui est publié tel quel, « Calcul Repère » pour ce que Repère déduit — un montant
par habitant, par exemple, est un calcul et le dit.
*Source : Observatoire des finances et de la gestion publique locales (OFGL) ·
Licence Ouverte 2.0.*

**Aucune comparaison entre territoires, aucun classement.** Les barres comparent
les montants d'une même commune entre eux, jamais deux communes : le composant ne
sait pas en dessiner deux, et un contrôle le vérifie.

## 6. Sources — le produit se rend vérifiable

L'écran liste les producteurs de chaque famille de données, avec licence et date,
puis les **huit invariants** de Repère — et, pour chacun, le nom du contrôle
automatisé qui échoue si la règle est enfreinte. Un invariant sans contrôle est
une intention, pas une règle ; la liste le dit elle-même.

## 7. Le tour de force — couper le réseau

Éteindre le Wi-Fi, recharger la page. L'application s'ouvre, le département déjà
consulté revient, on peut encore naviguer. Un département jamais téléchargé ne
ment pas : il l'écrit, et ne propose pas de bouton « Réessayer » qui ne pourrait
pas aboutir.

C'est mesuré **serveur réellement éteint**, pas avec une coupure simulée : la
distinction a déjà révélé un défaut que la simulation masquait.

---

## Ce qui n'est pas encore vrai, et qu'il ne faut pas laisser croire

1. **Le site en ligne n'est pas ce produit.** `repereapp.netlify.app` sert
   toujours l'application mono-fichier. La chaîne du monorepo construit et
   éprouve, mais ne publie pas.
2. **Le nom des maires vient du Répertoire national des élus au 11 août 2026.**
   Il n'a pas été recoupé commune par commune.
3. **Le découpage électoral date de 2010** (fichier ministériel de 2017) : 11
   communes nouvelles n'y figurent pas, et l'écran le dit dans ces mots.
4. **118 communes sont à cheval sur plusieurs circonscriptions** : elles
   n'affichent aucun député, volontairement.
5. **Aucune donnée de présence, d'absence ou de patrimoine**, ici comme partout
   ailleurs dans Repère.
