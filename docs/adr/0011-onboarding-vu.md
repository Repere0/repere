# ADR 0011 — `onboardingVu` : la bienvenue passe une fois, même sur un appareil qui garde déjà un profil

- Date : 14 novembre 2026
- Statut : accepté (décision du porteur du 14/11/2026)
- Amende : invariant 2 (contenu de `repere.profil`)

## Le défaut

Sur l'iPhone du porteur : « le logo apparaît, puis on tombe sur l'accueil ; l'écran du prénom ne s'affiche jamais ».
Cinq corrections ont visé la navigation et les animations. Aucune n'a reproduit le défaut : sur le moteur de Safari
(WebKit, profil iPhone, stockage vide), la bienvenue s'ouvrait déjà et la question du prénom était posée.

La cause la plus probable n'était pas dans l'écran, mais dans sa condition : la bienvenue ne s'ouvrait que si
**aucun profil** n'était gardé sur l'appareil. Un téléphone qui utilisait Repère avant le 13/11 gardait un profil
(réglages de lecture, points du quiz) : « profil présent » valait « bienvenue déjà vue », alors qu'elle ne l'avait
jamais été. **Non vérifié sur l'iPhone du porteur** au moment d'écrire : c'est lui qui le confirmera.

## La décision, mot pour mot

> « OUI, on force l'onboarding pour les appareils qui ont déjà un profil. Ajoute un flag `onboardingVu: true` dans
> `repere.profil` quand l'utilisateur termine l'onboarding. Au lancement, si `onboardingVu` est absent ou `false`, on
> affiche l'onboarding même si le profil existe (en gardant les réglages existants : prénom, points, etc.). Une fois
> terminé, on met `onboardingVu: true` et on ne le montre plus jamais. »

## Ce qui est construit

- `onboardingVu`, booléen, dans `repere.profil`. **Pas de troisième clé de stockage.** Jamais transmis.
  Il ne dit qu'une chose : la bienvenue a été terminée sur cet appareil. Ce n'est ni un compteur, ni une date, ni un
  identifiant.
- Seule la bienvenue le pose. Un réglage de lecture ou des points gagnés au quiz ne le changent pas.
- Un profil gardé avant ce jour ne porte pas la clé : il est lu comme « pas encore vu ».
- En terminant la bienvenue, les réglages, les thèmes, les points et le prénom déjà gardés sont **conservés**.
  « Passer » garde le prénom déjà donné. Avant ce jour, terminer la bienvenue réécrivait les réglages par défaut.
- Un lien ouvert sur une page précise n'est toujours pas détourné : la bienvenue ne s'ouvre que depuis l'accueil
  ou au choix d'une commune.

## Conséquence assumée

Tout appareil qui garde déjà un profil verra la bienvenue **une fois** à sa prochaine ouverture depuis l'accueil, y
compris ceux qui l'ont déjà terminée entre le 13 et le 14/11 (leur profil ne porte pas la marque).

## Preuve

- `mono/tests/profil.test.mjs` : la marque est un booléen, fausse par défaut et pour un profil d'avant.
- `apps/mobile/tests/onboarding-web.mjs` (Chromium) et `webkit-iphone-web.mjs` (moteur de Safari, runner seulement) :
  profil déjà gardé, la bienvenue s'ouvre, les réglages sont gardés, elle ne revient pas.
