# Repère — Backlog IA / course bêta IDF

## P0 — sortir une bêta IDF fiable

- [ ] Collecte quotidienne maximale des sources publiques
- [ ] Filtrer uniquement la publication lecteur aux 8 départements IDF : 75, 77, 78, 91, 92, 93, 94, 95
- [ ] Fiabiliser commune → circonscription → député
- [ ] Fiabiliser député → acteurRef → scrutins
- [ ] Provenance obligatoire : producteur, licence, date de mise à jour, URL
- [ ] Ajouter RNE députés / maires / conseillers municipaux au pipeline
- [ ] Pré-agréger les données lourdes au lieu de les envoyer au navigateur
- [ ] Banc automatique sur chaque commit de reprise-idf
- [ ] Corriger les erreurs navigateur réelles avant publication
- [ ] Déployer sur Cloudflare Pages
- [ ] Vérifier PWA/mobile/performance
- [ ] Mesurer couverture des communes IDF et taux de rattachement à une circonscription

## P1 — enrichissement data

- [ ] Résultats électoraux détaillés
- [ ] Finances communales pré-agrégées
- [ ] Marchés publics : étudier une agrégation locale/privacy-compatible
- [ ] Agenda et organes AN
- [ ] Historique des élus et mandats

## P2 — produit

- [ ] Analytics respectueux de la vie privée
- [ ] SEO
- [ ] observabilité
- [ ] partage d'une fiche commune
- [ ] carte IDF si elle apporte une vraie valeur
- [ ] extension hors IDF

## Rust

- [ ] Ne pas réécrire avant mesure
- [ ] Identifier les étapes CPU/mémoire réellement coûteuses
- [ ] Prototyper uniquement le goulot d'étranglement mesuré

## Décisions nécessitant validation humaine

- [ ] Ajouter les secrets Cloudflare dans GitHub Actions
