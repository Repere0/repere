# REPÈRE — REPRISE PAR UN AUTRE AGENT
**Écrit le 13 septembre 2026.** À lire en entier avant de toucher au dépôt. Ce document existe
parce que la mémoire de contexte ne survit pas à une session.

---

## 1. LES SIX MINUTES QUI ÉVITENT UNE JOURNÉE PERDUE

```
git status          ← AVANT TOUT. Voir la section 2 : le dépôt s'est bloqué deux fois.
git branch          ← sur quelle branche suis-je ?
git log --oneline -5
git diff
```

**Branche de travail : `audit-finalisation-repere`. `main` est protégée.**
Si `git status` montre un rebase en cours ou un HEAD détaché : **ne rien écrire**, lire la
section 2.

Puis, pour voir où en est le produit :
```
cd mono
pnpm install --frozen-lockfile
node scripts/extract-html.js "$(ls -1 ../app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)" ./data
pnpm build
node --test tests/invariants.test.mjs        → doit afficher 44/44
node tests/runtime.test.mjs apps/web/dist    → doit finir par « VERDICT : tout passe » (64)
```

Et pour regarder de vrais écrans :
```
node tests/beta_idf.mjs apps/web/dist   → les huit départements, un tableau à relire
node tests/poids.mjs apps/web/dist      → ce que pèse vraiment une première visite
```

---

## 2. LES PIÈGES DE CE DÉPÔT — tous rencontrés pour de vrai

**a) La tâche horaire `pousser.bat` s'exécute sur la branche courante.**
Laisser le dépôt sur `main` fait avancer `main` sans la branche, et l'avance rapide devient
impossible. La version 7 refuse tout commit automatique sur `main` — **ne pas revenir en arrière
là-dessus.**

**b) Elle rebasait la branche sur `main` à chaque passage.**
Dès que `main` a divergé, le rebase a bloqué le dépôt : HEAD détaché, marqueurs de conflit dans un
fichier source, plus rien de poussable pendant huit heures. Corrigé en v7 : sur une branche de
travail, `fetch` seulement.

**c) `.github/workflows/` est protégé en écriture** contre les outils distants. Un workflow modifié
se dépose dans `mono/ci/` et se copie à la main.

**d) Le conteneur de développement ne joint ni `data.gouv.fr`, ni `insee.fr`, ni `ofgl.fr`, ni
`data.assemblee-nationale.fr`.** Toute collecte passe par GitHub Actions. `WebFetch`, lui, atteint
ces sites en lecture : c'est ainsi qu'on vérifie une licence ou une date, jamais en supposant.

**e) Deux fichiers ne doivent jamais être chargés en entier** : `app_repere_v18_20.html` (17 Mo) et
les paquets départementaux. Lire par `grep` et plages de lignes.

**f) Le contrôle de l'invariant 3 cherche des mots de classement dans le code écrit** — y compris
dans les commentaires. Écrire « pire », « classement » ou « score » dans un commentaire fait
échouer le banc. Le projet s'y est fait prendre quatre fois.

---

## 3. CE QUI EST VRAI AUJOURD'HUI

- **Couverture Île-de-France** : maire 100 %, circonscription 100 %, député 100 %, votes 99,6 %,
  comptes 100 %, sur 1 262 communes. **Ce n'est pas le problème.**
- **Poids** : 107 Ko compressés pour tout le parcours, puis plus aucune requête.
- **Banc** : 44 contrôles statiques, 64 navigateur.
- **Deux zéros** : aucune intercommunalité, aucun événement daté. **C'est le problème.**
- **Rien n'est publié.** Le monorepo n'a pas d'URL.

---

## 4. CE QUI BLOQUE, ET QUI NE PEUT PAS ÊTRE FAIT SANS UN HUMAIN

1. **Fusionner la branche dans `main`** — sans quoi aucune tâche planifiée ne se déclenche
   (GitHub ne les exécute que sur la branche par défaut).
2. **Trois secrets Cloudflare** (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `CF_PAGES_PROJECT`) — sans quoi il n'y a pas d'URL, donc pas de bêta.
3. **Supprimer `mono/apps/web/public/data/deputes.json`** — 87 Ko sans producteur ni licence ni
   date ; les outils distants ne peuvent pas effacer un fichier.

---

## 5. LA PROCHAINE CHOSE À FAIRE

**La surface datée « Ce qui a été décidé ».** C'est le seul chantier qui donne une raison de
revenir, et il est documenté de bout en bout :
- la source principale est vérifiée et prête (`DATA_CATALOG.md` § 2.1) ;
- l'architecture cible est arrêtée (`DECISIONS.md` D-01, D-03) ;
- les règles de présentation sont écrites (`UX_PRINCIPLES.md` P4, P12).

**Ne pas commencer les marchés publics avant que la surface datée vive.** Le coût est réel et la
valeur ne se révèle qu'une fois le contenant existant.

---

## 6. COMMENT TRAVAILLER ICI

- **Mesurer avant de conclure.** Chaque décision du registre porte le chiffre qui l'a tranchée.
- **Regarder les captures.** Sur les défauts trouvés le 13 septembre, quatre l'ont été à l'œil,
  aucun par une assertion. Les assertions gardent ce qu'on sait déjà.
- **Écrire le contrôle en même temps que la correction.** Une règle sans contrôle se perd en trois
  semaines.
- **Ne jamais combler un trou par une supposition.** Écrire « non vérifié » est une réponse
  acceptable ; une estimation présentée comme un fait ne l'est pas.
- **Ne pas ajouter de fonctionnalité pour ajouter une fonctionnalité.** Une donnée de plus qui
  rend l'écran moins compréhensible est un recul.

---

## 7. OÙ EST LE RESTE

| document | ce qu'il contient |
|---|---|
| `PRODUCT_NORTH_STAR.md` | la question, la proposition de valeur, ce que le produit n'est pas |
| `repere_autonomous_product_audit.md` | l'audit complet, les trois leviers |
| `DATA_CATALOG.md` | les sources vérifiées, celles écartées et pourquoi |
| `ROADMAP_BETA_IDF.md` | les quatre phases, ce qui est fait, ce qui bloque |
| `BETA_READINESS.md` | toutes les mesures de couverture, poids, accessibilité |
| `HYPOTHESES.md` | ce qu'on croit sans l'avoir prouvé, et comment le tester |
| `DECISIONS.md` | les seize décisions tranchées, à ne pas rouvrir sans preuve |
| `UX_PRINCIPLES.md` | les quinze principes, chacun avec le défaut qui l'a imposé |
