# Repère — Backlog IA

> Ce fichier avait été écrit avec des barres obliques inverses devant chaque `#`
> et chaque `-` : il ne s'affichait pas comme du Markdown. Corrigé le 28 août
> 2026, en même temps que les états ci-dessous, tous vides alors que la plupart
> étaient faits.

## P0 — Banc de test décembre 2026

- [x] **Stabiliser architecture** — monorepo pnpm + turbo, preact en socle, trois
      écrans chargés à la demande, aucun serveur applicatif en production.
- [x] **Fiabiliser les données** — 34 637 communes réparties sur 104 fichiers
      départementaux, 104 territoires nommés, 577 circonscriptions rattachées à
      leur député, contrôles indépendants qui relisent ce qui vient d'être écrit.
- [x] **Couvrir les parcours principaux par tests** — 29 contrôles statiques et
      41 dans un vrai navigateur, dont le parcours complet serveur éteint.
      `VERDICT : tout passe` au 28 août 2026.
- [x] **Corriger les bugs UX/UI** — dernier en date : le nom du député venait
      après la source du découpage, sans séparation, et cette source semblait le
      couvrir. Trouvé à l'œil sur capture, pas par une assertion.
- [x] **Optimiser performance** — premier écran 21 Ko compressés, un département
      93 Ko compressés, plafond de 120 Ko gardé par un contrôle.
- [x] **Vérifier responsive/mobile** — banc mesuré en 420 px de large ; toute
      cible tactile fait au moins 44 px, contrôlé.
- [ ] **Vérifier déploiement** — BLOQUÉ. Le site en ligne est encore
      l'application mono-fichier ; la chaîne du monorepo ne publie pas, et
      `ci/banc.yml` n'a jamais tourné ailleurs que sur un poste (il attend d'être
      déplacé dans `.github/workflows/`, ce qu'un outil distant ne peut pas
      faire).
- [x] **Vérifier PWA** — service worker installé, deux caches séparés, coquille
      versionnée par le build, données qui survivent au déploiement, ouverture
      hors ligne mesurée serveur éteint.
- [~] **Préparer documentation** — `mono/README.md` à jour, `docs/DEMONSTRATION.md`
      écrit. Reste : une page qui explique la bascule du mono-fichier vers le
      monorepo à quelqu'un qui arrive sur le projet.
- [x] **Préparer démonstration banc de test** — `docs/DEMONSTRATION.md`, parcours
      Ustaritz : commune → territoire → circonscription → député → argent public
      → sources, avec ce que le produit refuse de faire à chaque étape.

## P1 — Startup

- [ ] Proposition de valeur
- [ ] Parcours utilisateur
- [ ] Analytics — à trancher : Repère n'écrit rien sur l'appareil du lecteur et
      n'a pas de serveur applicatif. Une mesure d'audience classique casserait
      l'invariant 2. Ne pas ouvrir ce chantier sans décision explicite.
- [ ] SEO
- [ ] Observabilité
- [ ] Scalabilité

## Décisions nécessitant validation humaine

1. **Basculer la publication** du mono-fichier vers le monorepo — ou publier les
   deux le temps d'une transition. Tant que ce n'est pas tranché, tout ce qui est
   construit dans `mono/` reste invisible pour le public.
2. **Déplacer `mono/ci/banc.yml` dans `.github/workflows/`** : un outil distant
   ne peut pas écrire dans ce dossier, il faut le poser à la main.
3. **Fraîcheur du relevé des députés** : `scripts/deputes.json` est un instantané
   du 26 août 2026. Décider qui le rafraîchit, et à quelle cadence.
